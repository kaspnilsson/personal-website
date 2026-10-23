# Private Fieldnotes

`/fieldnotes` serves the clothing archive using the existing site's Vercel deployment. It accepts the owner's configured shared password and issues an HttpOnly session cookie. There is no first-time password setup. Its catalog and save APIs validate that session server-side.

The configured password is represented by a salted scrypt verifier encrypted in `password.encrypted.json` with the server-held master key. Only ciphertext is committed. The server decrypts it and derives session signing from its credential epoch; old access-code and setup sessions are invalid. Redis stores saved decisions and expiring per-client login limits, not the configured password. The account page offers logout. Changing the configured password requires replacing its encrypted verifier and deploying; use a new epoch to invalidate prior sessions. Do not change or re-export the catalog for a password-only change.

The repository is public. The catalog and password verifier are committed only as AES-256-GCM ciphertext. `FIELDNOTES_SECRET` is a 32-byte base64url master key held in the hosting environment, never a `NEXT_PUBLIC_` setting. Changing it requires re-encrypting both artifacts. Session cookies expire after 90 days. Legacy access links do not log in.

Saves, watch/pass decisions and notes use a private Redis database connected through `KV_REST_API_URL` and `KV_REST_API_TOKEN` (Upstash's equivalent variable names also work). Each exact inventory identity has one record containing its current decision and feedback events. Conditional writes keep concurrent updates from losing notes or history. Catalog redeployment does not overwrite these records. Production fails closed when storage or private access is not configured.

For local development, `.env.local` may set `FIELDNOTES_LOCAL_STORE=.fieldnotes-dev`; that ignored directory is never used in production.

Refresh the encrypted catalog from the clothing-crawl repository using `node scripts/export-kasptrax-fieldnotes.mjs`. The exporter reads the master key from this checkout's ignored local environment file and writes only ciphertext into this repository. It preserves captured dates, native prices, stock uncertainty and exact inventory identities. API responses omit internal collector metadata. Stock checks expire rather than remaining verified indefinitely.

The existing public website, newsletter and Casa routes are independent of Fieldnotes. Fieldnotes uses its own cookie and private API paths. It has no public navigation or search-index entry.
