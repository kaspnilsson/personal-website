import test from 'node:test';
import assert from 'node:assert/strict';
import { createCipheriv, hkdfSync, randomBytes, scrypt } from 'node:crypto';
import { promisify } from 'node:util';
import { accessCode, csrfToken, makeSession, validSession } from '../src/lib/fieldnotes/auth.mjs';
import { verifyPassword } from '../src/lib/fieldnotes/password.mjs';
import { sharedAuthentication } from '../src/lib/fieldnotes/shared-auth.mjs';

const master = randomBytes(32), salt = randomBytes(16), fixturePassword = 'fixture';
const digest = await promisify(scrypt)(fixturePassword, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
const record = { version: 1, algorithm: 'scrypt', salt: salt.toString('base64url'), digest: digest.toString('base64url'), epoch: randomBytes(16).toString('base64url') };
function envelope(value, key = master) {
  const derived = Buffer.from(hkdfSync('sha256', key, Buffer.from('fieldnotes'), Buffer.from('catalog-v1'), 32));
  const iv = randomBytes(12), cipher = createCipheriv('aes-256-gcm', derived, iv);
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(value)), cipher.final()]);
  return { version: 1, iv: iv.toString('base64url'), tag: cipher.getAuthTag().toString('base64url'), ciphertext: ciphertext.toString('base64url') };
}
const store = { get() { throw new Error('Shared password must not depend on legacy Redis credentials.'); } };

test('configured shared password is immediately available without setup or Redis credential reads', async () => {
  const account = sharedAuthentication(store, master, envelope(record));
  assert.deepEqual(account.record, record);
  assert.equal(account.store, store);
  assert.equal(await verifyPassword(fixturePassword, account.record), true);
  assert.equal(await verifyPassword('another fixture', account.record), false);
  assert.equal(validSession(account.key, makeSession(master)), false, 'legacy access-code session is invalid');
  assert.equal(validSession(account.key, makeSession(account.key)), true);
  assert.notEqual(csrfToken(account.key, makeSession(account.key)), csrfToken(master, makeSession(master)));
  assert.notEqual(accessCode(master), fixturePassword);
});

test('wrong key, modified envelope, absent verifier and malformed verifier all fail closed', () => {
  const encrypted = envelope(record);
  assert.throws(() => sharedAuthentication(store, randomBytes(32), encrypted));
  assert.throws(() => sharedAuthentication(store, master, { ...encrypted, tag: Buffer.alloc(16).toString('base64url') }));
  for (const value of [null, {}, { ...record, algorithm: 'other' }, { ...record, digest: 'short' }]) {
    assert.throws(() => sharedAuthentication(store, master, envelope(value)));
  }
});

test('replacing the configured epoch invalidates previous password sessions without changing the master', () => {
  const first = sharedAuthentication(store, master, envelope(record));
  const second = sharedAuthentication(store, master, envelope({ ...record, epoch: randomBytes(16).toString('base64url') }));
  assert.deepEqual(first.master, second.master);
  assert.equal(validSession(second.key, makeSession(first.key)), false);
  assert.equal(validSession(second.key, makeSession(second.key)), true);
});
