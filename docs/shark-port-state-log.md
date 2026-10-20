# Sharkey frontend port — state log

## Pins

- Base: misskey `split-project` @ `b8f3eb20d8` (working directly on this branch; no worktrees or port branch)
- Donor: Sharkey `develop` @ `752a392d3b` (read-only; no changes made to Sharkey)
- Tooling: pnpm 11.25.0 (via `npx -y pnpm@11.25.0`; not on PATH), node v26.8.1

## Phase 0

### 0.1 Pin and index — DONE
- Index: `docs/shark-port-diff-index.md` (Sharkey-only 95, Misskey-only 93, Differ 606 in `packages/frontend/src`).
- Dependency deltas (`packages/frontend/package.json`) are recorded in the index. Sharkey-only deps: @discordapp/twemoji, @github/webauthn-json, @phosphor-icons/web, @ruffle-rs/ruffle, chromatic, katex, locales (workspace), photoswipe, promise-limit, strict-event-emitter-types, uuid, vuedraggable. Misskey-only deps: @analytics/google-analytics, @mcaptcha/core-glue, @misskey-dev/emoji-data, @misskey-dev/tagcanvas-es, @simplewebauthn/browser, @syuilo/aiscript-0-19-0, analytics, ios-haptics, i18n, icons-subsetter, mediabunny, qr-code-styling, qr-scanner, seedrandom. Version-only differences also exist (e.g. vue 3.5.42 vs 3.5.21, mfm-js vs @transfem-org/sfm-js).

### 0.2 Baseline — GREEN after test-only fix (see is-birthday below)
| Check | Result | Log |
|---|---|---|
| `pnpm --filter frontend typecheck` | PASS (exit 0) | `baseline-typecheck.log` |
| `pnpm --filter frontend test` | Before fix: FAIL 4/152. After fix (commit bc7f09efa8): 152/152 pass (`TZ=UTC` run also 152/152) | `baseline-test.log`, `baseline-test-utc.log` |
| `pnpm --filter frontend build` | PASS (exit 0), postbuild ok | `baseline-build.log` |
| `node scripts/check-spdx.mjs` | SPDX: OK | — |

Failing before fix: `test/unit/is-birthday.test.ts` (4 of 5 tests), timezone-dependent and pre-existing on split-project.

Resolution (option 2, commit bc7f09efa8): the util reads local date getters, which is correct for a birthday. The test fixtures were the bug: `new Date("YYYY-MM-DD")` is UTC midnight, the previous local day in EDT. Fixtures now use `new Date(y, m, d)`. The util is unchanged. Option 1 (`TZ=UTC`) also passed; this fix passes in every TZ tested (EDT, UTC, Asia/Tokyo).

### 0.3 Coexistence decision — recorded
Adopted verbatim from the plan; no code changes:
- Both note designs coexist via `DynamicNote*` + `prefer.s.noteDesign` (default `misskey`). `MkNote.vue` is not replaced.
- Both lightbox systems coexist (Sharkey lightbox alongside `MkImgPreviewDialog`/`MkLightbox*`).
- Both timeline/list models coexist (`MkNotesTimeline/Streaming*` alongside `MkNotes/MkTimeline`).
- Both pagination models coexist; rename on collision (decided in slice 2.4).
- Drafts and schedule coexist; both APIs exposed in UI.

## Phase 1 — IN PROGRESS

### 1.1 Dispatch + header — DONE (commit a9d63cc2a4)
- Landed: \`preferences/def.ts\` noteDesign ('misskey' | 'sk', default 'misskey'), \`components/DynamicNote.vue\` (MkNote-only dispatch for now), \`components/SkNoteHeader.vue\`.
- Deferred: \`DynamicNoteDetailed.vue\`/\`DynamicNoteSimple.vue\` (need SkNoteDetailed/SkNoteSimple, 1.2/1.3); the 'sk' branch of DynamicNote (needs SkNote.vue, 1.2); mute overrides in DynamicNote (need useMuteOverrides/deepAssign, 1.2); instance ticker (9.1); versions menu and Edited marker (1.3).
- Gate: typecheck pass; tests 152/152; SPDX OK. Dev smoke NOT RUN (nothing consumes the new components yet).

### 1.2–1.4 — NOT STARTED

## Exit criteria
- Phase 0: **met** (typecheck, tests 152/152, build, SPDX all green; index, pins, deps, coexistence decision recorded).
- Phase 1: **not met** (1.1 done; 1.2–1.4 not started).

## Checkpoint (after commit d42c9611db)

Landed on split-project:
- 1.1: dispatch + header (a9d63cc2a4). DynamicNote is MkNote-only for now.
- 1.2 (partial): sk-check-mute.ts (Sharkey mute-central), merge.ts deepAssign, SkMutedNote.vue.
- 1.4 (helpers): boost-quote.ts, check-animated-mfm.ts, with unit tests. Prefs for boost, clickToOpen, footer, replies, uncollapseCW.
- Strings: MISSING-STRINGS.md at project root. No locale files touched (per direction: "breaking from upstream").

Gate at this checkpoint: typecheck pass; tests 19/19 files, 160/160; SPDX OK. Dev smoke NOT run.

Not yet done in Phase 1:
- 1.2: SkNoteSimple.vue, SkNoteSub.vue, SkNote.vue. Blocked on: SkUrlPreviewGroup (not ported), extract-preview-urls, get-self-note-ids, translateNote export, plugin setupNoteViewInterruptors, instance policies, and the notes/like endpoint (missing from misskey-js).
- 1.3: SkNoteDetailed.vue, SkNoteTranslation.vue, SkFetchNote.vue; SkOldNoteWindow + get-note-versions-menu are blocked on notes/versions (missing from backend).
- 1.4 wiring: quote, rejectQuotes, likeOnly, footer, inReplyToCollapsed, clickToOpen, hideFiles, numberOfReplies, uncollapseCW into the Sk* components (depends on 1.2/1.3 components).

Phase 1 exit: NOT MET.

## Phase 1 — implementation complete (verification by direction: no backend or browser smoke)

Commits on split-project after the checkpoint:
- 5005aee1ce shared helpers and hooks (translate-note, plugin hook, policies, URL warning, deepAssign users)
- dfa723d9e5 noteDesign dispatch and additive upstream hooks (MkSubNoteContent, MkMfm isAnim, sk-strings)
- 334a3cbf6c Sk* components and docs (SkNote, SkNoteSub, SkNoteSimple, SkNoteDetailed, SkNoteTranslation, SkOldNoteWindow, SkFetchNote, SkUrlPreview, SkUrlPreviewGroup, get-note-versions-menu)
- b87cf4d005 warning dialog strings from sk-strings

Gate: typecheck exit 0; tests 20/20 files, 166/166 (after cb0b1e26b5); eslint --quiet clean on all touched files; SPDX OK.

Phase 1 exit criteria, as stated in the plan:
- "DynamicNote* dispatch works": implemented (noteDesign switch, lazy load). Not exercised live (by direction).
- "all SkNote* render": components implemented and typecheck. Not rendered (by direction).
- "mute central works": sk-check-mute implemented; the pure matching helpers are unit-tested (test/unit/sk-check-mute.test.ts, commit cb0b1e26b5). Live mute behavior not exercised (by direction).
- "no regression to stock MkNote* path": by construction (noteDesign default 'misskey', additive upstream props). Not verified live.

Documentation: docs/sk-port/README.md (index, wiring, upstream touches, known gaps) and per-component docs.
Strings: MISSING-STRINGS.md; all centralized in packages/frontend/src/utility/sk-strings.ts.

## Phase 2 and 3 — implementation (verification by direction: no backend or browser smoke)

Pins unchanged (base `split-project`, donor Sharkey `develop` @ `752a392d3b`). Phase 1 head was `15365ea8ed`.

Commits on split-project:
- `4f1680a34f` 2.1 + 2.4: `MkNotes`, `MkDateSeparatedList`, `SkDateSeparatedList`, `SkTransitionGroup`, `SkPagination`, `types/date-separated-list.ts`; date-separate tests.
- `23c061f66d` 2.2: `MkTimeline`, `utility/sk-timeline-query.ts` (+ tests for all 11 sources), prefs `showGapBetweenNotesInTimeline`, `disableStreamingTimeline`.
- `d6c1149e1e` 2.3: `MkNotifications`.
- `6ff3600656` 3.1: `MkScheduleEditor`, `MkSchedulePostListDialog`, `sk-schedule*.ts` (+ tests), `SkNoteSimple` schedule actions.
- `79230bb49e` dependency-only: `vuedraggable` 4.1.0.
- `3cc480839a` 3.3: `SkPostFormAttaches`, `sk-attaches.ts` (+ tests).
- `e352886ae5` 3.2: `MkPostForm` Sharkey options behind pref `useSharkeyPostForm`, `sk-post-form.ts` (+ tests).

Gate at HEAD (`e352886ae5`): typecheck exit 0; frontend tests 26 files / 222 passed; eslint `--quiet` clean on touched files; SPDX OK.
Not run: `pnpm build`, any backend/browser/live check, ja-JP changes (none made).

Decisions:
- 2.4 pagination: vendored the Sharkey paging model as `SkPagination` (consumers pass `Paging`, and `MkTimeline`/`MkNotifications` use its imperative `prepend`/`reload`); upstream pagination untouched; `SkNoteDetailed` keeps the upstream `Paginator`.
- Live reply append: not needed by `MkTimeline` (donor never used `use-note-capture` there), so upstream `composables/use-note-capture.ts` is unchanged and no Sk variant was written. Still a gap in `SkNoteSub`/`SkNoteDetailed`.
- 3.2: gated blocks in the stock `MkPostForm` (pref `useSharkeyPostForm`), not a fork; upstream drafts, `scheduledAt`, tour, `useUploader` kept; Sharkey `scheduleNote` and upstream `scheduledAt` are mutually exclusive.
- Donor deviations: `mentions` timeline now builds a query (donor built null); schedule timestamps built from explicit parts; `MkTimeline` uses a ref for its pagination query.

Deferred: settings UI for the three new prefs (Phase 10); persisting `scheduleNote` in local drafts; consumer pages for `MkTimeline`/`MkNotes`/`MkNotifications` (later phases); `notes/*` typings in misskey-js (out of scope).

Exit criteria:
- Phase 2 ("Sharkey lists coexist with upstream timelines; no consumer broken"): **met by construction, not verified live**. All new files coexist; no upstream list/pagination component was modified; typecheck and tests green.
- Phase 3 ("scheduling works against `notes/schedule/*`, PostForm options present, attaches drag+replace"): scheduling **implemented, unverified against a backend** (endpoints absent from misskey-js and stock backend); PostForm options **implemented** behind a default-off pref; drag+replace **implemented, not exercised in a browser**.


## Phase 4 and 5 — implementation (verification by direction: no backend or browser smoke)

Pins unchanged (base `split-project`, donor Sharkey `develop` @ `752a392d3b`). Phase 3 head was `0287991b9f`.

Commits on split-project:
- `83ddea5970` dependencies only: `@ruffle-rs/ruffle` 0.2.0-nightly.2025.9.25, `katex` 0.16.22, `@types/katex` 0.16.7 (donor pins), vendored `utility/libopenmpt`, vite ruffle external + `_RUFFLE_VERSION_`. Lockfile has incidental msw peer-suffix churn.
- `f038e96d8a` 4.3: `SkModPlayer`, `SkFlashPlayer`, `SkFormula`, `chiptune2`, `sk-mod-player` (+tests), `types/ruffle`, const additions, new strings, SPDX exemptions.
- `8f6b8f38a7` 4.2: `SkMediaVideo`, `SkMediaAudio`, `sk-media-player` (+tests).
- `ab91f3a3be` 4.4: `MkImgPreviewDialog` (+stories), used for images in `SkPostFormAttaches` (only rendered under `useSharkeyPostForm`).
- `d278d389a7` 4.1: `SkMediaImage`, `SkMediaBanner`, `SkMediaList`, `sk-media-types` (+tests).
- `e43fc3ff76` 5.1: `SkReactionsViewer(.reaction)`, `sk-reaction-rules` (+tests), `sk-emoji-mute`, `SkNote*` wiring. Its pref `mutedEmojis` is in `def.ts`, which landed in the 5.2 commit, so `e43fc3ff76` alone does not typecheck.
- 5.2 commit (HEAD): `SkEmojiPicker`, `sk-emoji-search` (+tests), `MkEmojiPickerDialog` pref-gated swap, prefs `mutedEmojis` and `useSharkeyEmojiPicker`, README and this log.

Gate on the final tree: typecheck exit 0; frontend tests 31 files / 261 passed; eslint --quiet clean on touched files; SPDX OK; `pnpm --filter frontend build` exit 0 (only the usual chunk-size warning).
Not run: any backend/browser/live check; ja-JP changes (none made). Intermediate commits were not individually gated.

Decisions:
- Lightbox: the Sharkey list keeps upstream `MkLightbox` routing (no PhotoSwipe dep). `image/jxl` and `video/x-matroska` live in a new `FILE_TYPE_BROWSERSAFE_SHARKEY` list, not `FILE_TYPE_BROWSERSAFE`, so stock `isPreviewable` and the embed list do not change.
- Audio renders as an inline banner, as in the donor; tracker and flash are inline in the grid and are not offered to the lightbox.
- Picker: coexisting `SkEmojiPicker` (option A), swapped in by `MkEmojiPickerDialog` behind `useSharkeyEmojiPicker`. Upstream picker, gear and haptic kept.
- `MkNote*` call sites and upstream `MkReactionsViewer` are untouched.
- No new `any`. `chiptune2` is an ES-class rewrite of the donor with `eslint-disable`.

Deferred: settings UI for `mutedEmojis`, `useSharkeyEmojiPicker` and earlier prefs (Phase 10); `SkFormula` wiring into `MkMfm`; live reply append (`use-note-capture.ts` unchanged); Ruffle needs a CSP allowing raw.esm.sh; `notes/like` still untyped and unverified.

Exit criteria:
- Phase 4 ("Sharkey players render gated by MIME + prefs; stock lightbox path untouched"): **implemented, unverified live**. Gating is by `classifySkMedia` (unit-tested) and the nsfw/dataSaver/confirm prefs; stock lightbox files and `FILE_TYPE_BROWSERSAFE` are unmodified. Players, the sensitive gate and unsupported-MIME fallback are not exercised in a browser.
- Phase 5 ("react/unreact, custom emoji perms, muted hidden with unmute; picker alias-prefix search, recent/pinned, folders"): **implemented, unverified live**. Permission/mute rules and alias-prefix search are unit-tested; react/unreact paths and the picker UI are not exercised.
