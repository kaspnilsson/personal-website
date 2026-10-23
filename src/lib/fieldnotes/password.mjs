import { createHmac, randomBytes, scrypt as derive, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { masterSecret } from './auth.mjs';
import { configuredStore } from './storage.mjs';

const scrypt = promisify(derive);
const options = { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
export const passwordRecordKey = 'fieldnotes:v1:password';

export function acceptablePassword(value) {
  return typeof value === 'string' && [...value].length >= 12 && [...value].length <= 128 && Buffer.byteLength(value) <= 512;
}
export async function makePasswordRecord(password) {
  if (!acceptablePassword(password)) throw new Error('Choose a password between 12 and 128 characters.');
  const salt = randomBytes(16), digest = await scrypt(password, salt, 64, options);
  return { version: 1, algorithm: 'scrypt', salt: salt.toString('base64url'), digest: digest.toString('base64url'), epoch: randomBytes(16).toString('base64url') };
}
function parseRecord(raw) {
  if (raw === null) return null;
  const record = JSON.parse(raw);
  if (record?.version !== 1 || record.algorithm !== 'scrypt' || ![record.salt, record.digest, record.epoch].every(value => typeof value === 'string') || !/^[A-Za-z0-9_-]{22}$/.test(record.salt) ||
      !/^[A-Za-z0-9_-]{86}$/.test(record.digest) || !/^[A-Za-z0-9_-]{22}$/.test(record.epoch)) {
    throw new Error('Password storage is unavailable.');
  }
  return record;
}
export async function verifyPassword(password, record) {
  if (typeof password !== 'string' || !password.length || [...password].length > 128 || Buffer.byteLength(password) > 512) return false;
  const digest = await scrypt(password, Buffer.from(record.salt, 'base64url'), 64, options);
  return timingSafeEqual(digest, Buffer.from(record.digest, 'base64url'));
}
export function passwordSessionKey(master, record) {
  return record ? createHmac('sha256', master).update(`fieldnotes/password-session/v1:${record.epoch}`).digest() : master;
}
export async function authentication(store = configuredStore(), master = masterSecret()) {
  const record = parseRecord(await store.get(passwordRecordKey));
  return { store, master, record, key: passwordSessionKey(master, record) };
}
export async function setInitialPassword(store, password) {
  const record = await makePasswordRecord(password);
  return await store.compareAndSwap(passwordRecordKey, null, JSON.stringify(record)) ? record : null;
}

// Shared durable counters prevent serverless instances from resetting the limit.
// Only an HMAC of the platform-supplied client address is retained.
export async function allowLoginAttempt(store, master, request, now = Date.now()) {
  // Vercel overwrites these at its edge; prefer its dedicated header when present.
  // https://vercel.com/docs/headers/request-headers#x-vercel-forwarded-for
  const address = (request.headers.get('x-vercel-forwarded-for') ?? request.headers.get('x-forwarded-for'))?.split(',')[0].trim() || 'unknown';
  const identity = createHmac('sha256', master).update(`fieldnotes/login/v1:${address}`).digest('hex');
  const key = `fieldnotes:v1:login:${identity}`, duration = 15 * 60 * 1000;
  for (let retry = 0; retry < 8; retry++) {
    const previous = await store.get(key), current = previous === null ? null : JSON.parse(previous);
    if (previous !== null && (!current || Array.isArray(current) || !Number.isInteger(current.attempts) || current.attempts < 0 ||
        current.attempts > 10 || !Number.isSafeInteger(current.until) || current.until < 0)) {
      throw new Error('Login attempt storage is unavailable.');
    }
    const state = current && current.until > now ? current : { attempts: 0, until: now + duration };
    if (state.attempts >= 10) return false;
    if (await store.compareAndSwap(key, previous, JSON.stringify({ ...state, attempts: state.attempts + 1 }))) return true;
  }
  return false;
}
