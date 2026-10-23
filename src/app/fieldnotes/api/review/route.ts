import { cookieValue, validSession, validWrite } from '@/lib/fieldnotes/auth.mjs';
import { boundedBody, json } from '@/lib/fieldnotes/http.mjs';
import { configuredStore } from '@/lib/fieldnotes/storage.mjs';
import { saveReview, validateReview } from '@/lib/fieldnotes/reviews.mjs';
import { snapshot } from '@/lib/fieldnotes/runtime';
import { authentication } from '@/lib/fieldnotes/password.mjs';

export const runtime = 'nodejs';
export async function POST(request: Request) {
  try {
    const { key } = await authentication();
    if (!validSession(key, cookieValue(request))) return json({ error: 'Log in to Fieldnotes to continue.' }, 401);
    if (!validWrite(request, key)) return json({ error: 'Reload Fieldnotes before saving.' }, 403);
    if (!request.headers.get('content-type')?.startsWith('application/json')) return json({ error: 'JSON required' }, 415);
    let input;
    try { input = validateReview(JSON.parse(await boundedBody(request))); } catch { return json({ error: 'Invalid or oversized review' }, 400); }
    if (!input) return json({ error: 'Invalid review' }, 400);
    const source = snapshot(), item = source.catalog.items.find(row => row.candidate.id === input.id);
    if (!item) return json({ error: 'Listing no longer exists' }, 404);
    if (!await saveReview(configuredStore(), item, input, source.manifest)) return json({ error: 'Another device updated this piece. Try saving again.' }, 409);
    return json({ id: input.id, status: input.status });
  } catch { return json({ error: 'Your decision could not be saved. Try again.' }, 503); }
}
