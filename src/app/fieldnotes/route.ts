import assets from '@/lib/fieldnotes/assets.json';
import { accessCode, cookieValue, sameSecret, sessionHeader, validSession } from '@/lib/fieldnotes/auth.mjs';
import { html, landing, privateHeaders } from '@/lib/fieldnotes/http.mjs';
import { sharedAuthentication as authentication } from '@/lib/fieldnotes/shared-auth.mjs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const { key, master, record } = await authentication(), url = new URL(request.url);
    if (!record && sameSecret(url.searchParams.get('access'), accessCode(master))) {
      return new Response(null, { status: 303, headers: { ...privateHeaders, Location: '/fieldnotes/password', 'Set-Cookie': sessionHeader(key, request) } });
    }
    if (!validSession(key, cookieValue(request))) return html(landing('', !record));
    if (!record) return new Response(null, { status: 303, headers: { ...privateHeaders, Location: '/fieldnotes/password' } });
    return html(assets['index.html']);
  } catch { return html('<h1>Fieldnotes</h1><p>Private access is being configured.</p>', 503); }
}
