> Note: Sharkey UI strings are now centralized in `packages/frontend/src/utility/sk-strings.ts` (see README.md and MISSING-STRINGS.md). Any `skStrings` table mentioned below refers to that module.

# SkNoteTranslation.vue

- Donor: `/Users/terezi/Local Documents/fedifedifedi/Sharkey/packages/frontend/src/components/SkNoteTranslation.vue`
- Target: `/Users/terezi/Local Documents/misskey/packages/frontend/src/components/SkNoteTranslation.vue`

## Ported as-is
- Template, styles, props (`note`, `translating`, `translation`), and the dev-only debug watch.
- Display only. The parent calls the shared `translateNote` helper (`utility/translate-note.ts`).
- SPDX header kept.

## Deviations
- `i18n.ts.translationFailed` is not in en-US.yml. Replaced with `skStrings.translationFailed` ("Translation failed"), a local const with a pending-locales comment.

## i18n keys replaced with local strings
- `translationFailed` -> `skStrings.translationFailed`

## i18n keys used as-is
- `i18n.tsx.translatedFrom` (exists in en-US.yml as "Translated from {x}").

## Prefs
- None.

## Endpoints
- None (display only).

## Not ported
- Nothing.
