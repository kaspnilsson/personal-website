import { cookieValue, csrfToken, masterSecret, validSession } from '@/lib/fieldnotes/auth.mjs';
import { json } from '@/lib/fieldnotes/http.mjs';
import { browserCatalog } from '@/lib/fieldnotes/runtime';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export async function GET(request: Request) {
  try {
    const key = masterSecret(), session = cookieValue(request);
    if (!validSession(key, session)) return json({ error: 'Open your private Fieldnotes link to continue.' }, 401);
    return json({ ...await browserCatalog(), token: csrfToken(key, session) });
  } catch { return json({ error: 'Your private collection is temporarily unavailable.' }, 503); }
}
