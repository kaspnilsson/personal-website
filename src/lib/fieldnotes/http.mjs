export const privateHeaders = {
  'Cache-Control': 'private, no-store',
  'X-Content-Type-Options': 'nosniff',
  // HTML form POSTs need their same-origin Origin header. Still omit referrers
  // entirely for external listing/image destinations.
  'Referrer-Policy': 'same-origin',
  'X-Robots-Tag': 'noindex, nofollow',
  'Content-Security-Policy': "default-src 'self'; img-src 'self' https: http:; style-src 'self'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
};
export function json(body, status = 200, extra = {}) {
  return Response.json(body, { status, headers: { ...privateHeaders, ...extra } });
}
const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function accountPage(content) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta name="theme-color" content="#0a0a0a"><title>Fieldnotes / Private collection</title><link rel="stylesheet" href="/fieldnotes/assets/style.css"></head><body class="account-page"><main class="account-card"><a class="wordmark" href="/fieldnotes">Fieldnotes</a>${content}</main></body></html>`;
}
const arrow = '<span aria-hidden="true">⟶</span>';
export function landing(error = '', bootstrap = false) {
  const field = bootstrap ? 'access' : 'password', label = bootstrap ? 'Access code' : 'Password';
  const message = error === 'origin' ? 'This sign-in request could not be verified. Reload Fieldnotes and try again.' : error === 'limited' ? 'Too many attempts. Try again in 15 minutes.' : bootstrap ? 'That access code did not match. Check it and try again.' : 'That password did not match. Check it and try again.';
  return accountPage(`<h1>Your private clothing archive</h1><p>${bootstrap ? 'Open your private setup link, or enter your existing access code to choose a password.' : 'Log in with your Fieldnotes password.'}</p><form method="post" action="/fieldnotes/unlock"><label for="${field}">${label}</label><input id="${field}" name="${field}" type="password" autocomplete="current-password" maxlength="256" required${error ? ' aria-describedby="account-error"' : ''}><button type="submit"><span>Open Fieldnotes</span>${arrow}</button></form>${error ? `<p id="account-error" role="alert">${message}</p>` : ''}`);
}
export function passwordSetup(token, error = '') {
  const safeToken = /^[A-Za-z0-9_-]{43}$/.test(token) ? token : '';
  const messages = { mismatch: 'The passwords did not match. Try again.', weak: 'Use between 12 and 128 characters.', conflict: 'A password has already been set. Log in with it.', invalid: 'Reload this page and try again.' };
  return accountPage(`<h1>Choose your password</h1><p>Use this password to open Fieldnotes on any device.</p><form method="post" action="/fieldnotes/password"><input type="hidden" name="csrf" value="${safeToken}"><label for="password">Password</label><input id="password" name="password" type="password" autocomplete="new-password" minlength="12" maxlength="256" aria-describedby="password-help" required><p id="password-help">At least 12 characters. A few words work well.</p><label for="confirm">Confirm password</label><input id="confirm" name="confirm" type="password" autocomplete="new-password" minlength="12" maxlength="256" required><button type="submit"><span>Set password</span>${arrow}</button></form>${error ? `<p id="account-error" role="alert">${messages[error] ?? messages.invalid}</p>` : ''}`);
}
export function passwordReady(token) {
  const safeToken = /^[A-Za-z0-9_-]{43}$/.test(token) ? token : '';
  return accountPage(`<h1>Your password is set</h1><p>You are logged in on this device. Use the same password at kasptrax.com/fieldnotes on any other device.</p><p><a class="account-link" href="/fieldnotes"><span>Back to Fieldnotes</span>${arrow}</a></p><form class="account-secondary" method="post" action="/fieldnotes/logout"><input type="hidden" name="csrf" value="${safeToken}"><button type="submit">Log out</button></form>`);
}
// Failure pages share the account shell. Callers pass fixed copy only; it is
// escaped anyway so a future caller cannot inject markup.
export function notice(title, message, action = 'Back to Fieldnotes') {
  return accountPage(`<h1>${escapeHtml(title)}</h1><p>${escapeHtml(message)}</p><p><a class="account-link" href="/fieldnotes"><span>${escapeHtml(action)}</span>${arrow}</a></p>`);
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
