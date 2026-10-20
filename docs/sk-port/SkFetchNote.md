> Note: Sharkey UI strings are now centralized in `packages/frontend/src/utility/sk-strings.ts` (see README.md and MISSING-STRINGS.md). Any `skStrings` table mentioned below refers to that module.

# SkFetchNote.vue

- Donor: `/Users/terezi/Local Documents/fedifedifedi/Sharkey/packages/frontend/src/components/SkFetchNote.vue`
- Target: `/Users/terezi/Local Documents/misskey/packages/frontend/src/components/SkFetchNote.vue`

## Ported as-is
- Props (`noteId`, `lazy` default true), loading/error/done states, the race-condition check on `noteId`, and the `notes/show` fetch with `.catch(() => null)`.
- Wraps the target's `DynamicNote.vue`.
- SPDX header kept.

## Deviations
- Lazy loading: target `components/global/MkLazy.vue` does not emit `show`, so the donor's `@show="showing = true"` cannot work. The content now sits in an inner `<div :ref="markShown">`; the first element to mount (which only happens once MkLazy shows its slot) sets `showing = true`.
- `lazy: false` previously rendered immediately. It now swaps the `MkLazy` wrapper for a plain `div` (`<component :is="lazy ? MkLazy : 'div'">`), so no placeholder appears.
- `MkLazy` is imported explicitly from `@/components/global/MkLazy.vue` to allow the dynamic `:is`.

## i18n keys replaced with local strings
- `i18n.ts.cannotLoadNote` (not in en-US.yml) -> `skStrings.cannotLoadNote` ("Cannot load note").

## Prefs
- None.

## Endpoints
- `notes/show` (`{ noteId }`). Present in misskey-js.

## Not ported
- Nothing.
