export function browserRow(row) {
  const { reviewKey, ...out } = row;
  const c = row.candidate, p = c.provenance ?? {}, evidence = p.evidence ?? {};
  return { ...out, candidate: { ...c, provenance: {
    extraction: p.extraction,
    indexedUnavailable: p.indexedUnavailable,
    stretchBudgetCandidate: p.stretchBudgetCandidate,
    currency: p.currency, nativeCurrency: p.nativeCurrency, priceCurrency: p.priceCurrency,
    evidence: { currency: evidence.currency, nativeCurrency: evidence.nativeCurrency, priceCurrency: evidence.priceCurrency, price: evidence.price },
  } } };
}
