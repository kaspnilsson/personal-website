# kasptrax.com design system

kasptrax.com uses the renders.nyc chassis directly: the same fonts, tokens, components and measurements, with Kasp's photographs and release artwork as the only colour.

## Sources

| Layer | Source |
| --- | --- |
| Editorial components and measurements | renders.nyc `apps/web/src/app/editorial.css`, `site-header.tsx`, `site-footer.tsx`, `sms-signup.tsx`, `photo-lookbook.tsx`, `event-information.tsx` (kaspnilsson/renders, live website branch) |
| Tokens | `@kaspnilsson/renders-ui` 0.4.0, vendored unchanged in `src/styles/renders-tokens` |
| App token overrides | renders.nyc `apps/web/src/app/globals.css` (`--muted-foreground: #858585`, focus, selection, reduced motion) |

Component mapping: `SiteHeader`, `SiteFooter`, `SkipLink` and `PhotoLookbook` are ports of the Renders components. `ReleaseHero` is the Renders event hero, `ReleaseIndex` the archive grid and upcoming record, the About page the event detail grid, and the 404 page the empty-event state. Casa and Fieldnotes are purpose-built shells on the same chassis, like the Renders SMS and legal routes.

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
| `assets/kasp/promo-shots/selected/kasp-wall-portrait.jpg` | Kasp's approved default photograph (IMG_0396), oriented, 2400 px tall, camera metadata removed. |
| `assets/kasp/og/kasp-1200x630.jpg` | Sharing crop of `kasp-environmental-graffiti-wide.jpg`. |
| `key_location_*.jpg` | Casa photographs, oriented and resized, location metadata removed. |

Other promo shots are unchanged. The headphones portrait is no longer the sharing image; Renders' identity registry marks it superseded for avatars.

## Rules

- Ground `#0a0a0a`, ink `#e5e5e5`, rules `#262626` and `#3a3a3a`. Pure white only on hover. No accent colours, gradients, radius or drop shadows in the interface.
- Gibson Bold, uppercase, for headings and titles. JetBrains Mono for facts, labels, body and actions.
- Motion is functional: transforms and opacity only, power-curve easing, reduced motion respected.
- Show facts at rest. No placeholder releases, events or sets.

## Adding a release

Add an entry to `src/data/releases.ts` with its public links and cover, and add the cover to `public/assets/kasp/releases`. The homepage hero shows the most recent date automatically. Keep unreleased plans out of the file until they have public links.

## Private routes

`/casa` and `/fieldnotes` never appear in public navigation, the sitemap or robots rules. Casa sets `noindex` metadata; Fieldnotes sends `X-Robots-Tag` and private cache headers. Fieldnotes' UI files live in `src/lib/fieldnotes/assets.json`.
