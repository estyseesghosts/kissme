# Phase 9.4 utilities

All under `packages/frontend/src/utility/`. Upstream wins on collision.

| Donor util | Disposition | Notes |
|---|---|---|
| `contains.ts` | Already present | Upstream `element-contains.ts` (`elementContains`, null-safe) is equivalent. Not ported. |
| `collect-page-vars.ts` | Ported | Typed (`PageVarSource`), no `any`. Tested. No consumer yet (Pages feature). |
| `extract-preview-urls.ts` | Already present | Identical to donor. |
| `favicon-dot.ts` | Ported | Fixed null blob / string rejections. Consumer (boot favicon dot) is slice 10.4. Not unit-tested (canvas/DOM). |
| `getNoteUrls.ts` | Already present | Identical to donor. |
| `key-event.ts` | Ported | Verbatim. Tested. |
| `parse-mutes.ts` | Ported | Dialog-using `parseMutes`; delegates to phase 8 `sk-parse-mutes.ts` `parseMuteText`, alerts on first invalid regex and throws. Existing `i18n.ts.regexpError*` strings. Tested. |
| `player-url-transform.ts` | Ported | Verbatim. Tested. |
| `reload-ask.ts` | Ported | Added return type. Uses existing `reloadConfirm`/`yes`/`no`. Upstream `reload-suggest.ts` is unrelated and untouched. Not tested (dialog). |
| `sanitize-html.ts` | Ported | Verbatim (`sanitize-html` already a dependency; `MkAutocomplete` keeps its direct import). Tested. |
| `search-engine-map.ts` | Ported | Verbatim. No pref added; consumer is a settings UI (slice 10.1). |
| `settings-search-index.ts` | Ported | Dropped the unused (and undeclared) `GeneratedSearchIndexItem` import. Uses upstream virtual module `search-index:settings`; upstream `inapp-search.ts` is untouched. No consumer yet. Not tested (virtual module). |
| `show-note-on-original-instance.ts` | Already present | Upstream copy differs only by a router type cast. |
| `show-system-account-dialog.ts` | Ported | Strings absent from the donor locale too; new `skStrings.systemAccountTitle/Description` (MISSING-STRINGS.md). |
| `stream-mock.ts` | Skipped | Upstream `stream.ts` has no websocket-disable path, so nothing would use it. Revisit if streaming can be disabled globally. |
| `warning-external-website.ts` | Already present | Upstream copy already adapted (optional `trustedLinkUrlPatterns`). |

Tests: `test/unit/sk-utilities-94.test.ts`, `player-url-transform.test.ts`, `parse-mutes.test.ts`.
No prefs added.
