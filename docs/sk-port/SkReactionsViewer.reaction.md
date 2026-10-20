# SkReactionsViewer.reaction

- Donor: `components/MkReactionsViewer.reaction.vue`
- Target: `packages/frontend/src/components/SkReactionsViewer.reaction.vue`

## Ported
Toggle/confirm/sound/animation/tooltip/achievement flow as in donor.

## Changed
- Permissions via `utility/sk-reaction-rules.ts` (likeOnly, nonSensitive rules, remote-custom guard) instead of `checkReactionPermissions`.
- Context menu always opens: Info (if `canGetInfo`) plus Mute/Unmute emitting `toggleEmojiMute`.
- New optional prop `muted`.

## Prefs read
reactionsDisplaySize, limitWidthOfReaction, confirmOnReact, animation.

## Known gaps
Uses existing `notes/reactions/create`; the Sharkey `notes/like` endpoint is not called here (SkNote's callNotesLike handles likes).
