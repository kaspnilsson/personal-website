import test from 'node:test';
import assert from 'node:assert/strict';
import { boundedBody, html, json, landing } from '../src/lib/fieldnotes/http.mjs';
import { validateReview } from '../src/lib/fieldnotes/reviews.mjs';

function chunkedRequest(chunks, headers = {}, onCancel = () => {}) {
  let index = 0;
  return new Request('https://kasptrax.com/fieldnotes/api/review', {
    method: 'POST', headers, duplex: 'half',
    body: new ReadableStream({
      pull(controller) {
        if (index === chunks.length) controller.close();
        else controller.enqueue(chunks[index++]);
      },
      cancel: onCancel,
    }, { highWaterMark: 0 }),
  });
}

test('bounded body decodes UTF-8 split across chunks and accepts the exact byte limit', async () => {
  const value = JSON.stringify({ id: 'fixture-item', status: 'liked', note: '袖 😀' });
  const bytes = Buffer.from(value);
  const split = bytes.indexOf(Buffer.from('😀')) + 2;
  const request = chunkedRequest([bytes.subarray(0, split), bytes.subarray(split)]);
  assert.equal(await boundedBody(request, bytes.byteLength), value);
  assert.deepEqual(validateReview(JSON.parse(value)), { id: 'fixture-item', status: 'liked', note: '袖 😀' });
});

test('body limits count streamed bytes without trusting Content-Length and cancel on overflow', async () => {
  let cancelled = 0;
  const request = chunkedRequest([Buffer.from('abc'), Buffer.from('def'), Buffer.from('ignored')],
    { 'content-length': '1' }, () => { cancelled++; });
  await assert.rejects(boundedBody(request, 5), /too long/);
  assert.equal(cancelled, 1);
  const multibyte = chunkedRequest([Buffer.from('袖袖')]);
  await assert.rejects(boundedBody(multibyte, 5), /too long/);
});

test('default body limit rejects a headerless streamed payload larger than 8192 bytes', async () => {
  await assert.rejects(boundedBody(chunkedRequest([Buffer.alloc(4096), Buffer.alloc(4097)])), /too long/);
  assert.equal((await boundedBody(chunkedRequest([Buffer.alloc(8192, 'x')]))).length, 8192);
});

test('body reading rejects missing bodies and propagates stream errors', async () => {
  await assert.rejects(boundedBody(new Request('https://kasptrax.com/fieldnotes/api/review', { method: 'POST' })), /Invalid request body/);
  const request = new Request('https://kasptrax.com/fieldnotes/api/review', {
    method: 'POST', duplex: 'half',
    body: new ReadableStream({ start(controller) { controller.error(new Error('fixture stream failed')); } }),
  });
  await assert.rejects(boundedBody(request), /fixture stream failed/);
});

test('review validation accepts only the supported decisions and bounds IDs and notes', () => {
  for (const status of ['liked', 'watching', 'rejected', 'new']) {
    assert.deepEqual(validateReview({ id: 'fixture-item', status }), { id: 'fixture-item', status, note: '' });
  }
  const maximum = { id: 'i'.repeat(256), status: 'liked', note: 'n'.repeat(2000) };
  assert.deepEqual(validateReview(maximum), maximum);
  assert.deepEqual(validateReview({ id: 'fixture-item', status: 'liked', extra: 'omit' }), { id: 'fixture-item', status: 'liked', note: '' });
  for (const invalid of [null, undefined, '', [], {},
    { id: '', status: 'liked' }, { id: 'i'.repeat(257), status: 'liked' }, { id: 4, status: 'liked' },
    { id: 'fixture-item', status: 'liked', note: 'n'.repeat(2001) },
    { id: 'fixture-item', status: 'liked', note: null }, { id: 'fixture-item', status: 'liked', note: [] },
    ...['constructor', 'toString', '__proto__', 'positive', 'LIKED', '', null, 1, true].map(status => ({ id: 'fixture-item', status })),
  ]) assert.equal(validateReview(invalid), null, JSON.stringify(invalid));
});

test('review status must be a string; JSON arrays must not pass enum validation by coercion', () => {
  for (const status of [['liked'], ['new'], ['watching'], ['rejected']]) {
    assert.equal(validateReview({ id: 'fixture-item', status }), null, JSON.stringify(status));
  }
});

test('JSON and HTML responses carry private cache, anti-indexing, and browser isolation headers', async () => {
  const responses = [json({ error: 'fixture error' }, 403), html(landing('invalid'), 401)];
  for (const response of responses) {
    assert.equal(response.headers.get('cache-control'), 'private, no-store');
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(response.headers.get('referrer-policy'), 'no-referrer');
    assert.equal(response.headers.get('x-robots-tag'), 'noindex, nofollow');
    const policy = response.headers.get('content-security-policy');
    for (const directive of ["default-src 'self'", "frame-ancestors 'none'", "base-uri 'none'", "form-action 'self'"]) {
      assert.ok(policy.split('; ').includes(directive), directive);
    }
  }
  assert.equal(responses[0].status, 403);
  assert.match(responses[0].headers.get('content-type'), /application\/json/);
  assert.deepEqual(await responses[0].json(), { error: 'fixture error' });
  assert.equal(responses[1].status, 401);
  assert.match(responses[1].headers.get('content-type'), /text\/html; charset=utf-8/);
  const markup = await responses[1].text();
  assert.match(markup, /action="\/fieldnotes\/unlock"/);
  assert.match(markup, /type="password"/);
  assert.match(markup, /role="alert"/);
  assert.equal(landing('<script>fixture-only</script>').includes('<script>'), false);
  assert.equal(landing().includes('role="alert"'), false);
  const redirect = html('', 303, { Location: '/fieldnotes' });
  assert.equal(redirect.headers.get('location'), '/fieldnotes');
  assert.equal(redirect.headers.get('cache-control'), 'private, no-store');
});
