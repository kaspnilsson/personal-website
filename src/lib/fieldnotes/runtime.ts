import encrypted from './catalog.encrypted.json';
import { decryptCatalog, masterSecret } from './auth.mjs';
import { configuredStore, reviewStorageKey } from './storage.mjs';
import { browserRow } from './browser-catalog.mjs';
import { expireStock } from './freshness.mjs';

type CatalogRow = {
  reviewKey: string;
  status: string;
  reviewNote: string;
  candidate: { id: string; [key: string]: unknown };
  [key: string]: unknown;
};
type CatalogSnapshot = {
  catalog: { items: CatalogRow[]; [key: string]: unknown };
  manifest: Record<string, unknown>;
};
let cached: CatalogSnapshot | null = null;
export function snapshot() {
  cached ??= decryptCatalog(encrypted, masterSecret());
  return cached!;
}
export async function browserCatalog() {
  const source = snapshot(), store = configuredStore();
  const records = await store.getMany(source.catalog.items.map(row => reviewStorageKey(row.reviewKey)));
  const items = source.catalog.items.map((row, index) => {
    const state = records[index] ? JSON.parse(records[index]).state : null;
    return browserRow(expireStock(state ? { ...row, status: state.status, reviewNote: state.reviewNote ?? '' } : row));
  });
  return { ...source.catalog, items };
}
