import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { makeSession, csrfToken, validWrite } from '../src/lib/fieldnotes/auth.mjs';

test('Next loopback normalization accepts the real browser origin without trusting foreign Host', () => {
  const key = randomBytes(32), session = makeSession(key);
  const request = (origin, host) => new Request('http://localhost:3002/fieldnotes/api/review', { method:'POST', headers:{origin,host,cookie:`fieldnotes_session=${session}`,'x-review-token':csrfToken(key,session),'sec-fetch-site':'same-origin'} });
  assert(validWrite(request('http://127.0.0.1:3002','127.0.0.1:3002'),key,{NODE_ENV:'development'}));
  assert(!validWrite(request('https://attacker.example','attacker.example'),key,{NODE_ENV:'development'}));
  assert(validWrite(request('https://www.kasptrax.com','www.kasptrax.com'),key,{NODE_ENV:'production',SITE_ORIGIN:'https://www.kasptrax.com'}));
  assert(!validWrite(request('http://127.0.0.1:3002','127.0.0.1:3002'),key,{NODE_ENV:'production',SITE_ORIGIN:'https://www.kasptrax.com'}));
  assert(validWrite(request('https://preview.vercel.app','preview.vercel.app'),key,{NODE_ENV:'production',VERCEL_ENV:'preview',VERCEL_URL:'preview.vercel.app',SITE_ORIGIN:'https://www.kasptrax.com'}));
});
