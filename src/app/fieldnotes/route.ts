import assets from '@/lib/fieldnotes/assets.json';
import { accessCode, cookieValue, masterSecret, sameSecret, sessionHeader, validSession } from '@/lib/fieldnotes/auth.mjs';
import { html, landing, privateHeaders } from '@/lib/fieldnotes/http.mjs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const key = masterSecret(), url = new URL(request.url);
    if (sameSecret(url.searchParams.get('access'), accessCode(key))) {
      return new Response(null, { status: 303, headers: { ...privateHeaders, Location: '/fieldnotes', 'Set-Cookie': sessionHeader(key, request) } });
    }
    return validSession(key, cookieValue(request)) ? html(assets['index.html']) : html(landing());
  } catch { return html('<h1>Fieldnotes</h1><p>Private access is being configured.</p>', 503); }
}
