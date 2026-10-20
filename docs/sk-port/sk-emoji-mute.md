# sk-emoji-mute

- Donor: none (the donor has no persisted emoji-mute list; its reaction component only offered the menu)
- Target: `packages/frontend/src/utility/sk-emoji-mute.ts`, `toggleMutedEmoji` in `utility/sk-reaction-rules.ts` (tested)

`onToggleEmojiMute(reaction)` is the handler for `SkReactionsViewer`'s `toggleEmojiMute` event. It stores the bare emoji name in the new pref `mutedEmojis` (default `[]`). Used by `SkNote`, `SkNoteDetailed`, `SkNoteSub`. Own reactions are never hidden. No settings UI yet (Phase 10).
