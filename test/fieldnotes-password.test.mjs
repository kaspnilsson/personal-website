import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import {
  acceptablePassword, authentication, makePasswordRecord, passwordRecordKey,
  passwordSessionKey, setInitialPassword, verifyPassword,
} from '../src/lib/fieldnotes/password.mjs';
import {
  csrfToken, makeSession, sessionCookieName, validForm, validSession, validWrite,
} from '../src/lib/fieldnotes/auth.mjs';
import { landing, passwordReady, passwordSetup } from '../src/lib/fieldnotes/http.mjs';

// All credentials and stores here are synthetic. No environment or catalog is loaded.
const master = randomBytes(32);
function memoryStore(initial = new Map()) {
  return {
    values: initial,
    async get(key) { return initial.has(key) ? initial.get(key) : null; },
    async compareAndSwap(key, previous, next) {
      if ((initial.has(key) ? initial.get(key) : null) !== previous) return false;
      initial.set(key, next);
      return true;
    },
  };
}
const fixtureRecord = () => ({ version: 1, algorithm: 'scrypt', salt: randomBytes(16).toString('base64url'), digest: randomBytes(64).toString('base64url'), epoch: randomBytes(16).toString('base64url') });

test('password bounds count Unicode code points and retain whitespace exactly', () => {
  for (const value of ['a'.repeat(12), 'a'.repeat(128), '袖'.repeat(12), '😀'.repeat(12), '😀'.repeat(128), ' '.repeat(12), '  twelve words  ']) {
    assert.equal(acceptablePassword(value), true, JSON.stringify(value));
  }
  for (const value of [null, undefined, 12, {}, ['abcdefghijkl'], '', 'a'.repeat(11), 'a'.repeat(129), '😀'.repeat(11), '😀'.repeat(129)]) {
    assert.equal(acceptablePassword(value), false, JSON.stringify(value));
  }
  assert.equal(Buffer.byteLength('😀'.repeat(128)), 512);
});

test('real scrypt uses independent salts and epochs and verifies exact Unicode and whitespace', async () => {
  const password = '  袖と服 é 😀 twelve  ';
  const first = await makePasswordRecord(password), second = await makePasswordRecord(password);
  for (const record of [first, second]) {
    assert.equal(record.version, 1);
    assert.equal(record.algorithm, 'scrypt');
    assert.equal(Buffer.from(record.salt, 'base64url').length, 16);
    assert.equal(Buffer.from(record.digest, 'base64url').length, 64);
    assert.equal(Buffer.from(record.epoch, 'base64url').length, 16);
    assert.equal(JSON.stringify(record).includes(password), false);
    assert.equal(await verifyPassword(password, record), true);
  }
  assert.notEqual(first.salt, second.salt);
  assert.notEqual(first.digest, second.digest);
  assert.notEqual(first.epoch, second.epoch);
  for (const wrong of [password.trim(), password.normalize('NFD'), `${password}!`, 'different fixture password']) {
    assert.equal(await verifyPassword(wrong, first), false);
  }
});

test('invalid passwords are rejected before derivation and maximum Unicode passwords round trip', async () => {
  for (const value of [null, undefined, '', 42, 'a'.repeat(129), '😀'.repeat(129)]) {
    assert.equal(await verifyPassword(value, null), false, JSON.stringify(value));
  }
  for (const value of ['', 'a'.repeat(11), 'a'.repeat(129), null]) await assert.rejects(makePasswordRecord(value));
  const password = '😀'.repeat(128), record = await makePasswordRecord(password);
  assert.equal(await verifyPassword(password, record), true);
});

test('concurrent first setup has exactly one durable winner with a real scrypt credential', async () => {
  const store = memoryStore(), passwords = ['first fixture password', 'second fixture password'];
  const results = await Promise.all(passwords.map(value => setInitialPassword(store, value)));
  assert.equal(results.filter(Boolean).length, 1);
  const winner = results.findIndex(Boolean), stored = JSON.parse(await store.get(passwordRecordKey));
  assert.deepEqual(stored, results[winner]);
  assert.equal(await verifyPassword(passwords[winner], stored), true);
  assert.equal(await verifyPassword(passwords[1 - winner], stored), false);
  assert.equal(await setInitialPassword(store, 'third fixture password'), null);
  assert.deepEqual(JSON.parse(await store.get(passwordRecordKey)), stored);
});

test('authentication enables bootstrap only for an exact null storage result', async () => {
  const store = memoryStore(), before = await authentication(store, master);
  assert.equal(before.store, store);
  assert.equal(before.master, master);
  assert.equal(before.record, null);
  assert.equal(before.key, master);
  for (const raw of [undefined, '', false, 0, 'null', 'false', '0', '[]', '{}', 'not json', JSON.stringify({ ...fixtureRecord(), version: 2 }), JSON.stringify({ ...fixtureRecord(), algorithm: 'sha256' })]) {
    await assert.rejects(authentication({ async get() { return raw; } }, master), undefined, String(raw));
  }
});

test('corrupt or missing credential fields cannot fall back to bootstrap', async () => {
  for (const field of ['salt', 'digest', 'epoch']) {
    for (const value of [undefined, null, 123, '', 'short', '"<script>', `${fixtureRecord()[field]}=`]) {
      const record = { ...fixtureRecord(), [field]: value };
      await assert.rejects(authentication(memoryStore(new Map([[passwordRecordKey, JSON.stringify(record)]])), master));
    }
  }
  const record = fixtureRecord(), store = memoryStore(new Map([[passwordRecordKey, JSON.stringify(record)]]));
  const current = await authentication(store, master);
  assert.deepEqual(current.record, record);
  assert.deepEqual(current.key, passwordSessionKey(master, record));
  assert.notDeepEqual(current.key, master);
});

test('credential read and compare-and-swap errors propagate instead of authenticating or claiming setup', async () => {
  await assert.rejects(authentication({ async get() { throw new Error('fixture read failed'); } }, master), /fixture read failed/);
  await assert.rejects(setInitialPassword({ async compareAndSwap() { throw new Error('fixture write failed'); } }, 'fixture password twelve'), /fixture write failed/);
});

test('password epoch invalidates bootstrap sessions, old epochs, and their form/API CSRF tokens', () => {
  const first = fixtureRecord(), second = { ...first, epoch: randomBytes(16).toString('base64url') };
  const key = passwordSessionKey(master, first), nextKey = passwordSessionKey(master, second);
  assert.deepEqual(passwordSessionKey(master, first), key);
  assert.notDeepEqual(passwordSessionKey(randomBytes(32), first), key);
  assert.notDeepEqual(nextKey, key);
  const current = makeSession(key), bootstrap = makeSession(master), previous = makeSession(nextKey);
  const origin = 'https://fixture.example', env = { NODE_ENV: 'production', SITE_ORIGIN: origin };
  const request = (session, token = csrfToken(key, current)) => new Request(`${origin}/fieldnotes/password`, {
    method: 'POST', headers: { cookie: `${sessionCookieName}=${session}`, origin, 'x-review-token': token },
  });
  assert.equal(validSession(key, current), true);
  assert.equal(validForm(request(current), key, csrfToken(key, current), env), true);
  assert.equal(validWrite(request(current), key, env), true);
  for (const [oldKey, session] of [[master, bootstrap], [nextKey, previous]]) {
    assert.equal(validSession(key, session), false);
    assert.equal(validForm(request(session), key, csrfToken(oldKey, session), env), false);
    assert.equal(validWrite(request(session, csrfToken(oldKey, session)), key, env), false);
    assert.equal(validForm(request(current), key, csrfToken(oldKey, session), env), false);
    assert.equal(validWrite(request(current, csrfToken(oldKey, session)), key, env), false);
  }
  for (const missing of [null, undefined, '']) assert.equal(validForm(request(current), key, missing, env), false);
});

test('account forms select password-manager autocomplete and never echo hostile token/error input', () => {
  const token = randomBytes(32).toString('base64url'), hostile = '\"><script>fixture-only</script>';
  const setup = passwordSetup(token), ready = passwordReady(token), login = landing();
  assert.equal((setup.match(/autocomplete="new-password"/g) ?? []).length, 2);
  assert.match(setup, /name="password" type="password"/);
  assert.match(setup, /name="confirm" type="password"/);
  assert.match(setup, new RegExp(`type="hidden" name="csrf" value="${token}"`));
  assert.match(ready, /method="post" action="\/fieldnotes\/logout"/);
  assert.match(ready, new RegExp(`type="hidden" name="csrf" value="${token}"`));
  assert.match(login, /name="password" type="password" autocomplete="current-password"/);
  assert.match(landing('', true), /name="access" type="password"/);
  assert.equal(login.includes('name="access"'), false);
  for (const markup of [passwordSetup(hostile, hostile), passwordReady(hostile), landing(hostile), landing(hostile, true)]) {
    assert.equal(markup.includes(hostile), false);
    assert.equal(markup.includes('<script>'), false);
  }
});
