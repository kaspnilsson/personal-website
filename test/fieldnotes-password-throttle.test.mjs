import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { allowLoginAttempt } from '../src/lib/fieldnotes/password.mjs';

const master = randomBytes(32), now = Date.parse('2026-10-23T12:00:00Z'), duration = 15 * 60 * 1000;
const request = () => new Request('https://fixture.example/fieldnotes/unlock', { method: 'POST' });
function adapter(values = new Map()) {
  return {
    values, reads: 0, writes: 0,
    async get(key) { this.reads++; return values.has(key) ? values.get(key) : null; },
    async compareAndSwap(key, previous, next) {
      this.writes++;
      if ((values.has(key) ? values.get(key) : null) !== previous) return false;
      values.set(key, next);
      return true;
    },
  };
}

test('login quota persists across store adapters and admits exactly ten attempts per window', async () => {
  const values = new Map(), first = adapter(values), second = adapter(values);
  for (let i = 0; i < 10; i++) assert.equal(await allowLoginAttempt(i % 2 ? first : second, master, request(), now + i), true);
  const before = JSON.stringify([...values]);
  assert.equal(await allowLoginAttempt(adapter(values), master, request(), now + 1000), false);
  assert.equal(JSON.stringify([...values]), before);
  assert.equal(values.size, 1);
  const [[key, raw]] = values;
  assert.match(key, /^fieldnotes:v1:login:[a-f0-9]{64}$/);
  assert.equal(key.includes('unknown'), false);
  assert.deepEqual(JSON.parse(raw), { attempts: 10, until: now + duration });
});

test('overlapping durable CAS attempts cannot lose increments or exceed the ten-attempt quota', async () => {
  const values = new Map();
  const results = await Promise.all(Array.from({ length: 32 }, () => allowLoginAttempt(adapter(values), master, request(), now)));
  let accepted = results.filter(Boolean).length;
  assert.ok(accepted > 0 && accepted <= 10);
  assert.equal(JSON.parse([...values.values()][0]).attempts, accepted);
  while (accepted < 10) {
    assert.equal(await allowLoginAttempt(adapter(values), master, request(), now), true);
    accepted++;
  }
  const denied = await Promise.all(Array.from({ length: 16 }, () => allowLoginAttempt(adapter(values), master, request(), now)));
  assert.ok(denied.every(value => value === false));
  assert.equal(JSON.parse([...values.values()][0]).attempts, 10);
});

test('throttle expiry is exact and successful attempts do not slide its window', async () => {
  const store = adapter();
  assert.equal(await allowLoginAttempt(store, master, request(), now), true);
  for (let i = 1; i < 10; i++) assert.equal(await allowLoginAttempt(store, master, request(), now + i * 1000), true);
  assert.equal(await allowLoginAttempt(store, master, request(), now + duration - 1), false);
  assert.equal(await allowLoginAttempt(store, master, request(), now + duration), true);
  assert.deepEqual(JSON.parse([...store.values.values()][0]), { attempts: 1, until: now + duration * 2 });
});

test('durable counter TTL counts down to the original boundary and resets only for a new window', async () => {
  const store = adapter(), cas = store.compareAndSwap.bind(store), expiries = [];
  store.compareAndSwap = async (key, previous, next, ttlSeconds) => {
    expiries.push(ttlSeconds);
    return cas(key, previous, next);
  };
  for (const time of [now, now + 2345, now + duration - 1, now + duration]) {
    assert.equal(await allowLoginAttempt(store, master, request(), time), true);
  }
  assert.deepEqual(expiries, [900, 898, 1, 900]);
  assert.deepEqual(JSON.parse([...store.values.values()][0]), { attempts: 1, until: now + duration * 2 });
});

test('a stale counter from a prior window is replaced using its exact stored revision', async () => {
  const store = adapter();
  await allowLoginAttempt(store, master, request(), now);
  const [[key]] = store.values, old = JSON.stringify({ attempts: 10, until: now + duration });
  store.values.set(key, old);
  const cas = store.compareAndSwap.bind(store);
  store.compareAndSwap = async (actualKey, previous, next) => {
    assert.equal(actualKey, key);
    assert.equal(previous, old);
    return cas(actualKey, previous, next);
  };
  assert.equal(await allowLoginAttempt(store, master, request(), now + duration + 1), true);
  assert.deepEqual(JSON.parse(store.values.get(key)), { attempts: 1, until: now + duration * 2 + 1 });
});

test('CAS conflict exhaustion denies access and a last-retry durable success is counted', async () => {
  for (const successAt of [Infinity, 8]) {
    let reads = 0, comparisons = 0;
    const store = {
      async get() { reads++; return null; },
      async compareAndSwap(_key, previous, next) {
        comparisons++;
        assert.equal(previous, null);
        assert.deepEqual(JSON.parse(next), { attempts: 1, until: now + duration });
        return comparisons === successAt;
      },
    };
    assert.equal(await allowLoginAttempt(store, master, request(), now), successAt === 8);
    assert.equal(reads, 8);
    assert.equal(comparisons, 8);
  }
});

test('counter read, malformed JSON, and durable-write failures never admit a login attempt', async () => {
  const readError = { async get() { throw new Error('fixture read unavailable'); } };
  await assert.rejects(allowLoginAttempt(readError, master, request(), now), /fixture read unavailable/);
  const parseError = { async get() { return '{broken'; }, async compareAndSwap() { assert.fail('must not overwrite malformed state'); } };
  await assert.rejects(allowLoginAttempt(parseError, master, request(), now));
  const writeError = { async get() { return null; }, async compareAndSwap() { throw new Error('fixture durable write failed'); } };
  await assert.rejects(allowLoginAttempt(writeError, master, request(), now), /fixture durable write failed/);
});

test('malformed durable counter shapes fail closed rather than resetting or poisoning the limit', async t => {
  const malformed = [undefined, '', 'null', '{}', '[]', 'false', '0',
    ...[
      { attempts: -1, until: now + duration }, { attempts: '0', until: now + duration },
      { attempts: 'broken', until: now + duration }, { attempts: 11, until: now + duration },
      { attempts: 0.5, until: now + duration }, { until: now + duration },
      { attempts: null, until: now + duration }, { attempts: 1, until: 'later' },
      { attempts: 1, until: -1 }, { attempts: 1, until: Number.MAX_SAFE_INTEGER + 1 },
      { attempts: 1 },
    ].map(JSON.stringify),
  ];
  for (const raw of malformed) await t.test(raw === undefined ? 'undefined result' : JSON.stringify(raw), async () => {
    let writes = 0, allowed = false;
    try {
      allowed = await allowLoginAttempt({ async get() { return raw; }, async compareAndSwap() { writes++; return true; } }, master, request(), now);
    } catch { /* A storage error is also a closed failure. */ }
    assert.equal(allowed, false, 'corrupt persisted state must never grant permission to hash a password');
    assert.equal(writes, 0, 'corrupt state must not be silently replaced');
  });
});

test('the platform client-address header takes precedence over a rotating forwarded-for value', async () => {
  const store = adapter(), trusted = '203.0.113.17';
  const forwardedRequest = index => new Request('https://fixture.example/fieldnotes/unlock', {
    method: 'POST', headers: { 'x-vercel-forwarded-for': trusted, 'x-forwarded-for': `198.51.100.${index}` },
  });
  for (let index = 1; index <= 10; index++) assert.equal(await allowLoginAttempt(store, master, forwardedRequest(index), now), true);
  assert.equal(await allowLoginAttempt(store, master, forwardedRequest(11), now), false);
  assert.equal(store.values.size, 1);
  assert.equal(JSON.stringify([...store.values]).includes(trusted), false, 'client addresses must never be stored in plaintext');
});

test('separate master keys partition the durable HMAC identity without storing either secret', async () => {
  const store = adapter(), otherMaster = randomBytes(32);
  assert.equal(await allowLoginAttempt(store, master, request(), now), true);
  assert.equal(await allowLoginAttempt(store, otherMaster, request(), now), true);
  assert.equal(store.values.size, 2);
  for (const [key, raw] of store.values) {
    assert.equal(key.includes(master.toString('hex')), false);
    assert.equal(key.includes(otherMaster.toString('hex')), false);
    assert.deepEqual(JSON.parse(raw), { attempts: 1, until: now + duration });
  }
});
