# Honest like seam port

- Donor: Sharkey `SkNote.vue` / `MkNoteSub.vue` / `MkNote.vue` call
  `misskeyApi('notes/like', …)` directly (fire-and-forget).
- Target: `packages/frontend/src/utility/sk-like.ts`
  (`likeNote`, `alertLikeUnsupported`, `likeNoteWithFeedback`), used by the
  `SkNote*` footer handlers.
- SPDX header kept.

## What it is

`notes/like` is a Sharkey-only endpoint, absent from misskey-js and from stock
Misskey / Pinetree. The port routes every like through `likeNote()`, which
returns `'liked'` or `'unsupported'`, and never fakes the behavior: on
`UNKNOWN_API_ENDPOINT` the caller shows the `likeNotSupported` dialog
(`alertLikeUnsupported`) instead of setting a reaction or favorite.

## Adapted

- After a success the note is re-read (`notes/show`) and local reaction state
  is synced to the truth in both directions; the stream echo of the same change
  is deduped downstream. Rapid presses on one note are serialized per-note so
  overlapping re-reads cannot interleave.
- Strings: `likeNotSupported` lives in the trailing Sharkey locale section
  (`i18n.ts`); the donor has no wording.
- The like button, like-only reactions and tooltips in `SkNote`,
  `SkNoteSub`, `SkNoteDetailed` all share this path (see also
  `utility/sk-reaction-rules.ts` for the permission/mute rules).

## Known gaps

- On backends without `notes/like` the like affordance degrades to an honest
  dialog; like-only reactions from such servers never resolve.
- No browser verification; covered by typecheck and unit tests
  (`test/unit/sk-like.test.ts`).
