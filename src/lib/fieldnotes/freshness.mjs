export function expireStock(row, now = Date.now()) {
  if (!row.stockVerified && !row.qualified) return row;
  const c = row.candidate, check = c.provenance?.stockVerification;
  const checkedAt = Date.parse(check?.observedAt), availabilityAt = Date.parse(c.availabilityCheckedAt);
  const freshness = (c.collection?.freshnessHours ?? 24) * 3600000;
  const age = now - checkedAt, availabilityAge = now - availabilityAt;
  if (!Number.isFinite(age) || age < 0 || age > 24 * 3600000 || !Number.isFinite(availabilityAge) || availabilityAge < 0 || availabilityAge > freshness) {
    return { ...row, stockVerified: false, qualified: false, filterReason: 'Stock verification is missing or stale' };
  }
  return row;
}
