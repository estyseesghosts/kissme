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
  `utility/sk-strings.ts`. See `MISSING-STRINGS.md` at the repo root.
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
- `notes/schedule/create|delete|list` — Phase 3. Schedule props exist on `SkNoteSimple`; nothing
  calls these yet.

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
- `pnpm --filter frontend test`: 19 files, 160 tests pass.
- `eslint --quiet` on all 19 touched files: clean.
- `node scripts/check-spdx.mjs`: `SPDX: OK`.
- Not run: browser smoke or any backend-backed check, by direction.
