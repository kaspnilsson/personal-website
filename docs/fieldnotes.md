# Private Fieldnotes

`/fieldnotes` serves the clothing archive using the existing site's Vercel deployment. The owner chooses a password at `/fieldnotes/password`, reached through the existing private session or the initial setup link. After setup, the ordinary route accepts that password and issues an HttpOnly session cookie. Its catalog and save APIs validate that session server-side.

The password is stored only as a salted scrypt verifier in private Redis. Initial setup uses an atomic create-if-absent operation, requires the authenticated owner session plus same-origin CSRF protection, and cannot overwrite an existing password. The credential epoch changes session signing without changing catalog encryption: completing setup revokes old access-code sessions and disables the old access link. Login attempts have durable per-client limits. The owner enters their own password directly on the website; it is never committed or placed in hosting environment variables. The password page also offers logout.

The repository is public. The catalog is committed only as AES-256-GCM ciphertext. `FIELDNOTES_SECRET` is a 32-byte base64url master key held in the hosting environment, never a `NEXT_PUBLIC_` setting. Changing it requires re-exporting the encrypted catalog. Session cookies expire after 90 days. An initial access link works only until the password is set.

Saves, watch/pass decisions and notes use a private Redis database connected through `KV_REST_API_URL` and `KV_REST_API_TOKEN` (Upstash's equivalent variable names also work). Each exact inventory identity has one record containing its current decision and feedback events. Conditional writes keep concurrent updates from losing notes or history. Catalog redeployment does not overwrite these records. Production fails closed when storage or private access is not configured.

For local development, `.env.local` may set `FIELDNOTES_LOCAL_STORE=.fieldnotes-dev`; that ignored directory is never used in production.

Refresh the encrypted catalog from the clothing-crawl repository using `node scripts/export-kasptrax-fieldnotes.mjs`. The exporter reads the master key from this checkout's ignored local environment file and writes only ciphertext into this repository. It preserves captured dates, native prices, stock uncertainty and exact inventory identities. API responses omit internal collector metadata. Stock checks expire rather than remaining verified indefinitely.

The existing public website, newsletter and Casa routes are independent of Fieldnotes. Fieldnotes uses its own cookie and private API paths. It has no public navigation or search-index entry.
