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
function accountPage(content) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Private collection — Fieldnotes</title><link rel="stylesheet" href="/fieldnotes/assets/style.css"></head><body class="account-page"><main class="account-card"><a class="wordmark" href="/fieldnotes">fieldnotes/</a>${content}</main></body></html>`;
}
export function landing(error = '', bootstrap = false) {
  const field = bootstrap ? 'access' : 'password', label = bootstrap ? 'Access code' : 'Password';
  const message = error === 'limited' ? 'Too many attempts. Try again in 15 minutes.' : bootstrap ? 'That access code did not match.' : 'That password did not match.';
  return accountPage(`<h1>Your private clothing archive</h1><p>${bootstrap ? 'Open your private setup link, or enter your existing access code to choose a password.' : 'Log in with your Fieldnotes password.'}</p><form method="post" action="/fieldnotes/unlock"><label for="${field}">${label}</label><input id="${field}" name="${field}" type="password" autocomplete="current-password" maxlength="256" required><button type="submit">Open Fieldnotes →</button></form>${error ? `<p role="alert">${message}</p>` : ''}`);
}
export function passwordSetup(token, error = '') {
  const safeToken = /^[A-Za-z0-9_-]{43}$/.test(token) ? token : '';
  const messages = { mismatch: 'The passwords did not match. Try again.', weak: 'Use between 12 and 128 characters.', conflict: 'A password has already been set. Log in with it.', invalid: 'Reload this page and try again.' };
  return accountPage(`<h1>Choose your password</h1><p>Use this password to open Fieldnotes on any device.</p><form method="post" action="/fieldnotes/password"><input type="hidden" name="csrf" value="${safeToken}"><label for="password">Password</label><input id="password" name="password" type="password" autocomplete="new-password" minlength="12" maxlength="256" aria-describedby="password-help" required><p id="password-help">At least 12 characters. A few words work well.</p><label for="confirm">Confirm password</label><input id="confirm" name="confirm" type="password" autocomplete="new-password" minlength="12" maxlength="256" required><button type="submit">Set password</button></form>${error ? `<p role="alert">${messages[error] ?? messages.invalid}</p>` : ''}`);
}
export function passwordReady(token) {
  const safeToken = /^[A-Za-z0-9_-]{43}$/.test(token) ? token : '';
  return accountPage(`<h1>Your password is set</h1><p>Open kasptrax.com/fieldnotes and use your password on any device.</p><p><a href="/fieldnotes">Back to Fieldnotes →</a></p><form method="post" action="/fieldnotes/logout"><input type="hidden" name="csrf" value="${safeToken}"><button type="submit">Log out</button></form>`);
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
