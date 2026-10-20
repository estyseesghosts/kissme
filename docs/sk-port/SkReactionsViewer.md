# SkReactionsViewer

- Donor: `components/MkReactionsViewer.vue`
- Target: `packages/frontend/src/components/SkReactionsViewer.vue`

## Ported
Donor viewer (note prop, SkTransitionGroup, XReaction, `more` slot / `.moreReactions`), pointing at `SkReactionsViewer.reaction.vue`.

## Added
`mutedEmojis` prop: muted reactions are hidden (own reaction never) behind a counter button that shows/hides them. Emits `toggleEmojiMute(reaction)` when the reaction menu mute/unmute is chosen.

## Props
`note: Misskey.entities.Note`, `maxNumber?: number` (default Infinity), `mutedEmojis?: readonly string[]` (default []). Emits `mockUpdateMyReaction(emoji, delta)`, `toggleEmojiMute(reaction)`. Slot `more`.

## Prefs read
None directly (reaction child reads some).

## Known gaps
Mute storage is up to the caller. Live reply/capture: uses note.reactions reactively; use-note-capture.ts not touched.
