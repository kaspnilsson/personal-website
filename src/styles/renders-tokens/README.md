Vendored unchanged CSS from `@kaspnilsson/renders-ui` 0.4.0: `packages/ui/src/tokens` and `packages/ui/src/themes` in kaspnilsson/renders (token commit aac43fd, identical at main 121edfb). Keeping these files local avoids the private package-registry credential that previously broke builds.

The site imports colors, animations and shells. Typography, spacing, effects, moiré and the warm-charcoal theme are kept for parity with the package; effects are capabilities rather than defaults and are not loaded. Site-level overrides live in `src/app/globals.css`, matching renders.nyc's app tokens.
