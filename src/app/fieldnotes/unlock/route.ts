import { accessCode, sameOrigin, sameSecret, sessionHeader } from '@/lib/fieldnotes/auth.mjs';
import { boundedBody, html, landing, privateHeaders } from '@/lib/fieldnotes/http.mjs';
import { allowLoginAttempt, authentication, verifyPassword } from '@/lib/fieldnotes/password.mjs';

export const runtime = 'nodejs';
export async function POST(request: Request) {
  try {
    if (!sameOrigin(request)) return html(landing('invalid'), 403);
    if (!request.headers.get('content-type')?.startsWith('application/x-www-form-urlencoded')) return html(landing('invalid'), 415);
    const { key, master, record, store } = await authentication();
    if (!await allowLoginAttempt(store, master, request)) return html(landing('limited', !record), 429, { 'Retry-After': '900' });
    let form;
    try { form = new URLSearchParams(await boundedBody(request, 4096)); } catch { return html(landing('invalid', !record), 400); }
    const valid = record ? await verifyPassword(form.get('password'), record) : sameSecret(form.get('access'), accessCode(master));
    if (!valid) return html(landing('invalid', !record), 401);
    return new Response(null, { status: 303, headers: { ...privateHeaders, Location: record ? '/fieldnotes' : '/fieldnotes/password', 'Set-Cookie': sessionHeader(key, request) } });
  } catch { return html('<h1>Fieldnotes</h1><p>Login is temporarily unavailable. Please try again.</p>', 503); }
}
