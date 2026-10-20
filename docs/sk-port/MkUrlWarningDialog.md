# External-link warning dialog port

- Donor: `/Users/terezi/Local Documents/fedifedifedi/Sharkey/packages/frontend/src/components/MkUrlWarningDialog.vue`
- Target: `packages/frontend/src/components/MkUrlWarningDialog.vue` (+ `utility/warning-external-website.ts`)
- SPDX header kept.

## What it is

"External website" confirm dialog shown before opening an untrusted link
(gated by pref `warnExternalUrl`, default behavior follows the donor).
"Trust this domain" persists the host into pref `trustedDomains`.

## Adapted

- Aligned to the donor structure: the port's flat `externalWarning*`
  `skStrings` keys were replaced by the donor's nested
  `_externalNavigationWarning.{title,description,trustThisDomain}` locale keys
  with donor wording, and the `.replace('{host}')` hack by
  `i18n.tsx...description({ host })` — the component now matches the donor.
- Icons: `ti ti-alert-triangle`, `ti ti-external-link` (Tabler; donor uses
  Phosphor elsewhere but this dialog's icons map 1:1).
- No endpoint casts. `trustedDomains` / `trustedLinkUrlPatterns` instance
  field is read through a cast and treated as always-empty when missing, so
  all external links warn.

## Known gaps

- Without the backend `trustedLinkUrlPatterns` field every external link
  warns; per-domain server allowlists have no effect.
- No browser verification; covered only by typecheck.
