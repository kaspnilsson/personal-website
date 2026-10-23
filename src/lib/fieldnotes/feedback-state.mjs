export const EMPTY_SHOPPING_STATE = {
  version: 1,
  candidates: {},
  stats: {
    feedbackEvents: 0,
  },
};

export function applyShoppingFeedback(state, parsedFeedback, manifest = {}, receivedAt = new Date().toISOString()) {
  const nextState = cloneState(state ?? EMPTY_SHOPPING_STATE);
  nextState.version = 1;
  nextState.candidates ??= {};
  nextState.stats ??= { feedbackEvents: 0 };

  const manifestById = manifestCandidatesById(manifest);
  const event = {
    type: "shopping_feedback",
    receivedAt,
    candidateIds: parsedFeedback.candidateIds,
    intents: parsedFeedback.intents,
    itemIntents: parsedFeedback.itemIntents ?? {},
    raw: parsedFeedback.raw,
    needsReview: parsedFeedback.needsReview,
    candidateSnapshots: parsedFeedback.candidateIds
      .map((candidateId) => manifestById.get(candidateId))
      .filter(Boolean),
  };

  for (const candidateId of parsedFeedback.candidateIds) {
    const existing = nextState.candidates[candidateId] ?? {};
    const manifestCandidate = manifestById.get(candidateId) ?? {};
    const candidateIntents = parsedFeedback.itemIntents?.[candidateId] ?? parsedFeedback.intents;
    const status = nextShoppingStatus(existing.status, candidateIntents);
    const signals = mergeSignals(existing.signals, candidateIntents);

    nextState.candidates[candidateId] = {
      id: candidateId,
      title: existing.title ?? manifestCandidate.title ?? null,
      brand: existing.brand ?? manifestCandidate.brand ?? null,
      url: existing.url ?? manifestCandidate.url ?? null,
      latestScore: manifestCandidate.score ?? existing.latestScore ?? null,
      status,
      signals,
      feedbackCount: (existing.feedbackCount ?? 0) + 1,
      lastFeedbackAt: receivedAt,
      lastIntents: candidateIntents,
    };
  }

  nextState.stats.feedbackEvents = (nextState.stats.feedbackEvents ?? 0) + 1;
  nextState.stats.lastFeedbackAt = receivedAt;

  return { state: nextState, event };
}

function nextShoppingStatus(currentStatus, intents) {
  if (
    intents.includes("negative") ||
    intents.includes("brand_negative") ||
    intents.includes("already_owned") ||
    intents.includes("listing_seen_before")
  ) {
    return "rejected";
  }
  if (
    intents.includes("price_too_high") &&
    (intents.includes("positive") || intents.includes("style_more_like_this") || intents.includes("watch"))
  ) {
    return "watching";
  }
  if (intents.includes("positive")) {
    return "liked";
  }
  if (intents.includes("watch")) {
    return "watching";
  }
  if (intents.some((intent) => intent.startsWith("fit_") || intent.startsWith("price_"))) {
    return "reviewed_with_constraints";
  }

  return currentStatus ?? "reviewed";
}

function mergeSignals(existingSignals = [], intents) {
  return [...new Set([...existingSignals, ...intents])];
}

function manifestCandidatesById(manifest) {
  return new Map((manifest.candidates ?? []).map((candidate) => [candidate.id, candidate]));
}

function cloneState(state) {
  return JSON.parse(JSON.stringify(state));
}
