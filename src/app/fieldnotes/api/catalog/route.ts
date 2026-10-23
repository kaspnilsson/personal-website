import { cookieValue, csrfToken, validSession } from '@/lib/fieldnotes/auth.mjs';
import { json } from '@/lib/fieldnotes/http.mjs';
import { browserCatalog } from '@/lib/fieldnotes/runtime';
import { authentication } from '@/lib/fieldnotes/password.mjs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export async function GET(request: Request) {
  try {
    const { key } = await authentication(), session = cookieValue(request);
    if (!validSession(key, session)) return json({ error: 'Log in to Fieldnotes to continue.' }, 401);
    return json({ ...await browserCatalog(), token: csrfToken(key, session) });
  } catch { return json({ error: 'Your private collection is temporarily unavailable.' }, 503); }
}
