> Note: Sharkey UI strings formerly lived in `packages/frontend/src/utility/sk-strings.ts` (deleted after the migration). All ported strings now live in `locales/en-US.yml` / `locales/ja-JP.yml` and are read via `i18n.ts` / `i18n.tsx` (see `MISSING-STRINGS.md`). `skStrings` tables below describe the pre-migration wording.

# SkNoteTranslation.vue

- Donor: `/Users/terezi/Local Documents/fedifedifedi/Sharkey/packages/frontend/src/components/SkNoteTranslation.vue`
- Target: `/Users/terezi/Local Documents/misskey/packages/frontend/src/components/SkNoteTranslation.vue`

## Ported as-is
- Template, styles, props (`note`, `translating`, `translation`), and the dev-only debug watch.
- Display only. The parent calls the shared `translateNote` helper (`utility/translate-note.ts`).
- SPDX header kept.

## Deviations
- `i18n.ts.translationFailed` (trailing Sharkey section in both locale files; donor wording; `sk-strings.ts` deleted).

## i18n keys added (trailing Sharkey locale section)
- `translationFailed` -> `i18n.ts.translationFailed`

## i18n keys used as-is
- `i18n.tsx.translatedFrom` (exists in en-US.yml as "Translated from {x}").

## Prefs
- None.

## Endpoints
- None (display only).

## Not ported
- Nothing.
