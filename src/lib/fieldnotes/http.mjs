export const privateHeaders = {
  'Cache-Control': 'private, no-store',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'X-Robots-Tag': 'noindex, nofollow',
  'Content-Security-Policy': "default-src 'self'; img-src 'self' https: http:; style-src 'self'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
};
export function json(body, status = 200, extra = {}) {
  return Response.json(body, { status, headers: { ...privateHeaders, ...extra } });
}
export function landing(error = '') {
  return `<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Private collection — Fieldnotes</title><link rel="stylesheet" href="/fieldnotes/assets/style.css"></head><body><main><h1>Fieldnotes</h1><p>Your private clothing archive.</p><p>Open your private access link, or enter your access code.</p><form method="post" action="/fieldnotes/unlock"><label for="access">Access code</label><input id="access" name="access" type="password" autocomplete="current-password" maxlength="256" required><button type="submit">Open Fieldnotes →</button></form>${error ? '<p role="alert">That access code did not match.</p>' : ''}</main></body></html>`;
}
export function html(body, status = 200, extra = {}) {
  return new Response(body, { status, headers: { ...privateHeaders, 'Content-Type': 'text/html; charset=utf-8', ...extra } });
}
export async function boundedBody(request, max = 8192) {
  const reader = request.body?.getReader();
  if (!reader) throw new Error('Invalid request body');
  const chunks = []; let total = 0;
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > max) { await reader.cancel(); throw new Error('Request body too long'); }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString('utf8');
}
