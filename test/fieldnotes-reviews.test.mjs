import test from 'node:test';
import assert from 'node:assert/strict';
import { saveReview } from '../src/lib/fieldnotes/reviews.mjs';
import { reviewStorageKey } from '../src/lib/fieldnotes/storage.mjs';
import { applyShoppingFeedback } from '../src/lib/fieldnotes/feedback-state.mjs';

function fixture(id = 'fixture-item', reviewKey = 'fixture-shop:inventory-001') {
  const candidate = { id, title: 'Synthetic sample', brand: 'Fixture brand', url: 'https://shop.example.invalid/products/fixture', score: 74 };
  return { item: { reviewKey, status: 'new', candidate }, manifest: { candidates: [candidate] } };
}

// Capture each GET before waiting at a barrier. The CAS then compares the actual
// current value, so overlapping saves must exercise saveReview's retry path.
class ConditionalMemoryStore {
  values = new Map();
  reads = [];
  comparisons = [];
  barriers = new Map();

  overlapNextReads(key, count = 2) {
    let release;
    const promise = new Promise(resolve => { release = resolve; });
    this.barriers.set(key, { count, arrivals: 0, promise, release });
  }

  async get(key) {
    const value = this.values.get(key) ?? null;
    this.reads.push({ key, value });
    const barrier = this.barriers.get(key);
    if (barrier) {
      barrier.arrivals++;
      if (barrier.arrivals === barrier.count) {
        this.barriers.delete(key);
        barrier.release();
      }
      await barrier.promise;
    }
    return value;
  }

  async getMany(keys) { return Promise.all(keys.map(key => this.get(key))); }

  async compareAndSwap(key, previous, next) {
    const current = this.values.get(key) ?? null;
    const accepted = current === previous;
    this.comparisons.push({ key, previous, next, accepted });
    if (accepted) this.values.set(key, next);
    return accepted;
  }

  record(key) { return JSON.parse(this.values.get(key)); }
}

test('a first review stores its decision, note, feedback counter, and learning snapshot together', async () => {
  const store = new ConditionalMemoryStore();
  const { item, manifest } = fixture();
  const originalItem = structuredClone(item);
  const originalManifest = structuredClone(manifest);
  assert.equal(await saveReview(store, item, { id: 'fixture-item', status: 'liked', note: 'Check sleeve length.' }, manifest), true);
  const record = store.record(reviewStorageKey(item.reviewKey));
  assert.equal(record.revision, 1);
  assert.equal(record.state.status, 'liked');
  assert.equal(record.state.reviewNote, 'Check sleeve length.');
  assert.equal(record.state.feedbackCount, 1);
  assert.deepEqual(record.state.signals, ['positive']);
  assert.equal(record.events.length, 1);
  assert.equal(record.events[0].type, 'shopping_feedback');
  assert.equal(record.events[0].needsReview, false);
  assert.deepEqual(record.events[0].candidateIds, ['fixture-item']);
  assert.deepEqual(record.events[0].intents, ['positive']);
  assert.equal(record.events[0].raw, 'Check sleeve length.');
  assert.deepEqual(record.events[0].candidateSnapshots, manifest.candidates);
  assert.equal(record.state.lastFeedbackAt, record.events[0].receivedAt);
  assert.ok(Number.isFinite(Date.parse(record.events[0].receivedAt)));
  assert.deepEqual(item, originalItem);
  assert.deepEqual(manifest, originalManifest);
});

test('overlapping GETs retry a losing CAS without losing the other device note, counter, or event', { timeout: 3000 }, async () => {
  const store = new ConditionalMemoryStore();
  const { item, manifest } = fixture();
  const key = reviewStorageKey(item.reviewKey);
  store.overlapNextReads(key);
  assert.deepEqual(await Promise.all([
    saveReview(store, item, { id: 'fixture-item', status: 'liked', note: 'Keep this note from device A.' }, manifest),
    saveReview(store, item, { id: 'fixture-item', status: 'watching', note: '' }, manifest),
  ]), [true, true]);
  assert.deepEqual(store.reads.slice(0, 2), [{ key, value: null }, { key, value: null }], 'both devices actually read the absent revision');
  assert.equal(store.comparisons.filter(value => !value.accepted).length, 1, 'a real conditional update must reject the stale save');
  assert.equal(store.reads.length, 3, 'the loser rereads the winner before retrying');
  const record = store.record(key);
  assert.equal(record.revision, 2);
  assert.equal(record.state.feedbackCount, 2);
  assert.equal(record.state.status, 'watching');
  assert.equal(record.state.reviewNote, 'Keep this note from device A.');
  assert.deepEqual(record.state.signals, ['positive', 'watch']);
  assert.equal(record.events.length, 2, 'rejected CAS attempts do not become duplicate events');
  assert.deepEqual(record.events.map(event => event.intents), [['positive'], ['watch']]);
  assert.deepEqual(record.events.map(event => event.raw), ['Keep this note from device A.', 'Browser: watching']);
});

test('overlapping explicit note edits retain both events and the last committed note', { timeout: 3000 }, async () => {
  const store = new ConditionalMemoryStore();
  const { item, manifest } = fixture();
  const key = reviewStorageKey(item.reviewKey);
  store.overlapNextReads(key);
  await Promise.all([
    saveReview(store, item, { id: 'fixture-item', status: 'liked', note: 'Device A note.' }, manifest),
    saveReview(store, item, { id: 'fixture-item', status: 'rejected', note: 'Device B note.' }, manifest),
  ]);
  const record = store.record(key);
  assert.equal(record.state.status, 'rejected');
  assert.equal(record.state.reviewNote, 'Device B note.');
  assert.equal(record.state.feedbackCount, 2);
  assert.equal(record.revision, 2);
  assert.deepEqual(record.events.map(event => event.raw), ['Device A note.', 'Device B note.']);
});

test('reset racing with another review clears decision signals while preserving the note and audit history', { timeout: 3000 }, async () => {
  const store = new ConditionalMemoryStore();
  const { item, manifest } = fixture();
  const key = reviewStorageKey(item.reviewKey);
  await saveReview(store, item, { id: 'fixture-item', status: 'liked', note: 'Original saved note.' }, manifest);
  const seed = store.values.get(key);
  store.overlapNextReads(key);
  await Promise.all([
    saveReview(store, item, { id: 'fixture-item', status: 'rejected', note: '' }, manifest),
    saveReview(store, item, { id: 'fixture-item', status: 'new', note: '' }, manifest),
  ]);
  assert.deepEqual(store.reads.slice(1, 3).map(read => read.value), [seed, seed]);
  assert.equal(store.comparisons.filter(value => !value.accepted).length, 1);
  const record = store.record(key);
  assert.equal(record.state.status, 'new');
  assert.deepEqual(record.state.signals, []);
  assert.equal(record.state.reviewNote, 'Original saved note.');
  assert.equal(record.state.feedbackCount, 3);
  assert.equal(record.revision, 3);
  assert.deepEqual(record.events.map(event => event.intents), [['positive'], ['negative'], ['reset']]);
  await saveReview(store, item, { id: 'fixture-item', status: 'watching', note: '' }, manifest);
  const afterReset = store.record(key);
  assert.equal(afterReset.state.status, 'watching');
  assert.deepEqual(afterReset.state.signals, ['watch']);
  assert.equal(afterReset.state.feedbackCount, 4);
  assert.equal(afterReset.events.length, 4);
});

test('independent inventory keys save concurrently without cross-item state or audit contamination', async () => {
  const store = new ConditionalMemoryStore();
  const first = fixture('fixture-a', 'fixture-shop:a');
  const second = fixture('fixture-b', 'fixture-shop:b');
  const manifest = { candidates: [...first.manifest.candidates, ...second.manifest.candidates] };
  assert.deepEqual(await Promise.all([
    saveReview(store, first.item, { id: 'fixture-a', status: 'liked', note: 'Note A.' }, manifest),
    saveReview(store, second.item, { id: 'fixture-b', status: 'rejected', note: 'Note B.' }, manifest),
  ]), [true, true]);
  assert.equal(store.values.size, 2);
  for (const [entry, id, status, note] of [[first, 'fixture-a', 'liked', 'Note A.'], [second, 'fixture-b', 'rejected', 'Note B.']]) {
    const record = store.record(reviewStorageKey(entry.item.reviewKey));
    assert.equal(record.revision, 1);
    assert.equal(record.state.id, id);
    assert.equal(record.state.status, status);
    assert.equal(record.state.reviewNote, note);
    assert.equal(record.state.feedbackCount, 1);
    assert.equal(record.events.length, 1);
    assert.deepEqual(record.events[0].candidateIds, [id]);
    assert.deepEqual(record.events[0].candidateSnapshots.map(candidate => candidate.id), [id]);
  }
  assert.equal(store.comparisons.some(value => !value.accepted), false);
});

test('review survives refreshed catalog IDs when inventory identity remains stable', async () => {
  const store = new ConditionalMemoryStore();
  const original = fixture('old-fixture-id');
  const refreshed = fixture('refreshed-fixture-id');
  await saveReview(store, original.item, { id: 'old-fixture-id', status: 'liked', note: 'Persistent inventory note.' }, original.manifest);
  await saveReview(store, refreshed.item, { id: 'refreshed-fixture-id', status: 'watching', note: '' }, refreshed.manifest);
  assert.equal(store.values.size, 1);
  const record = store.record(reviewStorageKey(original.item.reviewKey));
  assert.equal(record.state.id, 'refreshed-fixture-id');
  assert.equal(record.state.reviewNote, 'Persistent inventory note.');
  assert.equal(record.state.feedbackCount, 2);
  assert.equal(record.revision, 2);
  assert.deepEqual(record.events.map(event => event.candidateIds), [['old-fixture-id'], ['refreshed-fixture-id']]);
});

test('persistent contention returns failure after a bounded retry budget without fabricating stored events', async () => {
  const store = new ConditionalMemoryStore();
  const { item, manifest } = fixture();
  let attempts = 0;
  store.compareAndSwap = async () => { attempts++; return false; };
  assert.equal(await saveReview(store, item, { id: 'fixture-item', status: 'liked', note: 'Uncommitted.' }, manifest), false);
  assert.ok(attempts > 1 && attempts <= 8);
  assert.equal(store.reads.length, attempts);
  assert.equal(store.values.size, 0);
});

test('read failures, write failures, and corrupt records propagate without overwriting existing data', async () => {
  const { item, manifest } = fixture();
  const input = { id: 'fixture-item', status: 'liked', note: '' };
  const readFailure = { get: async () => { throw new Error('fixture read failed'); }, compareAndSwap: async () => assert.fail('no write after a read failure') };
  await assert.rejects(saveReview(readFailure, item, input, manifest), /fixture read failed/);
  const writeFailure = { get: async () => null, compareAndSwap: async () => { throw new Error('fixture write failed'); } };
  await assert.rejects(saveReview(writeFailure, item, input, manifest), /fixture write failed/);
  const store = new ConditionalMemoryStore();
  const key = reviewStorageKey(item.reviewKey);
  store.values.set(key, 'invalid fixture record');
  await assert.rejects(saveReview(store, item, input, manifest), SyntaxError);
  assert.equal(store.values.get(key), 'invalid fixture record');
  assert.equal(store.comparisons.length, 0);
});

test('copied feedback reducer preserves unrelated candidates and distinguishes per-item learning intents', () => {
  const { manifest } = fixture();
  const initial = { version: 1, candidates: { unrelated: { status: 'liked', reviewNote: 'Untouched.' } }, stats: { feedbackEvents: 3 } };
  const original = structuredClone(initial);
  const feedback = { candidateIds: ['fixture-item', 'fixture-second'], intents: ['positive'], itemIntents: { 'fixture-second': ['positive', 'price_too_high'] }, raw: 'Synthetic feedback.', needsReview: false };
  const receivedAt = '2026-10-23T12:00:00.000Z';
  const result = applyShoppingFeedback(initial, feedback, manifest, receivedAt);
  assert.deepEqual(initial, original);
  assert.deepEqual(result.state.candidates.unrelated, original.candidates.unrelated);
  assert.equal(result.state.candidates['fixture-item'].status, 'liked');
  assert.equal(result.state.candidates['fixture-second'].status, 'watching');
  assert.equal(result.state.stats.feedbackEvents, 4);
  assert.equal(result.state.stats.lastFeedbackAt, receivedAt);
  assert.deepEqual(result.event.candidateSnapshots, manifest.candidates);
  assert.deepEqual(result.event.itemIntents, feedback.itemIntents);
});
