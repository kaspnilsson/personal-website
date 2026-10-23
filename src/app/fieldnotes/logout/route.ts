import { expiredSessionHeader, validForm } from '@/lib/fieldnotes/auth.mjs';
import { boundedBody, html, privateHeaders } from '@/lib/fieldnotes/http.mjs';
import { authentication } from '@/lib/fieldnotes/password.mjs';

export const runtime = 'nodejs';
export async function POST(request: Request) {
  try {
    const { key } = await authentication(), form = new URLSearchParams(await boundedBody(request, 1024));
    if (!validForm(request, key, form.get('csrf'))) return html('<h1>Fieldnotes</h1><p>Reload before logging out.</p>', 403);
    return new Response(null, { status: 303, headers: { ...privateHeaders, Location: '/fieldnotes', 'Set-Cookie': expiredSessionHeader(request) } });
  } catch { return html('<h1>Fieldnotes</h1><p>Could not log out. Please try again.</p>', 503); }
}
