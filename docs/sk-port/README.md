# Sharkey frontend port — implementation index

This is the per-feature record of how the Sharkey note frontend is implemented on top of
Misskey `split-project` (base `b8f3eb20d8`). It covers what was built, every upstream file
that was touched, and what is still missing.

Scope: frontend only (`packages/frontend/src`). Backend untouched. There is **no live testing
against a backend** for this port (by direction). Verification is typecheck, unit tests,
eslint, and SPDX.

## How the port is wired

- **Design switch.** `prefer.s.noteDesign` (`'misskey' | 'sk'`, default `'misskey'`) selects the
  design. `DynamicNote.vue`, `DynamicNoteSimple.vue` and `DynamicNoteDetailed.vue` lazy-load
  `MkNote*` for `'misskey'` and `Sk*` for anything else. Stock behavior is unchanged while the
  default holds. Nothing outside the dispatchers reads `noteDesign`.
- **Mute.** Sharkey's mute-central lives in `utility/sk-check-mute.ts` (`checkMute`,
  `useMuteOverrides`, mandatory CW, word and sensitive mutes). Upstream's
  `utility/check-word-mute.ts` (`checkWordMute`) is unchanged, because other upstream code uses it.
  `components/SkMutedNote.vue` renders the placeholder and expand-to-view.
  `DynamicNote*` writes mute overrides via `utility/merge.ts` `deepAssign`.
- **Strings.** Sharkey strings missing from `en-US.yml` are centralized in
  `locales/en-US.yml` / `locales/ja-JP.yml` (trailing Sharkey sections). See `MISSING-STRINGS.md` at the repo root.
- **Boost and quote.** `utility/boost-quote.ts` (visibility ordering, boost menu) and
  `utility/check-animated-mfm.ts` (animated MFM detection). Both have unit tests in
  `packages/frontend/test/unit/`.
- **Translation.** `utility/translate-note.ts` is the server path (`notes/translate`).
  Upstream's browser-translator path in `get-note-menu.ts` is untouched.
- **Plugins.** `plugin.ts` gains `setupNoteViewInterruptors` (mirrors Sharkey).
- **Policies.** `instance.ts` gains `policies` (user policies, else instance policies).

## Components

| Component | Doc | State |
|---|---|---|
| `SkNote.vue` | [SkNote.md](SkNote.md) | Ported. Used by `DynamicNote` when `noteDesign` is `sk`. |
| `SkNoteSub.vue` | [SkNoteSub.md](SkNoteSub.md) | Ported. |
| `SkNoteSimple.vue` | [SkNoteSimple.md](SkNoteSimple.md) | Ported. Schedule props kept, no schedule calls (Phase 3). |
| `SkNoteDetailed.vue` | [SkNoteDetailed.md](SkNoteDetailed.md) | Ported. |
| `SkNoteTranslation.vue` | [SkNoteTranslation.md](SkNoteTranslation.md) | Ported. |
| `SkMutedNote.vue` | (this file) | Ported. |
| `SkUrlPreview.vue`, `SkUrlPreviewGroup.vue` | [SkUrlPreview.md](SkUrlPreview.md), [SkUrlPreviewGroup.md](SkUrlPreviewGroup.md) | Ported. |
| `SkOldNoteWindow.vue` | [SkOldNoteWindow.md](SkOldNoteWindow.md) | Ported. Opened only from the versions menu (see gaps). |
| `SkFetchNote.vue` | [SkFetchNote.md](SkFetchNote.md) | Ported. |
| `utility/get-note-versions-menu.ts` | [get-note-versions-menu.md](get-note-versions-menu.md) | Ported. Calls `notes/versions` (absent, see gaps). |
| `MkUrlWarningDialog.vue` | (this file) | New. External-link warning (Phase 9.2 dependency). |
| `SkNoteHeader.vue`, `SkMutedNote.vue` | (this file) | Ported in slice 1.1 / 1.2. |

### Phase 2 and 3 additions

| Component / utility | Doc | State |
|---|---|---|
| `SkPagination.vue` (+ `types/date-separated-list.ts`) | [SkPagination.md](SkPagination.md) | Vendored Sharkey `Paging` model, renamed. Upstream `MkPagination`/`IPaginator` untouched. |
| `SkTransitionGroup.vue`, `SkDateSeparatedList.vue`, `MkDateSeparatedList.vue`, `MkNotes.vue` | [SkTransitionGroup.md](SkTransitionGroup.md), [SkDateSeparatedList.md](SkDateSeparatedList.md), [MkDateSeparatedList.md](MkDateSeparatedList.md), [MkNotes.md](MkNotes.md) | Ported. No consumer pages yet. |
| `MkTimeline.vue`, `utility/sk-timeline-query.ts` | [MkTimeline.md](MkTimeline.md) | Ported; query builder unit-tested. |
| `MkNotifications.vue` | [MkNotifications.md](MkNotifications.md) | Ported thin wrapper. |
| `MkScheduleEditor.vue`, `utility/sk-schedule.ts` | [MkScheduleEditor.md](MkScheduleEditor.md) | Ported; date/time logic unit-tested. |
| `MkSchedulePostListDialog.vue`, `utility/sk-schedule-api.ts` | [MkSchedulePostListDialog.md](MkSchedulePostListDialog.md) | Ported; `notes/schedule/*` unverified. `SkNoteSimple` gained the edit/delete schedule actions. |
| `SkPostFormAttaches.vue`, `utility/sk-attaches.ts` | [SkPostFormAttaches.md](SkPostFormAttaches.md) | Ported (new dependency `vuedraggable`). |
| `MkPostForm.vue` (edited), `utility/sk-post-form.ts` | [MkPostForm.md](MkPostForm.md) | Sharkey options behind pref `useSharkeyPostForm` (default off). |

### Phase 4 and 5 additions

| Component / utility | Doc | State |
|---|---|---|
| `SkMediaImage.vue`, `SkMediaBanner.vue` | [SkMediaImage.md](SkMediaImage.md), [SkMediaBanner.md](SkMediaBanner.md) | Ported from upstream's newer base plus Sharkey badges, comment title, inline audio banner. |
| `SkMediaList.vue`, `utility/sk-media-types.ts` | [SkMediaList.md](SkMediaList.md), [sk-media-types.md](sk-media-types.md) | Stock `MkLightbox` path kept (no PhotoSwipe). Used by `SkNote`, `SkNoteDetailed`, `SkOldNoteWindow`. Tested classifier. |
| `SkMediaVideo.vue`, `SkMediaAudio.vue`, `utility/sk-media-player.ts` | [SkMediaVideo.md](SkMediaVideo.md), [SkMediaAudio.md](SkMediaAudio.md), [sk-media-player.md](sk-media-player.md) | Inline custom players, tested math. `useNativeUiForVideoAudioPlayer` fallback. |
| `SkModPlayer.vue`, `utility/chiptune2.ts`, `utility/sk-mod-player.ts`, vendored `utility/libopenmpt/` | [SkModPlayer.md](SkModPlayer.md), [chiptune2.md](chiptune2.md), [sk-mod-player.md](sk-mod-player.md) | Tracker modules. `chiptune2` rewritten as ES classes. |
| `SkFlashPlayer.vue`, `types/ruffle/**` | [SkFlashPlayer.md](SkFlashPlayer.md) | Ruffle via esm.sh (needs a CSP that allows it). |
| `SkFormula.vue` | [SkFormula.md](SkFormula.md) | KaTeX. **Not wired into `MkMfm`** (math MFM still renders `<code>`; deferred). |
| `MkImgPreviewDialog.vue` | [MkImgPreviewDialog.md](MkImgPreviewDialog.md) | Added an emitted `closed` (donor leaked the popup). Opened from `SkPostFormAttaches` for image files. |
| `SkReactionsViewer.vue`, `SkReactionsViewer.reaction.vue`, `utility/sk-reaction-rules.ts`, `utility/sk-emoji-mute.ts` | [SkReactionsViewer.md](SkReactionsViewer.md), [SkReactionsViewer.reaction.md](SkReactionsViewer.reaction.md), [sk-reaction-rules.md](sk-reaction-rules.md), [sk-emoji-mute.md](sk-emoji-mute.md) | `note: Note` prop. Used by `SkNote*`; `MkNote*` keep the stock viewer. Rules tested. |
| `SkEmojiPicker.vue`, `utility/sk-emoji-search.ts` | [SkEmojiPicker.md](SkEmojiPicker.md) | Coexisting picker, swapped in by `MkEmojiPickerDialog` behind `useSharkeyEmojiPicker`. Search util tested. |

### Phase 6 additions

| Component / utility | Doc | State |
|---|---|---|
| `utility/sk-upload.ts`, `utility/sk-select-file.ts`, `utility/upload/compress-config.ts` | [sk-upload-pipeline.md](sk-upload-pipeline.md) | Coexisting chooser + uploader + queue state. Reached only from `MkPostForm` attach when pref `useSharkeyUploader` is on. Compression selection tested. |
| `SkDriveSelectDialog.vue` (+ stories) | [SkDriveSelectDialog.md](SkDriveSelectDialog.md) | Unified file/folder picker; upstream Drive select dialogs untouched. |

Pref added in Phase 6: `useSharkeyUploader` (default `false`, no settings UI yet; Phase 10). Upstream touched (additive): `components/MkPostForm.vue` (attach chooser gated by the pref), `preferences/def.ts`. Gaps: no double-click confirm in the dialog; `isForImport` URL upload untyped; nothing exercised live.

Prefs added in Phase 4/5 (all with no settings UI yet; Phase 10): `mutedEmojis` (`string[]`, default `[]`), `useSharkeyEmojiPicker` (default `false`). Media and reaction components are used only by the `Sk*` note design, which is itself gated by `noteDesign`.

Upstream files touched in Phase 4/5 (additive): `frontend-shared/js/const.ts` (new exports only; `FILE_TYPE_BROWSERSAFE` unchanged), `components/MkEmojiPickerDialog.vue` (pref-gated component swap), `components/SkPostFormAttaches.vue` (image preview dialog), `vite.config.ts` (ruffle external + `_RUFFLE_VERSION_`), `@types/global.d.ts`, `eslint.config.js`, `scripts/check-spdx.mjs` (exempts vendored libopenmpt, ruffle types, chiptune2).

Phase 4/5 gaps: sensitive/`confirmWhenRevealingSensitiveMedia` gate in `SkModPlayer`/`SkFlashPlayer` only follows `nsfw` (as the donor); `SkModPlayer` fetches the module even while hidden (as the donor); `use-note-capture.ts` is unchanged, the viewer reads `note.reactions` reactively only; no seekbar white tint; the "SkFormula in MkMfm" wiring is not done; `notes/like` is still untyped and unverified.

Prefs added in Phase 2/3: `showGapBetweenNotesInTimeline`, `disableStreamingTimeline`, `useSharkeyPostForm` (all default `false`, none has a settings UI yet; Phase 10).

Upstream components changed (additive, default behavior unchanged):

- `components/MkSubNoteContent.vue`: optional `translation`, `translating`, `hideFiles`,
  `expandAllCws`. `translation`/`translating` render `SkNoteTranslation`. `hideFiles` hides
  attachments. `expandAllCws` starts the body expanded. Upstream `MkNoteSub` passes none of
  them, so it is unchanged.
- `components/global/MkMfm.ts`: optional `isAnim`. When unset it uses
  `prefer.s.advancedMfm && prefer.s.animatedMfm`, exactly as before. `SkNote` passes it for the
  per-note animated-MFM play override.

## Preferences added (`preferences/def.ts`)

`noteDesign` ('misskey' | 'sk', default `'misskey'`), `showTranslationButtonInNoteFooter`,
`clickToOpen`, `collapseNotesRepliedTo`, `numberOfReplies`, `showVisibilitySelectorOnBoost`,
`uncollapseCW`, `visibilityOnBoost`, `autoloadConversation`, `like`, `trustedDomains`,
`warnExternalUrl`, `expandLongNote`. Defaults follow Sharkey's `def.ts`.

## Icons

Sharkey used Phosphor (`ph-*`). Misskey ships Tabler (`ti-*`) only, so every ported icon is
mapped to its nearest Tabler name. `@phosphor-icons/web` is not added.

## Known gaps (not tested; no backend)

Endpoints absent from `misskey-js` (frontend keeps the donor call; they fail on a stock backend):

- `notes/like` — the like button and like-only reactions (`SkNote`, `SkNoteSub`, `SkNoteDetailed`).
  Called through an untyped alias of `misskeyApi`.
- `notes/versions` — the edit-history menu (`get-note-versions-menu.ts`). Failure degrades to an
  empty menu.
- `notes/schedule/create|delete|list`, `notes/edit` — Phase 3 (`MkPostForm`, `MkSchedulePostListDialog`,
  `SkNoteSimple`), via untyped wrappers in `utility/sk-schedule-api.ts`. Also absent from misskey-js:
  `notes/bubble-timeline` and the `bubbleTimeline` stream channel (`MkTimeline`).

Live probes against Pinetree (verified, not just untyped): `notes/bubble-timeline`,
`notes/following`, and `i/shared-access/*` all answer `UNKNOWN_API_ENDPOINT`.
The bubble mapping, its only consumer (`MkTimeline`), and the consumerless
`MkNotifications` wrapper were removed; deck columns and the timeline page offer
home/local/social/global only, so there is no dead UI. `following` deck columns
are served by the ported `following-column.vue` instead (backed by the existing
following-feed utilities).

Fields absent from the upstream API (read through casts; behavior is a no-op when missing):

- `updatedAt` (Edited marker), `isRenoted` (renote state), `isFavorited`.
- `user.rejectQuotes` / `$i.rejectQuotes` (quote gate; without it the quote button always shows).
- `threadId`, `isMutingThread`, `isMutingNote`, `bypassSilence`, and user/instance
  `mandatoryCW` / `isSilenced`. Thread mute and user/instance mandatory CW are therefore inactive.
  Word, hard, and sensitive mutes still work.
- Instance `trustedLinkUrlPatterns`. Always empty, so external links always show the warning.

Behavior not ported:

- **Live reply append** (SkNoteSub, SkNoteDetailed). Upstream `composables/use-note-capture.ts`
  has a different API (`{ note, parentNote, mock }`, no reply or delete callbacks). Replies do
  not append live. Deleted notes are dropped via the `noteDeleted` global event.
- **Instance ticker in SkNote.** The donor computes it but never renders it; the ticker lives in
  `SkNoteHeader`, which SkNote does not use.
- **`hideFiles` / `numberOfReplies` in SkNote.** The donor does not use them in SkNote; they
  apply to `SkNoteSimple` and `MkNoteSub`.
- **Raw `GET /url` route** used by `SkUrlPreview` is not in `misskey-js`. Kept as the donor
  calls it.
- **Focus.** The donor's `rootComp`/`el` refs are not bound in the template, so `focus()` does
  nothing (as in the donor).

Dependency and typing notes:

- `@misskey-dev/summaly` in the target lacks `haveNoteLocally` and `linkAttribution`. These are
  declared locally in `SkUrlPreview*`.
- `promise-limit` is not a target dependency. `SkUrlPreviewGroup` inlines a small limiter with
  the same contract.

## Verification performed

- `pnpm --filter frontend typecheck`: exit 0.
- `pnpm --filter frontend test`: 31 files, 261 tests pass (after Phase 5).
- `eslint --quiet` on all 19 touched files: clean.
- `node scripts/check-spdx.mjs`: `SPDX: OK`.
- Not run: browser smoke or any backend-backed check, by direction.

### Phase 7 additions

| Component / utility | Doc | State |
|---|---|---|
| `types/following-feed.ts`, `utility/following-feed-utils.ts`, `SkRemoteFollowersWarning.vue`, `SkFollowingFeedEntry.vue`, `SkFollowingRecentNotes.vue`, `SkUserRecentNotes.vue`, `pages/following-feed.vue`, `pages/user/recent-notes.vue` | [following-feed.md](following-feed.md) | Ported. Routes `/following-feed[/:userId]`; nav entry behind pref `showFollowingFeedNav` (default off). `notes/following` is absent from misskey-js and stock Misskey. |

### Phase 8 additions

| Component / utility | Doc | State |
|---|---|---|
| `pages/admin/approvals.vue`, `SkApprovalUser.vue`, `utility/sk-approvals-api.ts` | (this file) | Route `/admin/approvals` + admin nav entry. Disabled note when `admin/approve-user` is missing (404 probe). Untyped endpoints; unverified live. |
| `SkPatternTest.vue`, `utility/sk-parse-mutes.ts` | (this file) | Word-mute tester, shown in the mute settings behind pref `showWordMuteTester` (default off). Reuses `getMutedWords` from `sk-check-mute.ts`. Tested. |
| `pages/settings/profile.attribution-domains-setting.vue`, `utility/sk-attribution-domains.ts` | (this file) | Saves via untyped `i/update`; shown in settings profile behind pref `showAttributionDomains` (default off). Tested. |

### Phase 10.1-10.3 (prefs, migration, routes)

See [phase10-prefs.md](phase10-prefs.md): store/preferences merge, defaults table (with the open `noteDesign` default decision), `/settings/sharkey`, `pref-migrate` and its boot call site, route table.

### Phase 10.4-10.7 (infra)

See [phase10-infra.md](phase10-infra.md): boot/config/const/emoji-base notes, deps and build decisions, themes, ja-JP strings, embed/misskey-js decisions, follow-up slices.

### Phase 9.4 additions

See [phase9-utilities.md](phase9-utilities.md) for the per-utility disposition table.

### Phase 9.3 additions

| Component / utility | Doc | State |
|---|---|---|
| `pages/about-sharkey.vue`, `pages/unsubscribe.vue`, `pages/welcome.entrance.a.vue`, `utility/sk-static-pages.ts` | [static-pages.md](static-pages.md) | Routes `/about-sharkey`, `/unsubscribe/:user/:token`; entrance A behind pref `welcomeEntranceStyle` (default `'server'`). Helpers tested. |

### Phase 9.1 / 9.2 additions

| Component / utility | Doc | State |
|---|---|---|
| `SkInstanceTicker`, `SkBadgeStrip`, `SkMfmWindow`, `SkListenBrainz`, `SkOneko`, `CkFollowMouse`, `MkMarquee`, `MkRadio`, `utility/sk-{follow-mouse,oneko,mfm-cheatsheet,listenbrainz}.ts` | [phase-9-1-9-2.md](phase-9-1-9-2.md) | Ported. Prefs `showTickerOnReplies`, `oneko` (default off). `SkUrlPreviewGroup`, `SkTransitionGroup`, `MkUrlWarningDialog` verified as already landed. |
