import test from 'node:test';
import assert from 'node:assert/strict';
import { createCipheriv, createHmac, hkdfSync, randomBytes } from 'node:crypto';
import {
  accessCode, cookieValue, csrfToken, decryptCatalog, makeSession, masterSecret,
  sameSecret, sessionCookieName, sessionHeader, validSession, validWrite,
} from '../src/lib/fieldnotes/auth.mjs';

// These fixtures are generated here. Never import the deployed encrypted catalog.
const key = randomBytes(32);
const otherKey = randomBytes(32);
const now = Date.parse('2026-10-23T12:00:00.250Z');
const lifetime = 90 * 24 * 3600;

function signedSession(expires, signingKey = key) {
  const signature = createHmac('sha256', signingKey)
    .update(`fieldnotes/session/v1:${expires}`).digest('base64url');
  return `v1.${expires}.${signature}`;
}

test('master key accepts a generated 256-bit key and rejects missing or wrong-length material', () => {
  assert.deepEqual(masterSecret(key.toString('base64url')), key);
  for (const value of ['', null, 'not-a-key', randomBytes(31).toString('base64url'), randomBytes(33).toString('base64url')]) {
    assert.throws(() => masterSecret(value), /not configured/);
  }
  assert.equal(sameSecret('', null), true);
  assert.equal(sameSecret('fixture', 'fixture'), true);
  assert.equal(sameSecret('fixture', 'different-length'), false);
  assert.equal(sameSecret('fixture', 'fixturE'), false);
  assert.notEqual(accessCode(key), accessCode(otherKey));
});

test('session expires exactly at its signed expiry and rejects changes or another master key', () => {
  const session = makeSession(key, now);
  const expires = Number(session.split('.')[1]);
  assert.equal(expires, Math.floor(now / 1000) + lifetime);
  assert.equal(validSession(key, session, now), true);
  assert.equal(validSession(key, session, expires * 1000 - 1), true);
  assert.equal(validSession(key, session, expires * 1000), false);
  assert.equal(validSession(otherKey, session, now), false);
  assert.equal(validSession(key, session.replace(`.${expires}.`, `.${expires + 1}.`), now), false);
  const changedSignature = `${session.slice(0, -1)}${session.endsWith('A') ? 'B' : 'A'}`;
  assert.equal(validSession(key, changedSignature, now), false);
  for (const malformed of [null, '', ` ${session}`, `${session}.suffix`, session.replace('v1.', 'v2.'), 'v1.1.short']) {
    assert.equal(validSession(key, malformed, now), false);
  }
});

test('even a correctly signed session cannot extend the configured lifetime arbitrarily', () => {
  assert.equal(validSession(key, signedSession(Math.floor(now / 1000) + lifetime + 61), now), false);
  assert.equal(validSession(key, signedSession(Math.floor(now / 1000) - 1), now), false);
});

test('session cookie is scoped to Fieldnotes, HttpOnly, and secure for HTTPS or production', t => {
  const previousMode = process.env.NODE_ENV;
  t.after(() => { if (previousMode === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = previousMode; });
  process.env.NODE_ENV = 'development';
  const httpsRequest = new Request('https://kasptrax.com/fieldnotes/unlock');
  const header = sessionHeader(key, httpsRequest);
  const [cookie, ...attributes] = header.split('; ');
  assert.ok(cookie.startsWith(`${sessionCookieName}=`));
  assert.equal(validSession(key, cookie.slice(sessionCookieName.length + 1)), true);
  for (const attribute of ['HttpOnly', 'SameSite=Lax', 'Path=/fieldnotes', `Max-Age=${lifetime}`, 'Secure']) {
    assert.ok(attributes.includes(attribute), attribute);
  }
  assert.equal(attributes.some(attribute => attribute.startsWith('Domain=')), false);
  const localRequest = new Request('http://localhost:3001/fieldnotes/unlock');
  assert.equal(sessionHeader(key, localRequest).includes('; Secure'), false);
  process.env.NODE_ENV = 'production';
  assert.ok(sessionHeader(key, localRequest).endsWith('; Secure'));
});

test('cookie reader finds the exact cookie among unrelated values without substring matching', () => {
  const session = makeSession(key);
  const request = new Request('https://kasptrax.com/fieldnotes', {
    headers: { cookie: `other=x; old_${sessionCookieName}=invalid; ${sessionCookieName}=${session}; last=z` },
  });
  assert.equal(cookieValue(request), session);
  assert.equal(cookieValue(new Request(request.url, { headers: { cookie: `old_${sessionCookieName}=x` } })), '');
  assert.equal(cookieValue(new Request(request.url)), '');
});

test('writes require a live session, exact same origin, and the CSRF token for that session', () => {
  const session = makeSession(key);
  const headers = {
    cookie: `${sessionCookieName}=${session}`,
    origin: 'https://kasptrax.com',
    'sec-fetch-site': 'same-origin',
    'x-review-token': csrfToken(key, session),
  };
  const request = (changes = {}, omit = []) => {
    const next = { ...headers, ...changes };
    for (const name of omit) delete next[name];
    return new Request('https://kasptrax.com/fieldnotes/api/review', { method: 'POST', headers: next });
  };
  assert.equal(validWrite(request(), key), true);
  assert.equal(validWrite(request({}, ['sec-fetch-site']), key), true);
  for (const changes of [
    { origin: 'https://other.example' }, { origin: 'https://kasptrax.com.evil.example' },
    { origin: 'http://kasptrax.com' }, { origin: 'https://kasptrax.com:8443' }, { origin: 'null' },
    { 'sec-fetch-site': 'cross-site' }, { 'x-review-token': 'wrong' },
    { 'x-review-token': csrfToken(otherKey, session) },
    { 'x-review-token': csrfToken(key, makeSession(key, Date.now() - 3600000)) },
    { cookie: `${sessionCookieName}=${makeSession(key, Date.now() - (lifetime + 1) * 1000)}` },
    { cookie: `${sessionCookieName}=${makeSession(otherKey)}` },
  ]) assert.equal(validWrite(request(changes), key), false, JSON.stringify(changes));
  for (const omitted of ['cookie', 'origin', 'x-review-token']) {
    assert.equal(validWrite(request({}, [omitted]), key), false, omitted);
  }
});

test('fake catalog envelope decrypts only with the correct master and authentic GCM data', () => {
  const fixture = { catalog: { items: [{ candidate: { id: 'fixture-only', title: 'Synthetic sample' } }] }, manifest: { candidates: [] } };
  const iv = randomBytes(12);
  const cipherKey = Buffer.from(hkdfSync('sha256', key, Buffer.from('fieldnotes'), Buffer.from('catalog-v1'), 32));
  const cipher = createCipheriv('aes-256-gcm', cipherKey, iv);
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(fixture), 'utf8'), cipher.final()]);
  const envelope = { version: 1, iv: iv.toString('base64url'), tag: cipher.getAuthTag().toString('base64url'), ciphertext: ciphertext.toString('base64url') };
  assert.deepEqual(decryptCatalog(envelope, key), fixture);
  assert.throws(() => decryptCatalog(envelope, otherKey));
  for (const field of ['iv', 'tag', 'ciphertext']) {
    const bytes = Buffer.from(envelope[field], 'base64url');
    bytes[0] ^= 1;
    assert.throws(() => decryptCatalog({ ...envelope, [field]: bytes.toString('base64url') }, key), undefined, field);
  }
  assert.throws(() => decryptCatalog({ ...envelope, tag: '' }, key));
  assert.throws(() => decryptCatalog({ ...envelope, version: 2 }, key), /Unsupported/);
});
