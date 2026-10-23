import { cookieValue, csrfToken, sessionHeader, validForm, validSession } from '@/lib/fieldnotes/auth.mjs';
import { boundedBody, html, notice, passwordReady, passwordSetup, privateHeaders } from '@/lib/fieldnotes/http.mjs';
import { acceptablePassword, passwordSessionKey, setInitialPassword } from '@/lib/fieldnotes/password.mjs';
import { sharedAuthentication as authentication } from '@/lib/fieldnotes/shared-auth.mjs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
const login = () => new Response(null, { status: 303, headers: { ...privateHeaders, Location: '/fieldnotes' } });
export async function GET(request: Request) {
  try {
    const { key, record } = await authentication(), session = cookieValue(request);
    if (!validSession(key, session)) return login();
    const token = csrfToken(key, session);
    return html(record ? passwordReady(token) : passwordSetup(token));
  } catch { return html(notice('Account page unavailable', 'This page could not load. Try again in a moment.'), 503); }
}
export async function POST(request: Request) {
  try {
    const { key, master, record, store } = await authentication(), session = cookieValue(request);
    if (!validSession(key, session)) return login();
    if (record) return html(passwordReady(csrfToken(key, session)), 409);
    if (!request.headers.get('content-type')?.startsWith('application/x-www-form-urlencoded')) return html(passwordSetup(csrfToken(key, session), 'invalid'), 415);
    let form;
    try { form = new URLSearchParams(await boundedBody(request, 8192)); } catch { return html(passwordSetup(csrfToken(key, session), 'invalid'), 400); }
    if (!validForm(request, key, form.get('csrf'))) return html(passwordSetup(csrfToken(key, session), 'invalid'), 403);
    const password = form.get('password');
    if (!acceptablePassword(password)) return html(passwordSetup(csrfToken(key, session), 'weak'), 400);
    if (password !== form.get('confirm')) return html(passwordSetup(csrfToken(key, session), 'mismatch'), 400);
    const created = await setInitialPassword(store, password);
    if (!created) return login();
    return new Response(null, { status: 303, headers: { ...privateHeaders, Location: '/fieldnotes', 'Set-Cookie': sessionHeader(passwordSessionKey(master, created), request) } });
  } catch { return html(notice('Password not saved', 'Your password could not be saved. Reload the page and try again.'), 503); }
}
