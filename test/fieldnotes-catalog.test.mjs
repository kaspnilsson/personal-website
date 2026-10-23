import test from 'node:test';
import assert from 'node:assert/strict';
import { browserRow } from '../src/lib/fieldnotes/browser-catalog.mjs';
import { expireStock } from '../src/lib/fieldnotes/freshness.mjs';

const now = Date.parse('2026-10-23T12:00:00.000Z');
const hour = 3600000;
const atAge = age => new Date(now - age).toISOString();

function stockRow() {
  return {
    reviewKey: 'fixture-private-inventory-key', status: 'watching', reviewNote: 'Synthetic saved note.',
    stockVerified: true, qualified: true,
    candidate: {
      id: 'fixture-item', title: 'Synthetic sample', price: 120, images: ['https://images.example.invalid/fixture.jpg'],
      availabilityCheckedAt: atAge(0), collection: { freshnessHours: 2 },
      provenance: {
        extraction: 'fixture extraction', currency: 'USD', nativeCurrency: 'JPY', priceCurrency: 'USD',
        indexedUnavailable: false, stretchBudgetCandidate: true,
        stockVerification: { observedAt: atAge(0), internalFixture: 'fixture-stock-private' },
        internalFixture: 'fixture-provenance-private',
        evidence: { currency: 'USD', nativeCurrency: 'JPY', priceCurrency: 'USD', price: '120 USD', internalFixture: 'fixture-evidence-private' },
      },
    },
  };
}

test('stock verification expires independently of each collection availability window', () => {
  const source = stockRow();
  assert.equal(expireStock(source, now), source);
  const stockBoundary = structuredClone(source);
  stockBoundary.candidate.provenance.stockVerification.observedAt = atAge(24 * hour);
  assert.equal(expireStock(stockBoundary, now).qualified, true);
  stockBoundary.candidate.provenance.stockVerification.observedAt = atAge(24 * hour + 1);
  assert.equal(expireStock(stockBoundary, now).stockVerified, false);
  assert.equal(expireStock(stockBoundary, now).qualified, false);
  const availabilityBoundary = structuredClone(source);
  availabilityBoundary.candidate.availabilityCheckedAt = atAge(2 * hour);
  assert.equal(expireStock(availabilityBoundary, now).qualified, true);
  availabilityBoundary.candidate.availabilityCheckedAt = atAge(2 * hour + 1);
  assert.equal(expireStock(availabilityBoundary, now).qualified, false);
});

test('missing, invalid, or future verification dates revoke positive stock claims without mutating source', () => {
  const cases = [
    row => { delete row.candidate.provenance.stockVerification; },
    row => { row.candidate.provenance.stockVerification.observedAt = 'invalid-fixture-date'; },
    row => { row.candidate.provenance.stockVerification.observedAt = atAge(-1); },
    row => { delete row.candidate.availabilityCheckedAt; },
    row => { row.candidate.availabilityCheckedAt = 'invalid-fixture-date'; },
    row => { row.candidate.availabilityCheckedAt = atAge(-1); },
  ];
  for (const modify of cases) {
    const source = stockRow();
    modify(source);
    const original = structuredClone(source);
    const expired = expireStock(source, now);
    assert.equal(expired.stockVerified, false);
    assert.equal(expired.qualified, false);
    assert.match(expired.filterReason, /missing or stale/);
    assert.equal(expired.status, 'watching');
    assert.equal(expired.reviewNote, 'Synthetic saved note.');
    assert.deepEqual(source, original);
  }
});

test('stock expiry defaults to 24 hours, respects zero freshness, and never upgrades unverified rows', () => {
  const defaults = stockRow();
  delete defaults.candidate.collection;
  defaults.candidate.availabilityCheckedAt = atAge(24 * hour);
  assert.equal(expireStock(defaults, now).qualified, true);
  defaults.candidate.availabilityCheckedAt = atAge(24 * hour + 1);
  assert.equal(expireStock(defaults, now).qualified, false);
  const immediate = stockRow();
  immediate.candidate.collection.freshnessHours = 0;
  assert.equal(expireStock(immediate, now).qualified, true);
  immediate.candidate.availabilityCheckedAt = atAge(1);
  assert.equal(expireStock(immediate, now).qualified, false);
  const alreadyFiltered = { ...stockRow(), qualified: false, stockVerified: false, filterReason: 'Fixture size mismatch' };
  assert.equal(expireStock(alreadyFiltered, now), alreadyFiltered);
  assert.equal(expireStock(alreadyFiltered, now).filterReason, 'Fixture size mismatch');
});

test('browser projection removes inventory identity and internal provenance while retaining usable listing fields', () => {
  const source = stockRow();
  const original = structuredClone(source);
  const projected = browserRow(source);
  assert.equal(Object.hasOwn(projected, 'reviewKey'), false);
  assert.equal(Object.hasOwn(projected.candidate.provenance, 'stockVerification'), false);
  assert.equal(Object.hasOwn(projected.candidate.provenance, 'internalFixture'), false);
  assert.equal(Object.hasOwn(projected.candidate.provenance.evidence, 'internalFixture'), false);
  assert.equal(projected.candidate.id, source.candidate.id);
  assert.equal(projected.candidate.title, source.candidate.title);
  assert.equal(projected.candidate.price, source.candidate.price);
  assert.deepEqual(projected.candidate.images, source.candidate.images);
  assert.equal(projected.status, 'watching');
  assert.equal(projected.reviewNote, 'Synthetic saved note.');
  assert.deepEqual(projected.candidate.provenance.evidence, { currency: 'USD', nativeCurrency: 'JPY', priceCurrency: 'USD', price: '120 USD' });
  const serialized = JSON.stringify(projected);
  for (const marker of ['fixture-private-inventory-key', 'fixture-stock-private', 'fixture-provenance-private', 'fixture-evidence-private']) {
    assert.equal(serialized.includes(marker), false, marker);
  }
  assert.deepEqual(source, original);
});

test('expiry then browser projection preserves review state but removes stale stock qualification', () => {
  const source = stockRow();
  source.candidate.provenance.stockVerification.observedAt = atAge(25 * hour);
  const projected = browserRow(expireStock(source, now));
  assert.equal(projected.qualified, false);
  assert.equal(projected.stockVerified, false);
  assert.equal(projected.status, 'watching');
  assert.equal(projected.reviewNote, 'Synthetic saved note.');
  assert.equal(Object.hasOwn(projected, 'reviewKey'), false);
  assert.equal(Object.hasOwn(projected.candidate.provenance, 'stockVerification'), false);
  assert.doesNotThrow(() => browserRow({ candidate: { id: 'fixture-without-provenance' } }));
});
