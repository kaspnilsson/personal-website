import { accessCode, masterSecret, sameSecret, sessionHeader } from '@/lib/fieldnotes/auth.mjs';
import { boundedBody, html, landing, privateHeaders } from '@/lib/fieldnotes/http.mjs';

export const runtime = 'nodejs';
export async function POST(request: Request) {
  try {
    const key = masterSecret(), form = new URLSearchParams(await boundedBody(request, 1024));
    if (!sameSecret(form.get('access'), accessCode(key))) return html(landing('invalid'), 401);
    return new Response(null, { status: 303, headers: { ...privateHeaders, Location: '/fieldnotes', 'Set-Cookie': sessionHeader(key, request) } });
  } catch { return html(landing('invalid'), 400); }
}
