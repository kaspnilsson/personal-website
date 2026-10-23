import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { makeSession, csrfToken, sameOrigin, validForm, validWrite } from '../src/lib/fieldnotes/auth.mjs';

test('Next loopback normalization accepts the real browser origin without trusting foreign Host', () => {
  const key = randomBytes(32), session = makeSession(key);
  const request = (origin, host) => new Request('http://localhost:3002/fieldnotes/api/review', { method:'POST', headers:{origin,host,cookie:`fieldnotes_session=${session}`,'x-review-token':csrfToken(key,session),'sec-fetch-site':'same-origin'} });
  assert(validWrite(request('http://127.0.0.1:3002','127.0.0.1:3002'),key,{NODE_ENV:'development'}));
  assert(!validWrite(request('https://attacker.example','attacker.example'),key,{NODE_ENV:'development'}));
  assert(validWrite(request('https://www.kasptrax.com','www.kasptrax.com'),key,{NODE_ENV:'production',SITE_ORIGIN:'https://www.kasptrax.com'}));
  assert(!validWrite(request('http://127.0.0.1:3002','127.0.0.1:3002'),key,{NODE_ENV:'production',SITE_ORIGIN:'https://www.kasptrax.com'}));
  assert(validWrite(request('https://preview.vercel.app','preview.vercel.app'),key,{NODE_ENV:'production',VERCEL_ENV:'preview',VERCEL_URL:'preview.vercel.app',SITE_ORIGIN:'https://www.kasptrax.com'}));
});

test('preview deployment and branch hosts require their own exact Origin', () => {
  const deployment = 'fixture-deployment.vercel.app', branch = 'fixture-git-branch.vercel.app';
  const env = { NODE_ENV:'production', VERCEL_ENV:'preview', VERCEL_URL:deployment, VERCEL_BRANCH_URL:branch, SITE_ORIGIN:'https://www.kasptrax.com' };
  const request = (origin, host, extra = {}) => new Request(`https://${deployment}/fieldnotes/unlock`, {
    method:'POST', headers:{ ...(origin === undefined ? {} : {origin}), host, 'sec-fetch-site':'same-origin', ...extra },
  });
  for (const host of [deployment, branch]) assert(sameOrigin(request(`https://${host}`, host), env));
  // The adapter may normalize Request.url; Host still identifies an allowlisted target.
  assert(sameOrigin(request(`https://${branch}`, branch), env));
  assert(sameOrigin(new Request(`https://${branch}/fieldnotes/unlock`, {headers:{origin:`https://${branch}`}}), env));
  for (const [origin, host, extra] of [
    [`https://${branch}`, deployment], [`https://${deployment}`, branch],
    ['https://attacker.example', 'attacker.example'], [`https://${branch}.evil.example`, `${branch}.evil.example`],
    [`http://${branch}`, branch], [`https://${branch}:8443`, branch],
    [undefined, branch], ['null', branch], [`https://${branch}`, branch, {'sec-fetch-site':'cross-site'}],
    [`https://${branch}`, deployment, {'x-forwarded-host':branch}],
    ['https://attacker.example', 'attacker.example', {'x-forwarded-host':branch}],
  ]) assert.equal(sameOrigin(request(origin, host, extra), env), false, JSON.stringify({origin,host,extra}));
  const noBranch = { ...env, VERCEL_BRANCH_URL:undefined };
  assert(sameOrigin(request(`https://${deployment}`, deployment), noBranch));
  assert(!sameOrigin(request(`https://${branch}`, branch), noBranch));
  assert(!sameOrigin(request(`https://${branch}`, branch), { ...env, VERCEL_ENV:'production' }));
});

test('branch-preview forms and review writes still require valid session and CSRF', () => {
  const host = 'fixture-git-branch.vercel.app', origin = `https://${host}`;
  const env = { NODE_ENV:'production', VERCEL_ENV:'preview', VERCEL_URL:'fixture-deployment.vercel.app', VERCEL_BRANCH_URL:host };
  const key = randomBytes(32), session = makeSession(key), token = csrfToken(key,session);
  const request = (extra = {}) => new Request(`${origin}/fieldnotes/api/review`, {
    method:'POST', headers:{host,origin,cookie:`fieldnotes_session=${session}`,'sec-fetch-site':'same-origin','x-review-token':token,...extra},
  });
  assert(validWrite(request(),key,env));
  assert(validForm(request(),key,token,env));
  for (const extra of [{cookie:''},{'x-review-token':''},{'x-review-token':'wrong'},{origin:'https://other.vercel.app'}]) assert(!validWrite(request(extra),key,env));
  for (const badToken of [undefined,'','wrong']) assert(!validForm(request(),key,badToken,env));
  assert(!validForm(request({cookie:''}),key,token,env));
});
