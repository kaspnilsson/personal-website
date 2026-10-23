import test from 'node:test';
import assert from 'node:assert/strict';
import { configuredStore, LocalStore, RedisStore, reviewStorageKey } from '../src/lib/fieldnotes/storage.mjs';

test('production refuses local fallback even when a local directory is provided', () => {
  const base = { NODE_ENV: 'production', FIELDNOTES_LOCAL_STORE: 'test/unused-fixture-store' };
  for (const config of [
    {}, { KV_REST_API_URL: 'https://kv.example.invalid' }, { KV_REST_API_TOKEN: 'fixture-token' },
    { KV_REST_API_URL: 'http://kv.example.invalid', KV_REST_API_TOKEN: 'fixture-token' },
    { UPSTASH_REDIS_REST_URL: 'http://kv.example.invalid', UPSTASH_REDIS_REST_TOKEN: 'fixture-token' },
    { KV_REST_API_URL: 'not a URL', KV_REST_API_TOKEN: 'fixture-token' },
  ]) assert.throws(() => configuredStore({ ...base, ...config }));
  assert.throws(() => configuredStore({ NODE_ENV: 'development' }), /not configured/);
  assert.ok(configuredStore({ NODE_ENV: 'development', FIELDNOTES_LOCAL_STORE: 'test/unused-fixture-store' }) instanceof LocalStore);
});

test('configured durable storage supports both binding names and wins over development fallback', () => {
  for (const config of [
    { KV_REST_API_URL: 'https://kv.example.invalid', KV_REST_API_TOKEN: 'fixture-kv-token' },
    { UPSTASH_REDIS_REST_URL: 'https://upstash.example.invalid', UPSTASH_REDIS_REST_TOKEN: 'fixture-upstash-token' },
  ]) assert.ok(configuredStore({ NODE_ENV: 'production', ...config }) instanceof RedisStore);
  const store = configuredStore({
    NODE_ENV: 'development', FIELDNOTES_LOCAL_STORE: 'test/unused-fixture-store',
    KV_REST_API_URL: 'https://kv.example.invalid', KV_REST_API_TOKEN: 'fixture-token',
  });
  assert.ok(store instanceof RedisStore);
});

test('Redis REST sends authenticated uncached GET/MGET commands and preserves key order', async () => {
  const calls = [];
  const store = new RedisStore('https://kv.example.invalid', 'fixture-rest-token', async (url, options) => {
    calls.push({ url, options });
    const command = JSON.parse(options.body);
    return Response.json({ result: command[0] === 'GET' ? null : ['fixture-second', null, 'fixture-first'] });
  });
  assert.equal(await store.get('missing'), null);
  assert.deepEqual(await store.getMany(['second', 'missing', 'first']), ['fixture-second', null, 'fixture-first']);
  assert.deepEqual(await store.getMany([]), []);
  assert.equal(calls.length, 2, 'empty batches do not issue REST requests');
  assert.deepEqual(calls.map(({ options }) => JSON.parse(options.body)), [['GET', 'missing'], ['MGET', 'second', 'missing', 'first']]);
  for (const { url, options } of calls) {
    assert.equal(url, 'https://kv.example.invalid');
    assert.equal(options.method, 'POST');
    assert.equal(options.headers.Authorization, 'Bearer fixture-rest-token');
    assert.equal(options.headers['Content-Type'], 'application/json');
    assert.equal(options.cache, 'no-store');
  }
});

test('Redis CAS uses one conditional EVAL and reports stale comparisons instead of overwriting', async () => {
  const values = new Map();
  const calls = [];
  const store = new RedisStore('https://kv.example.invalid', 'fixture-rest-token', async (_url, options) => {
    const command = JSON.parse(options.body);
    calls.push(command);
    assert.equal(command[0], 'EVAL');
    const [, script, keyCount, key, previous, next] = command;
    assert.equal(keyCount, '1');
    assert.equal(command.length, 6);
    assert.match(script, /redis\.call\('GET',KEYS\[1\]\)/);
    assert.match(script, /redis\.call\('SET',KEYS\[1\],ARGV\[2\]\)/);
    // Model Redis's atomic compare/write, including the absent-key wire marker.
    const current = values.get(key);
    const matches = current === undefined ? previous === '__ABSENT__' : current === previous;
    if (matches) values.set(key, next);
    return Response.json({ result: matches ? 1 : 0 });
  });
  assert.equal(await store.compareAndSwap('fixture-a', null, 'revision-one'), true);
  assert.equal(await store.compareAndSwap('fixture-a', null, 'stale-create'), false);
  assert.equal(await store.compareAndSwap('fixture-a', 'wrong-revision', 'stale-update'), false);
  assert.equal(values.get('fixture-a'), 'revision-one');
  assert.equal(await store.compareAndSwap('fixture-a', 'revision-one', 'revision-two'), true);
  assert.equal(await store.compareAndSwap('fixture-b', null, 'independent'), true);
  assert.deepEqual([...values], [['fixture-a', 'revision-two'], ['fixture-b', 'independent']]);
  assert.equal(calls.length, 5, 'CAS has no separate race-prone GET/SET requests');
});

test('Redis HTTP and command failures reject and never claim a successful durable write', async () => {
  for (const response of [
    () => new Response('unavailable', { status: 503 }),
    () => Response.json({ error: 'fixture REST error' }),
    () => new Response('not JSON', { status: 200 }),
  ]) {
    const store = new RedisStore('https://kv.example.invalid', 'fixture-token', async () => response());
    await assert.rejects(store.get('fixture-key'));
    await assert.rejects(store.getMany(['fixture-key']));
    await assert.rejects(store.compareAndSwap('fixture-key', null, 'next'));
  }
  const offline = new RedisStore('https://kv.example.invalid', 'fixture-token', async () => { throw new Error('fixture offline'); });
  await assert.rejects(offline.compareAndSwap('fixture-key', null, 'next'), /fixture offline/);
});

test('inventory identity yields stable private storage keys and keeps distinct listings separate', () => {
  const first = reviewStorageKey('fixture-shop:inventory-001');
  assert.equal(first, reviewStorageKey('fixture-shop:inventory-001'));
  assert.notEqual(first, reviewStorageKey('fixture-shop:inventory-002'));
  assert.notEqual(first, reviewStorageKey('other-fixture-shop:inventory-001'));
  assert.equal(first.includes('fixture-shop'), false);
  assert.equal(first.includes('inventory-001'), false);
});
