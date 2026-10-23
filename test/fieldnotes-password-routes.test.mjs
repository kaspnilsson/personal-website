import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';
import * as auth from '../src/lib/fieldnotes/auth.mjs';
import * as password from '../src/lib/fieldnotes/password.mjs';
import * as http from '../src/lib/fieldnotes/http.mjs';
import { validateReview } from '../src/lib/fieldnotes/reviews.mjs';

// Transpile only the route under test. Every import is supplied explicitly below;
// neither the real runtime nor its catalog/assets can be imported by this harness.
const origin = 'https://fixture.example', env = { NODE_ENV: 'production', SITE_ORIGIN: origin };
const master = randomBytes(32), fixturePassword = '  袖と服 é 😀 twelve  ';
const record = await password.makePasswordRecord(fixturePassword);
const compiled = new Map();
async function loadRoute(path, dependencies) {
  if (!compiled.has(path)) {
    const source = await readFile(new URL(`../src/app/fieldnotes/${path}`, import.meta.url), 'utf8');
    compiled.set(path, ts.transpileModule(source, { compilerOptions: {
      module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true,
    } }).outputText);
  }
  const exports = {};
  vm.runInNewContext(compiled.get(path), {
    exports, Request, Response, URL, URLSearchParams, Buffer,
    require(specifier) {
      assert.ok(Object.hasOwn(dependencies, specifier), `unexpected route import: ${specifier}`);
      return dependencies[specifier];
    },
  }, { filename: `synthetic-fieldnotes/${path}`, timeout: 1000 });
  return exports;
}
function harness(initial = null) {
  const values = new Map(initial === null ? [] : [[password.passwordRecordKey, JSON.stringify(initial)]]);
  const calls = { authentication: 0, verify: 0, setup: 0, quota: 0, catalog: 0, snapshot: 0, save: 0, events: [] };
  const store = {
    values,
    async get(key) { return values.has(key) ? values.get(key) : null; },
    async compareAndSwap(key, previous, next) {
      if ((values.has(key) ? values.get(key) : null) !== previous) return false;
      values.set(key, next);
      return true;
    },
  };
  const passwordAPI = {
    ...password,
    async authentication() { calls.authentication++; return password.authentication(store, master); },
    async allowLoginAttempt(...args) { calls.quota++; const result = await password.allowLoginAttempt(...args); calls.events.push('durable quota'); return result; },
    async verifyPassword(...args) { calls.verify++; calls.events.push('verify'); return password.verifyPassword(...args); },
    async setInitialPassword(...args) { calls.setup++; return password.setInitialPassword(...args); },
  };
  const dependencies = {
    '@/lib/fieldnotes/auth.mjs': {
      ...auth,
      sameOrigin: request => auth.sameOrigin(request, env),
      validForm: (request, key, token) => auth.validForm(request, key, token, env),
      validWrite: (request, key) => auth.validWrite(request, key, env),
    },
    '@/lib/fieldnotes/password.mjs': passwordAPI,
    '@/lib/fieldnotes/shared-auth.mjs': { sharedAuthentication: () => passwordAPI.authentication() },
    '@/lib/fieldnotes/http.mjs': http,
    '@/lib/fieldnotes/assets.json': { 'index.html': '<!doctype html><p>SYNTHETIC PRIVATE APP</p>' },
    '@/lib/fieldnotes/runtime': {
      async browserCatalog() { calls.catalog++; return { fixture: 'synthetic catalog response' }; },
      snapshot() { calls.snapshot++; return { catalog: { items: [{ candidate: { id: 'synthetic-item' } }] }, manifest: {} }; },
    },
    '@/lib/fieldnotes/storage.mjs': { configuredStore: () => store },
    '@/lib/fieldnotes/reviews.mjs': { validateReview, async saveReview() { calls.save++; return true; } },
  };
  return { store, calls, passwordAPI, route: path => loadRoute(path, dependencies) };
}
const key = password.passwordSessionKey(master, record);
const bootstrapSession = auth.makeSession(master), currentSession = auth.makeSession(key);
const cookie = session => `${auth.sessionCookieName}=${session}`;
function formRequest(path, fields, session, changes = {}) {
  const headers = { origin, 'sec-fetch-site': 'same-origin', 'content-type': 'application/x-www-form-urlencoded', ...changes };
  if (session) headers.cookie = cookie(session);
  for (const name of Object.keys(headers)) if (headers[name] === null) delete headers[name];
  return new Request(`${origin}/fieldnotes/${path}`, { method: 'POST', headers, body: typeof fields === 'string' ? fields : new URLSearchParams(fields) });
}
const setupFields = (changes = {}) => ({ csrf: auth.csrfToken(master, bootstrapSession), password: fixturePassword, confirm: fixturePassword, ...changes });
function assertPrivate(response) {
  assert.equal(response.headers.get('cache-control'), 'private, no-store');
  assert.equal(response.headers.get('referrer-policy'), 'no-referrer');
  assert.equal(response.headers.get('x-robots-tag'), 'noindex, nofollow');
}

test('root GET requires the nonempty bootstrap HMAC and hides setup access after credentials exist', async () => {
  const before = harness(), root = await before.route('route.ts');
  for (const suffix of ['', '?access=', '?access=wrong']) {
    const response = await root.GET(new Request(`${origin}/fieldnotes${suffix}`));
    assert.equal(response.status, 200);
    assert.equal(response.headers.has('set-cookie'), false);
    assert.match(await response.text(), /name="access"/);
    assertPrivate(response);
  }
  const setup = await root.GET(new Request(`${origin}/fieldnotes?access=${auth.accessCode(master)}`));
  assert.equal(setup.status, 303);
  assert.equal(setup.headers.get('location'), '/fieldnotes/password');
  assert.equal(auth.validSession(master, setup.headers.get('set-cookie').split(';')[0].split('=')[1]), true);
  const after = harness(record), protectedRoot = await after.route('route.ts');
  const denied = await protectedRoot.GET(new Request(`${origin}/fieldnotes?access=${auth.accessCode(master)}`, { headers: { cookie: cookie(bootstrapSession) } }));
  assert.equal(denied.status, 200);
  assert.equal(denied.headers.has('set-cookie'), false);
  const markup = await denied.text();
  assert.match(markup, /name="password"/);
  assert.equal(markup.includes('SYNTHETIC PRIVATE APP'), false);
  assert.equal(markup.includes('name="access"'), false);
  const allowed = await protectedRoot.GET(new Request(`${origin}/fieldnotes`, { headers: { cookie: cookie(currentSession) } }));
  assert.match(await allowed.text(), /SYNTHETIC PRIVATE APP/);
});

test('setup GET accepts the current epoch, redirects anonymous and old sessions, and issues hidden form CSRF', async () => {
  const before = await harness().route('password/route.ts');
  assert.equal((await before.GET(new Request(`${origin}/fieldnotes/password`))).status, 303);
  const setup = await before.GET(new Request(`${origin}/fieldnotes/password`, { headers: { cookie: cookie(bootstrapSession) } }));
  assert.equal(setup.status, 200);
  assert.match(await setup.text(), new RegExp(`name="csrf" value="${auth.csrfToken(master, bootstrapSession)}"`));
  const after = await harness(record).route('password/route.ts');
  assert.equal((await after.GET(new Request(`${origin}/fieldnotes/password`, { headers: { cookie: cookie(bootstrapSession) } }))).status, 303);
  const ready = await after.GET(new Request(`${origin}/fieldnotes/password`, { headers: { cookie: cookie(currentSession) } }));
  assert.match(await ready.text(), /Your password is set/);
  assertPrivate(ready);
});

test('setup POST requires bootstrap session, exact origin, fetch metadata, and matching form CSRF', async () => {
  const h = harness(), route = await h.route('password/route.ts');
  const cases = [
    [setupFields(), undefined, {}, 303],
    [setupFields(), bootstrapSession, { origin: 'https://attacker.example' }, 403],
    [setupFields(), bootstrapSession, { origin: null }, 403],
    [setupFields(), bootstrapSession, { 'sec-fetch-site': 'cross-site' }, 403],
    [setupFields({ csrf: '' }), bootstrapSession, {}, 403],
    [setupFields({ csrf: 'wrong' }), bootstrapSession, {}, 403],
  ];
  for (const [fields, session, headers, status] of cases) {
    const response = await route.POST(formRequest('password', fields, session, headers));
    assert.equal(response.status, status);
    assert.equal(response.headers.has('set-cookie'), false);
    assertPrivate(response);
  }
  assert.equal(h.calls.setup, 0);
  assert.equal(h.store.values.has(password.passwordRecordKey), false);
});

test('setup POST rejects wrong media type, oversized bytes, weak passwords, and mismatched confirmation', async () => {
  const h = harness(), route = await h.route('password/route.ts');
  const cases = [
    [setupFields(), { 'content-type': 'application/json' }, 415],
    ['x'.repeat(8193), {}, 400],
    [setupFields({ password: 'short', confirm: 'short' }), {}, 400],
    [setupFields({ password: '😀'.repeat(129), confirm: '😀'.repeat(129) }), {}, 400],
    [setupFields({ confirm: `${fixturePassword}!` }), {}, 400],
  ];
  for (const [fields, headers, status] of cases) {
    const response = await route.POST(formRequest('password', fields, bootstrapSession, headers));
    assert.equal(response.status, status);
    assert.equal(response.headers.has('set-cookie'), false);
  }
  assert.equal(h.calls.setup, 0);
});

test('setup and login round-trip the maximum URL-encoded Unicode password and rotate the session', async () => {
  const h = harness(), route = await h.route('password/route.ts'), value = '😀'.repeat(128);
  const response = await route.POST(formRequest('password', setupFields({ password: value, confirm: value }), bootstrapSession));
  assert.equal(response.status, 303);
  assert.equal(response.headers.get('location'), '/fieldnotes');
  const created = JSON.parse(h.store.values.get(password.passwordRecordKey));
  assert.equal(await password.verifyPassword(value, created), true);
  const issued = response.headers.get('set-cookie').split(';')[0].split('=')[1], nextKey = password.passwordSessionKey(master, created);
  assert.equal(auth.validSession(nextKey, issued), true);
  assert.equal(auth.validSession(master, issued), false);
  assert.equal(auth.validSession(nextKey, bootstrapSession), false);
  for (const attribute of ['HttpOnly', 'SameSite=Lax', 'Path=/fieldnotes', 'Secure']) assert.ok(response.headers.get('set-cookie').includes(attribute));
  assertPrivate(response);
  const unlock = await h.route('unlock/route.ts');
  const login = await unlock.POST(formRequest('unlock', { password: value }));
  assert.equal(login.status, 303, 'the same maximum password fits the smaller login body limit');
  assert.equal(auth.validSession(nextKey, login.headers.get('set-cookie').split(';')[0].split('=')[1]), true);
});

test('concurrent setup route requests issue a password session only to the CAS winner', async () => {
  const h = harness(), route = await h.route('password/route.ts');
  const results = await Promise.all(['first concurrent fixture', 'second concurrent fixture'].map(value => route.POST(formRequest('password', setupFields({ password: value, confirm: value }), bootstrapSession))));
  assert.ok(results.every(response => response.status === 303));
  assert.equal(results.filter(response => response.headers.has('set-cookie')).length, 1);
  const created = JSON.parse(h.store.values.get(password.passwordRecordKey)), nextKey = password.passwordSessionKey(master, created);
  const issued = results.find(response => response.headers.has('set-cookie')).headers.get('set-cookie').split(';')[0].split('=')[1];
  assert.equal(auth.validSession(nextKey, issued), true);
  assert.equal(h.calls.setup, 2);
});

test('configured credentials cannot be overwritten through setup, even with a valid current session', async () => {
  const h = harness(record), route = await h.route('password/route.ts');
  const response = await route.POST(formRequest('password', { csrf: auth.csrfToken(key, currentSession), password: 'replacement fixture password', confirm: 'replacement fixture password' }, currentSession));
  assert.equal(response.status, 409);
  assert.equal(h.calls.setup, 0);
  assert.deepEqual(JSON.parse(h.store.values.get(password.passwordRecordKey)), record);
  assert.equal(response.headers.has('set-cookie'), false);
});

test('setup durable-write errors and lost CAS races never issue an authenticated cookie', async () => {
  for (const writeError of [false, true]) {
    const h = harness();
    h.store.compareAndSwap = async () => { if (writeError) throw new Error('fixture setup storage unavailable'); return false; };
    const route = await h.route('password/route.ts');
    const response = await route.POST(formRequest('password', setupFields(), bootstrapSession));
    assert.equal(response.status, writeError ? 503 : 303);
    assert.equal(response.headers.has('set-cookie'), false);
    assert.equal(h.store.values.has(password.passwordRecordKey), false);
    assertPrivate(response);
  }
});

test('login POST checks origin and media type before accessing credentials or spending hash work', async () => {
  const h = harness(record), route = await h.route('unlock/route.ts');
  for (const [headers, status] of [[{ origin: 'https://attacker.example' }, 403], [{ origin: null }, 403], [{ 'sec-fetch-site': 'cross-site' }, 403], [{ 'content-type': 'application/json' }, 415]]) {
    const response = await route.POST(formRequest('unlock', { password: fixturePassword }, undefined, headers));
    assert.equal(response.status, status);
    assert.equal(response.headers.has('set-cookie'), false);
  }
  assert.equal(h.calls.authentication, 0);
  assert.equal(h.calls.quota, 0);
  assert.equal(h.calls.verify, 0);
});

test('login POST commits its durable quota before real verification and preserves password whitespace', async () => {
  const h = harness(record), route = await h.route('unlock/route.ts');
  const response = await route.POST(formRequest('unlock', { password: fixturePassword }));
  assert.equal(response.status, 303);
  assert.equal(response.headers.get('location'), '/fieldnotes');
  assert.deepEqual(h.calls.events, ['durable quota', 'verify']);
  assert.equal(auth.validSession(key, response.headers.get('set-cookie').split(';')[0].split('=')[1]), true);
  assert.equal(JSON.parse([...h.store.values].find(([name]) => name.startsWith('fieldnotes:v1:login:'))[1]).attempts, 1);
  const trimmed = await route.POST(formRequest('unlock', { password: fixturePassword.trim() }));
  assert.equal(trimmed.status, 401);
  assert.equal(trimmed.headers.has('set-cookie'), false);
  assertPrivate(response);
});

test('a configured password disables access-code login and missing passwords never authenticate', async () => {
  const h = harness(record), route = await h.route('unlock/route.ts');
  for (const fields of [{ access: auth.accessCode(master) }, {}, { password: '' }, { password: auth.accessCode(master) }]) {
    const response = await route.POST(formRequest('unlock', fields));
    assert.equal(response.status, 401);
    assert.equal(response.headers.has('set-cookie'), false);
  }
  const bootstrap = await harness().route('unlock/route.ts');
  const accepted = await bootstrap.POST(formRequest('unlock', { access: auth.accessCode(master) }));
  assert.equal(accepted.status, 303);
  assert.equal(accepted.headers.get('location'), '/fieldnotes/password');
});

test('exhausted or failing durable quota prevents body consumption and password verification', async () => {
  for (const unavailable of [false, true]) {
    const h = harness(record);
    h.passwordAPI.allowLoginAttempt = async () => { if (unavailable) throw new Error('fixture quota unavailable'); return false; };
    const route = await h.route('unlock/route.ts'), request = formRequest('unlock', { password: fixturePassword });
    const response = await route.POST(request);
    assert.equal(response.status, unavailable ? 503 : 429);
    if (!unavailable) assert.equal(response.headers.get('retry-after'), '900');
    assert.equal(request.bodyUsed, false);
    assert.equal(h.calls.verify, 0);
    assert.equal(response.headers.has('set-cookie'), false);
  }
});

test('oversized login form is rejected after quota reservation and before verification', async () => {
  const h = harness(record), route = await h.route('unlock/route.ts');
  const response = await route.POST(formRequest('unlock', 'password=' + 'x'.repeat(4096)));
  assert.equal(response.status, 400);
  assert.equal(h.calls.quota, 1);
  assert.equal(h.calls.verify, 0);
  assert.equal(response.headers.has('set-cookie'), false);
});

test('logout requires a current session plus same-origin form CSRF and expires the scoped cookie', async () => {
  const h = harness(record), route = await h.route('logout/route.ts'), token = auth.csrfToken(key, currentSession);
  for (const [session, fields, headers] of [
    [undefined, { csrf: token }, {}], [currentSession, {}, {}], [currentSession, { csrf: 'wrong' }, {}],
    [bootstrapSession, { csrf: auth.csrfToken(master, bootstrapSession) }, {}],
    [currentSession, { csrf: token }, { origin: 'https://attacker.example' }],
    [currentSession, { csrf: token }, { 'sec-fetch-site': 'cross-site' }],
  ]) {
    const denied = await route.POST(formRequest('logout', fields, session, headers));
    assert.equal(denied.status, 403);
    assert.equal(denied.headers.has('set-cookie'), false);
  }
  const accepted = await route.POST(formRequest('logout', { csrf: token }, currentSession));
  assert.equal(accepted.status, 303);
  assert.equal(accepted.headers.get('location'), '/fieldnotes');
  for (const attribute of [`${auth.sessionCookieName}=;`, 'Max-Age=0', 'Path=/fieldnotes', 'HttpOnly', 'SameSite=Lax', 'Secure']) assert.ok(accepted.headers.get('set-cookie').includes(attribute));
  assertPrivate(accepted);
});

test('catalog and review APIs reject bootstrap cookies after setup and use the new epoch for CSRF', async () => {
  const h = harness(record), catalog = await h.route('api/catalog/route.ts'), review = await h.route('api/review/route.ts');
  const oldCatalog = await catalog.GET(new Request(`${origin}/fieldnotes/api/catalog`, { headers: { cookie: cookie(bootstrapSession) } }));
  assert.equal(oldCatalog.status, 401);
  const reviewRequest = (session, token) => new Request(`${origin}/fieldnotes/api/review`, { method: 'POST', headers: {
    origin, cookie: cookie(session), 'content-type': 'application/json', ...(token ? { 'x-review-token': token } : {}),
  }, body: JSON.stringify({ id: 'synthetic-item', status: 'liked' }) });
  assert.equal((await review.POST(reviewRequest(bootstrapSession, auth.csrfToken(master, bootstrapSession)))).status, 401);
  assert.equal(h.calls.catalog, 0);
  assert.equal(h.calls.snapshot, 0);
  const current = await catalog.GET(new Request(`${origin}/fieldnotes/api/catalog`, { headers: { cookie: cookie(currentSession) } }));
  const body = await current.json();
  assert.equal(body.fixture, 'synthetic catalog response');
  assert.equal(body.token, auth.csrfToken(key, currentSession));
  for (const token of [undefined, auth.csrfToken(master, bootstrapSession)]) assert.equal((await review.POST(reviewRequest(currentSession, token))).status, 403);
  assert.equal((await review.POST(reviewRequest(currentSession, body.token))).status, 200);
  assert.equal(h.calls.save, 1);
  assertPrivate(current);
});

test('credential corruption and read errors fail closed across every account/API route', async () => {
  for (const failure of ['missing result', 'corrupt record', 'read error']) {
    const h = harness(record);
    h.store.get = async () => { if (failure === 'read error') throw new Error('fixture read unavailable'); return failure === 'corrupt record' ? '{}' : undefined; };
    for (const [path, method] of [['route.ts', 'GET'], ['password/route.ts', 'GET'], ['password/route.ts', 'POST'], ['unlock/route.ts', 'POST'], ['logout/route.ts', 'POST'], ['api/catalog/route.ts', 'GET'], ['api/review/route.ts', 'POST']]) {
      const route = await h.route(path), request = method === 'GET'
        ? new Request(`${origin}/fieldnotes`, { headers: { cookie: cookie(currentSession) } })
        : formRequest('password', { csrf: auth.csrfToken(key, currentSession), password: fixturePassword }, currentSession);
      const response = await route[method](request);
      assert.equal(response.status, 503, `${failure}: ${path} ${method}`);
      assert.equal(response.headers.has('set-cookie'), false);
      assertPrivate(response);
    }
    assert.equal(h.calls.catalog, 0);
    assert.equal(h.calls.snapshot, 0);
    assert.equal(h.calls.verify, 0);
    assert.equal(h.calls.setup, 0);
  }
});
