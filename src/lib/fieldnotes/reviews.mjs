import { applyShoppingFeedback } from './feedback-state.mjs';
import { reviewStorageKey } from './storage.mjs';

const actions = { liked: 'positive', watching: 'watch', rejected: 'negative', new: 'reset' };
export function validateReview(value) {
  const { id, status, note = '' } = value ?? {};
  return typeof id === 'string' && id.length > 0 && id.length <= 256 && typeof status === 'string' && Object.hasOwn(actions, status) && typeof note === 'string' && note.length <= 2000 ? { id, status, note } : null;
}
export async function saveReview(store, item, input, manifest) {
  const key = reviewStorageKey(item.reviewKey);
  for (let attempt = 0; attempt < 8; attempt++) {
    const raw = await store.get(key), previous = raw ? JSON.parse(raw) : { state: { status: item.status, reviewNote: item.reviewNote ?? '' }, events: [], revision: 0 };
    const result = applyShoppingFeedback({ version: 1, candidates: { [input.id]: previous.state }, stats: { feedbackEvents: 0 } }, { candidateIds: [input.id], intents: [actions[input.status]], raw: input.note || `Browser: ${input.status}`, needsReview: false }, manifest);
    const state = result.state.candidates[input.id];
    state.reviewNote = input.note || previous.state.reviewNote || '';
    if (input.status === 'new') { state.status = 'new'; state.signals = []; }
    const next = { revision: previous.revision + 1, state, events: [...previous.events, result.event] };
    if (await store.compareAndSwap(key, raw, JSON.stringify(next))) return true;
  }
  return false;
}
