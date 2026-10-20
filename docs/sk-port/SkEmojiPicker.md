# SkEmojiPicker

Donor: `packages/frontend/src/components/MkEmojiPicker.vue` (Sharkey develop @ 752a392d3b)
Target: `packages/frontend/src/components/SkEmojiPicker.vue`, `packages/frontend/src/utility/sk-emoji-search.ts`, `packages/frontend/test/unit/sk-emoji-search.test.ts`

## Decision: option (A), coexisting file
`SkEmojiPicker.vue` is a copy of upstream `MkEmojiPicker.vue` (props, emits `chosen`/`esc`, template, styles, settings gear to `/settings/emoji-palette`, `haptic()`, `targetNote` + `checkReactionPermissions` all kept) with Sharkey's search improvements routed through the pure util. Upstream `MkEmojiPicker.vue`, `MkEmojiPicker.section.vue` and `MkEmojiPickerDialog.vue` are untouched. It reuses upstream `MkEmojiPicker.section.vue` (which already filters on the full category path). No exposed API difference, so `MkEmojiPickerDialog` swaps to it when pref `useSharkeyEmojiPicker` (default `false`) is on: `MkEmojiPickerDialog.vue` was edited additively (a `<component :is>` choosing `SkEmojiPicker` or `MkEmojiPicker`; default markup behavior unchanged). Option B was not chosen because the changes touch the watch, tree builder and computeds (not tiny).

## Ported (via utility/sk-emoji-search.ts)
- `normalizeEmojiQuery`: trim, strip `:`, NFC, lowercase.
- `searchCustomEmojis` / `searchUnicodeEmojis`: ranked exact name, exact alias, name prefix, alias prefix, name substring, alias substring; AND search for space-separated queries; stored names/aliases lowercased at compare time; unicode index lookups null-safe; max 100.
- `compactDefs`: null-filter for recent/pinned definitions.
- `buildEmojiFolderTree`: category nodes carry the full path ("a/b"), built in a `computed` so category changes are picked up (upstream builds once at setup and stores the whole input string as `category` for every level).
- `done()` trims the query (donor behavior); the input handler no longer trims, so typing a trailing space for AND search works.

## Changed vs donor
Donor's picker lacks Misskey's settings gear, haptic and s4/s5 sizes; SkEmojiPicker keeps upstream's. Upstream types (`PointerEvent`, `targetNote | null`) kept. Donor's `withDefaults` explicit undefineds dropped (unneeded).

## checkReactionPermissions
Used (in `canReact`), imported from `@/utility/check-reaction-permissions.js` (upstream's version, unchanged).

## Prefs read
`emojiPickerScale`, `emojiPickerWidth`, `emojiPickerHeight` (existing upstream). New pref `useSharkeyEmojiPicker` (default `false`, no settings UI yet).

## Known gaps
Not browser-tested. The dialog swap is pref-gated and unexercised.
