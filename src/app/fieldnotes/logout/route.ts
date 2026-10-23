import { expiredSessionHeader, validForm } from '@/lib/fieldnotes/auth.mjs';
import { boundedBody, html, notice, privateHeaders } from '@/lib/fieldnotes/http.mjs';
import { sharedAuthentication as authentication } from '@/lib/fieldnotes/shared-auth.mjs';

export const runtime = 'nodejs';
export async function POST(request: Request) {
  try {
    const { key } = await authentication(), form = new URLSearchParams(await boundedBody(request, 1024));
    if (!validForm(request, key, form.get('csrf'))) return html(notice('Log out did not finish', 'This page expired. Reload it, then log out again.'), 403);
    return new Response(null, { status: 303, headers: { ...privateHeaders, Location: '/fieldnotes', 'Set-Cookie': expiredSessionHeader(request) } });
  } catch { return html(notice('Log out did not finish', 'Fieldnotes could not log you out. Try again in a moment.'), 503); }
}
