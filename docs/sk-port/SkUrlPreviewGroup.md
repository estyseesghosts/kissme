> Note: Sharkey UI strings are now centralized in `packages/frontend/src/utility/sk-strings.ts` (see README.md and MISSING-STRINGS.md). Any `skStrings` table mentioned below refers to that module.

# SkUrlPreviewGroup

- Donor: `/Users/terezi/Local Documents/fedifedifedi/Sharkey/packages/frontend/src/components/SkUrlPreviewGroup.vue`
- Target: `/Users/terezi/Local Documents/misskey/packages/frontend/src/components/SkUrlPreviewGroup.vue`

## Ported as-is
- Template, props, emits, URL extraction (sourceUrls > sourceNodes > sourceText > sourceNote), refresh/dedupe logic, fetch/cache logic, scoped styles, SPDX header.

## Changed (deviations)
- Imports: `@/components/MkUrlPreview.vue` `SummalyResult` type replaced by `@misskey-dev/summaly` (the target's MkUrlPreview does not export it).
- `useMuteOverrides` imported from `@/utility/sk-check-mute` (the target's `check-word-mute.ts` does not export it).
- `versatileLang` imported from `@@/js/intl-const.js` (target style).
- `promise-limit` replaced by an inline `createLimiter` (same contract). Misskey's frontend has no `promise-limit` dependency and adding one needs a package.json change.
- `SummalyResult` from `@misskey-dev/summaly` 5.5.1 lacks Sharkey's `haveNoteLocally` and `linkAttribution`; these are declared locally in `SkSummalyFields`.
- `@expandMute` handler parameter given an explicit type (target MkUrlPreview declares no emits).

## i18n
- None used by the donor template or script. No `skStrings` needed.

## Prefs
- None.

## Endpoints
- `ap/show` via `misskeyApi`: present in misskey-js.
- `users/show` via `misskeyApi`: present in misskey-js.
- `GET /url?url=...&lang=...` via `window.fetch`: a raw HTTP route, not in misskey-js. Backend not tested.

## Not ported / dependencies
- The target's `components/MkUrlPreview.vue` lacks the props this component passes: `showAsQuote`, `skipNoteIds`, `previewHint`, `noteHint`, `attributionHint`, and the `expandMute` emit. The donor's MkUrlPreview must be ported to the target first; until then, previews render without the cached summary, quote note, or attribution user, and mute expansion does nothing.
- Requires a shared `promise-limit` dependency only if the inline limiter is later judged unacceptable.

## Typecheck
- `SkUrlPreviewGroup.vue`: no errors. Remaining repo error at the time of run is in `src/utility/get-note-versions-menu.ts` (missing `SkOldNoteWindow.vue`), not owned here.
