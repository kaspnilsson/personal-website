# kasptrax.com

Kasp's website: the current release, music, photographs and email updates, built on the renders.nyc design system. Next.js 15 (App Router), React 19 and Tailwind CSS 4.

| Route | Purpose |
| --- | --- |
| `/` | Latest release, music, images and email signup |
| `/about` | Bio, bookings contact, profiles and press photos |
| `/casa` | Private guest guide (not linked or indexed) |
| `/fieldnotes` | Private clothing archive (see `docs/fieldnotes.md`) |

```bash
npm install
npm run dev      # http://localhost:3001
npm run lint
npm run build
node --test test/*.test.mjs
```

Design sources, font and image provenance, and how to add a release: `docs/site-design.md`. Email signup variables: `.env.example`.
