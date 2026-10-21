# Search file-type filter (Gap 3)

- Donor: `/Users/terezi/Local Documents/fedifedifedi/Sharkey/packages/frontend/src/pages/search.note.vue`
  (lines 42-50, 166, 318-326) and `sharkey-locales/en-US.yml` (lines 558-567)
- Target: `packages/frontend/src/pages/search.note.vue`

## Restored (additive)

- `MkSelect` file-type dropdown in the options section, with the donor's six
  options and donor param name (lowercase `filetype`):
  none (`null`) / `image` / `video` / `audio` / `module` / `flash`.
- `SearchParams` gains `filetype`; every scope branch carries the selection, so
  the computed params stay the single source of truth.
- Both `notes/search` paginator constructions (`search()` and `openInWindow()`)
  merge the selection via `utility/sk-note-search-params.ts`
  (`buildFiletypeParams` + `NOTE_SEARCH_FILE_TYPES`), unit-tested.
  `null` (no filter) omits the key entirely.
- The current `MkSelect` takes `:items`, not the donor's `<option>` children,
  so the dropdown is expressed as a computed `MkSelectItem[]` with
  `i18n.ts._noteSearch._fileType.*` labels. No new deps; stock wins.

## Deviations

- The donor also sends `order` (`MkSwitch` newest-to-oldest); only `filetype`
  is restored here. Stock search order is unchanged.
- `filetype` is not in `misskey-js` `notes/search` types, so the params object
  goes through an `as Misskey.Endpoints['notes/search']['req']` cast with an
  explanatory comment (same pattern as the `notes/following` Paginator cast).
- Honest degradation: the stock backend rejects the unknown `filetype` field,
  and the paginator then shows its list error state. Results are never
  filtered client-side to fake the filter.

## i18n

- `_noteSearch.fileType` + `_noteSearch._fileType.{none,image,video,audio,module,flash}`
  added to both `locales/en-US.yml` (donor wording) and `locales/ja-JP.yml`
  (Misskey-tone Japanese: "ファイルの種類" / なし・画像・動画・音声・
  モジュール・Flash). Regenerated via `pnpm --filter i18n generate`
  (`packages/i18n/src/autogen/locale.ts`).
- Note: hand-editing `en-US.yml` trips the Crowdin-policy locale check
  (only `ja-JP.yml` is normally hand-edited); that FAIL is expected and
  intentional here, matching this repo's existing Sharkey-sections practice.

## Not ported / notes

- `widgets/WidgetSearch.vue` still sends query-only params (its comment notes
  the backend rejects `order`/`filetype`); unchanged.
- Backend `notes/search` has no `filetype` support; the filter only takes
  effect against a backend that accepts the field.
- No browser verification; covered by typecheck and unit tests only.
