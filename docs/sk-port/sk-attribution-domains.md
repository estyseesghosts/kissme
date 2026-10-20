# Attribution domains port

- Donor: `/Users/terezi/Local Documents/fedifedifedi/Sharkey/packages/frontend/src/pages/settings/profile.attribution-domains-setting.vue`
- Target: `packages/frontend/src/pages/settings/profile.attribution-domains-setting.vue`, `utility/sk-attribution-domains.ts`
- SPDX header kept.

## What it is

Profile settings section (behind pref `showAttributionDomains`, default off):
one domain per line; listed sites may credit the user as author via the
`<meta name="fediverse:creator">` tag shown in the tutorial line. Parsing and
validation live in `sk-attribution-domains.ts` (tested).

## Adapted

- Strings: `attributionDomains`, `attributionDomainsDescription` follow the
  donor wording; `attributionDomainsTutorial` and
  `attributionDomainsUnsupported` keep the port wording (donor has none). All
  four live in the trailing Sharkey locale section (`i18n.ts`).
- Endpoint casts: `attributionDomains` exists only on Sharkey's `i/update` and
  `MeDetailed`, absent from misskey-js. The user object is read through a cast
  and the save goes through an untyped `misskeyApi` alias, each with a comment.
- `attributionDomainsUnsupported` is currently unused (kept for the future
  backend-gap UI); the setting saves even where the backend ignores the field.

## Known gaps

- Stock Misskey and Pinetree `i/update` ignore the field, so the setting is
  write-only there (honest: no error is faked, the value just has no effect).
- No browser verification; covered by typecheck and unit tests.
