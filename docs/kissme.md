# kissme — Misskey with Sharkey's frontend

kissme is a Misskey fork (`split-project`) whose frontend carries a port of
Sharkey's frontend features: Sharkey note design, schedule posts, following
feed, word-mute tester, shared-access login, KaTeX math, and more — while
staying easy to rebase onto upstream Misskey. The backend is untouched
(frontend only, `packages/frontend/src`); the live testbench is the Pinetree
backend, and every backend-dependent claim is recorded in the
[backend-capability table](sk-port/README.md#backend-capability-table-live-router-probes-2026-10-20).

Donor reference (read-only): the `Sharkey` tree next to this checkout.
Stock Misskey code always wins; Sharkey behavior is added, never substituted.

## How it works

- **Design switch, not a rewrite.** Pref `prefer.s.noteDesign`
  (`'misskey' | 'sk'`) selects the design. `DynamicNote.vue`,
  `DynamicNoteSimple.vue` and `DynamicNoteDetailed.vue` lazy-load `MkNote*`
  for `'misskey'` and `Sk*` for anything else. Stock behavior is unchanged
  while the default holds; nothing outside the dispatchers reads `noteDesign`.
- **Additive upstream hooks only.** Stock `Mk*` components are never rewritten.
  New behavior lives in `Sk*` components, `sk-*` utilities, or gated additions
  (optional props, pref-gated branches). Examples: `MkSubNoteContent` gained
  optional `translation` / `expandAllCws` props that only `SkNote` passes;
  `MkPostForm` reaches the Sharkey composer only behind pref
  `useSharkeyPostForm` (default off).
- **Untyped backend seams stay visible.** Sharkey-only endpoints
  (`notes/like`, `notes/schedule/*`, `notes/edit`, `i/shared-access/*`,
  `admin/approve-user`, …) are absent from misskey-js, so they go through
  `as unknown as` untyped aliases with a comment naming the endpoint and
  telling the reader to remove the cast once misskey-js exposes it
  (see `utility/sk-like.ts`, `utility/sk-schedule-api.ts`). Where the backend
  lacks an endpoint the UI degrades honestly — an error dialog, a disabled
  note, an empty menu — never faked behavior, never dead UI.
- **Real locales.** All user-facing strings live in both
  `locales/en-US.yml` and `locales/ja-JP.yml` (English reuses the donor
  `sharkey-locales/*.yml` wording where it fits; Japanese is new, written in
  Misskey tone) and are read via `i18n.ts` / `i18n.tsx`. The intermediate
  `sk-strings.ts` module is deleted. This deliberately overrides the
  `locales/ja-JP.yml`-only rule, so `node scripts/check-shipping.mjs` reports
  Locale safety FAIL — that is expected and noted in commit messages.
- **One doc page per ported area** under `docs/sk-port/` (index:
  [sk-port/README.md](sk-port/README.md)). Each page states the donor source,
  what was adapted (icons Phosphor→Tabler, endpoint casts, dropped donor
  bits), and known gaps.
- **No new dependencies without a pinned version** in
  `packages/frontend/package.json` (currently `@ruffle-rs/ruffle`, `katex`,
  `@types/katex`, `vuedraggable` — all pinned).

## What it does

- Sharkey note rendering (`SkNote`, `SkNoteSub`, `SkNoteSimple`,
  `SkNoteDetailed`, mute placeholder, translation, URL previews, old-note
  window) — [SkNote.md](sk-port/SkNote.md), [SkNoteDetailed.md](sk-port/SkNoteDetailed.md),
  [SkMutedNote.md](sk-port/SkMutedNote.md), [SkNoteHeader.md](sk-port/SkNoteHeader.md)
- Honest like seam (`notes/like`, re-read sync, unsupported dialog) —
  [sk-like.md](sk-port/sk-like.md)
- Schedule editor, scheduled-notes dialog, composer integration —
  [MkScheduleEditor.md](sk-port/MkScheduleEditor.md),
  [MkSchedulePostListDialog.md](sk-port/MkSchedulePostListDialog.md),
  [MkPostForm.md](sk-port/MkPostForm.md)
- Following feed page, remote-followers warning —
  [following-feed.md](sk-port/following-feed.md)
- Word-mute tester, mute settings — [SkPatternTest.md](sk-port/SkPatternTest.md)
- Media: images, banners, lists, custom video/audio players, tracker modules,
  Flash (Ruffle), KaTeX formulas — [sk-port/SkMediaImage.md](sk-port/SkMediaImage.md),
  [sk-mod-player.md](sk-port/sk-mod-player.md), [SkFlashPlayer.md](sk-port/SkFlashPlayer.md),
  [SkFormula.md](sk-port/SkFormula.md)
- Reactions viewer with permission/mute rules, emoji picker, mute-aware emoji —
  [SkReactionsViewer.md](sk-port/SkReactionsViewer.md),
  [SkEmojiPicker.md](sk-port/SkEmojiPicker.md), [sk-emoji-mute.md](sk-port/sk-emoji-mute.md)
- Admin approvals queue — [sk-admin-approvals.md](sk-port/sk-admin-approvals.md)
- Shared-access login dialog — [SkSigninSharedAccessDialog.md](sk-port/SkSigninSharedAccessDialog.md)
- Attribution domains setting — [sk-attribution-domains.md](sk-port/sk-attribution-domains.md)
- ListenBrainz, MFM cheatsheet, oneko, follow-mouse, ticker —
  [phase-9-1-9-2.md](sk-port/phase-9-1-9-2.md) (`SkBadgeStrip` deleted in Gap 5:
  no clean wiring target)
- Static pages (about-sharkey, unsubscribe, Sharkey entrance) —
  [static-pages.md](sk-port/static-pages.md)
- Search-results window, search widget wiring —
  [SkSearchResultWindow.md](sk-port/SkSearchResultWindow.md)
- External-link warning, note error list —
  [MkUrlWarningDialog.md](sk-port/MkUrlWarningDialog.md),
  [SkErrorList.md](sk-port/SkErrorList.md)

- Live reply append in open threads (`replied` / `updated` stream events via
  additive `use-note-capture` callbacks) — [SkNoteLiveReplies.md](sk-port/SkNoteLiveReplies.md)
- Single-note mute menu (`noteOnly` thread-muting seam) — [sk-note-mute.md](sk-port/sk-note-mute.md)
- File-type search filter — [search-filetype.md](sk-port/search-filetype.md)
- Bubble timeline surface (policy-gated tab, deck column, widget inheritance) —
  [bubble-timeline.md](sk-port/bubble-timeline.md)
- Backend contract index for the above — [backend-requirements.md](sk-port/backend-requirements.md)

## What it explicitly does not do

- **No full no-websocket mode.** `disableStreamingTimeline` swaps the stream
  for `StreamMock` (`utility/stream-mock.ts`); the donor's deeper offline
  behavior is not reproduced.
- **No backend changes.** Anything the backend lacks (approval endpoints,
  shared-access, CW admin, ListenBrainz field, mandatory-CW / silence fields,
  and the Gap contracts in [backend-requirements.md](sk-port/backend-requirements.md))
  is a documented gap for the backend maintainers, not worked around in the
  frontend.

## Verification

No browser is connected in this environment, so nothing here is browser-tested.
Each change is verified by `vue-tsc --noEmit`, the full frontend unit suite,
`eslint --quiet` on touched files and `node scripts/check-spdx.mjs`, plus
unauthenticated router probes against Pinetree for endpoint existence (see the
capability table). Behavior beyond router resolution is unverified live.
