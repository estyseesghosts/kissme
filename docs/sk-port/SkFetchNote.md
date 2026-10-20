> Note: Sharkey UI strings formerly lived in `packages/frontend/src/utility/sk-strings.ts` (deleted after the migration). All ported strings now live in `locales/en-US.yml` / `locales/ja-JP.yml` and are read via `i18n.ts` / `i18n.tsx` (see `MISSING-STRINGS.md`). `skStrings` tables below describe the pre-migration wording.

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

## i18n keys added (trailing Sharkey locale section)
- `i18n.ts.cannotLoadNote` (donor wording "Failed to load note"; `sk-strings.ts` deleted).

## Prefs
- None.

## Endpoints
- `notes/show` (`{ noteId }`). Present in misskey-js.

## Not ported
- Nothing.
