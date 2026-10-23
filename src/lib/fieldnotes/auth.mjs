import { createDecipheriv, createHmac, hkdfSync, timingSafeEqual } from 'node:crypto';

export const sessionCookieName = 'fieldnotes_session';
const SESSION_SECONDS = 90 * 24 * 3600;

export function masterSecret(value = process.env.FIELDNOTES_SECRET) {
  const key = Buffer.from(value ?? '', 'base64url');
  if (key.length !== 32) throw new Error('Fieldnotes private access is not configured.');
  return key;
}
const digest = (key, text) => createHmac('sha256', key).update(text).digest('base64url');
export function sameSecret(a, b) {
  const left = Buffer.from(String(a ?? '')), right = Buffer.from(String(b ?? ''));
  return left.length === right.length && timingSafeEqual(left, right);
}
export function accessCode(key) { return digest(key, 'fieldnotes/access/v1'); }
export function makeSession(key, now = Date.now()) {
  const expires = Math.floor(now / 1000) + SESSION_SECONDS;
  return `v1.${expires}.${digest(key, `fieldnotes/session/v1:${expires}`)}`;
}
export function validSession(key, value, now = Date.now()) {
  const match = /^v1\.(\d+)\.([A-Za-z0-9_-]{43})$/.exec(value ?? '');
  return !!match && Number(match[1]) > now / 1000 && Number(match[1]) <= now / 1000 + SESSION_SECONDS + 60 && sameSecret(match[2], digest(key, `fieldnotes/session/v1:${match[1]}`));
}
export function cookieValue(request) {
  return request.headers.get('cookie')?.split(';').map(s => s.trim()).find(s => s.startsWith(`${sessionCookieName}=`))?.slice(sessionCookieName.length + 1) ?? '';
}
export function sessionHeader(key, request) {
  const secure = new URL(request.url).protocol === 'https:' || process.env.NODE_ENV === 'production';
  return `${sessionCookieName}=${makeSession(key)}; HttpOnly; SameSite=Lax; Path=/fieldnotes; Max-Age=${SESSION_SECONDS}${secure ? '; Secure' : ''}`;
}
export function csrfToken(key, session) { return digest(key, `fieldnotes/csrf/v1:${session}`); }
export function expectedOrigin(request, env = process.env) {
  if (env.VERCEL_ENV === 'preview' && env.VERCEL_URL) return new URL(`https://${env.VERCEL_URL}`).origin;
  if (env.SITE_ORIGIN) return new URL(env.SITE_ORIGIN).origin;
  // Next's local adapter normalizes Request.url to localhost even when the
  // browser used 127.0.0.1. Accept only loopback Host values in development.
  if (env.NODE_ENV !== 'production') {
    const host = request.headers.get('host');
    if (host) {
      const local = new URL(`${new URL(request.url).protocol}//${host}`);
      if (['localhost', '127.0.0.1', '[::1]'].includes(local.hostname)) return local.origin;
    }
  }
  return new URL(request.url).origin;
}
export function validWrite(request, key, env = process.env) {
  const session = cookieValue(request);
  return validSession(key, session) && request.headers.get('origin') === expectedOrigin(request, env) &&
    request.headers.get('sec-fetch-site') !== 'cross-site' && sameSecret(request.headers.get('x-review-token'), csrfToken(key, session));
}
export function decryptCatalog(envelope, key) {
  if (envelope.version !== 1) throw new Error('Unsupported private catalog.');
  const cipherKey = Buffer.from(hkdfSync('sha256', key, Buffer.from('fieldnotes'), Buffer.from('catalog-v1'), 32));
  const decipher = createDecipheriv('aes-256-gcm', cipherKey, Buffer.from(envelope.iv, 'base64url'));
  decipher.setAuthTag(Buffer.from(envelope.tag, 'base64url'));
  return JSON.parse(Buffer.concat([decipher.update(Buffer.from(envelope.ciphertext, 'base64url')), decipher.final()]).toString('utf8'));
}
