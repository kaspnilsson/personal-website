import encrypted from './password.encrypted.json' with { type: 'json' };
import { decryptCatalog, masterSecret } from './auth.mjs';
import { parsePasswordRecord, passwordSessionKey } from './password.mjs';
import { configuredStore } from './storage.mjs';

// Server-side configuration: the public repository contains ciphertext only.
// A fixed owner-selected password needs no setup or Redis credential migration.
export function sharedAuthentication(store = configuredStore(), master = masterSecret(), envelope = encrypted) {
  const record = parsePasswordRecord(JSON.stringify(decryptCatalog(envelope, master)));
  if (!record) throw new Error('Fieldnotes password is not configured.');
  return { store, master, record, key: passwordSessionKey(master, record) };
}
