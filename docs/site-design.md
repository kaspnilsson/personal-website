# kasptrax.com design system

kasptrax.com uses the renders.nyc chassis directly: the same fonts, tokens, components and measurements, with release artwork as the only colour. The site carries no press or promo photographs.

## Sources

| Layer | Source |
| --- | --- |
| Editorial components and measurements | renders.nyc `apps/web/src/app/editorial.css`, `site-header.tsx`, `site-footer.tsx`, `sms-signup.tsx`, `event-information.tsx` (kaspnilsson/renders, live website branch) |
| Tokens | `@kaspnilsson/renders-ui` 0.4.0, vendored unchanged in `src/styles/renders-tokens` |
| App token overrides | renders.nyc `apps/web/src/app/globals.css` (`--muted-foreground: #858585`, focus, selection, reduced motion) |

Component mapping: `SiteHeader`, `SiteFooter` and `SkipLink` are ports of the Renders components. `ReleaseIndex` is the archive grid and upcoming record and leads the homepage, the About page the event detail grid (name left, facts right), and the 404 page the empty-event state. Casa and Fieldnotes are purpose-built shells on the same chassis, like the Renders SMS and legal routes.

## Fonts

`public/fonts` holds the only copies. React pages load them through `next/font/local`; the standalone Fieldnotes pages use `@font-face` with the same files.

| File | Source | SHA-256 |
| --- | --- | --- |
| `Gibson-Regular.otf` | renders.nyc website fonts | `1f5b96a0c78d058ba1e2858f824cdca69e2094914ce581995f16eace7332c709` |
| `Gibson-Bold.otf` | renders.nyc website fonts | `ccf0a52c499f4a82012e57b68d6a6357d524b3c1c653f47c435c409a076a73bf` |
| `JetBrainsMono-Regular.woff2` | Lossless WOFF2 of JetBrains Mono 2.305 Regular from the Renders visual toolkit (TTF `e6fd0d7e91550b3ed2b735d4312474362c4716edc4fc0577a0f61ed782d5aed1`) | `f1a7a03672cdd494ce0d5543fac6e4360fe22403c6de297fdc2e55a815f7baff` |

Gibson (Canada Type) is the heading face Kasper chose for Kasp and Renders. The files are unchanged and keep their original metadata; this note grants no additional font rights. The Kasp logo is separate artwork drawn from Gibson Bold Italic. Use the logo image; never re-typeset it with the upright faces. JetBrains Mono is under the SIL Open Font License 1.1 (`public/fonts/JetBrainsMono-OFL.txt`).

## Images

| File | Source and treatment |
| --- | --- |
| `assets/kasp/logo/kasp-logo-ink.png` | `kasp logo sq 1500x1500.png`, trimmed and recoloured to the ink `#e5e5e5` with alpha. The letterforms are the supplied artwork. |
| `assets/kasp/releases/*-cover.jpg` | Approved Desire and Wait covers from the Renders release folders, 3000 to 1600 px. |
| `assets/kasp/og/kasp-1200x630.jpg` | `kasp-logo-ink.png` at 460 px wide, centred on the ground `#0a0a0a`. |
| `key_location_*.jpg` | Casa photographs, oriented and resized, location metadata removed. |

Promo photographs were removed from the site in November 2026; they remain in git history.

## The sheet

The public pages (home, about, 404, error) sit on a paper sheet defined in `src/app/sheet.css`, applied by a `.sheet` wrapper. It carries over what the Renders poster hill climb learned (renders `drafts/design/hillclimb-2026-11-03`: `brand-direction.md`, `rubric-v4.txt`, `shared/master.py`), adjusted for a page people have to use:

- Paper `#e4e0d6` and ink `#121110`: black, paper and earth only, never pure digital values.
- One piece, not zones. The latest cover is the one dominant mass in open ground, printed into the paper with `mix-blend-mode: multiply`, and its facts hang off its top and bottom axes. The picture gets the first read.
- Type at the extremes: the cropped, worn UPDATES word, or 11 to 13 px mono. Nothing in between.
- One surface over everything: `scripts/make-surface.py` bakes the master bus's grain, specks and room into `public/assets/kasp/surface`. They scroll with the paper.
- Usability wins over the flyer: information is never worn or reduced below 12 px, links are underlined, and each release has one obvious Listen action.

Casa and Fieldnotes keep the dark Renders chassis.

## Rules

- Dark chassis (Casa, Fieldnotes): ground `#0a0a0a`, ink `#e5e5e5`, rules `#262626` and `#3a3a3a`. Pure white only on hover. No accent colours, gradients, radius or drop shadows in the interface.
- Gibson Bold, uppercase, for headings and titles. JetBrains Mono for facts, labels, body and actions.
- Motion is functional: transforms and opacity only, power-curve easing, reduced motion respected.
- Show facts at rest. No placeholder releases, events or sets.

## Adding a release

Add an entry to `src/data/releases.ts` with its public links and cover, and add the cover to `public/assets/kasp/releases`. The homepage lists releases newest first. Keep unreleased plans out of the file until they have public links.

## Private routes

`/casa` and `/fieldnotes` never appear in public navigation, the sitemap or robots rules. Casa sets `noindex` metadata; Fieldnotes sends `X-Robots-Tag` and private cache headers. Fieldnotes' UI files live in `src/lib/fieldnotes/assets.json`.
