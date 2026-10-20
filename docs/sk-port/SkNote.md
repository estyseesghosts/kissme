> Note: Sharkey UI strings are now centralized in `packages/frontend/src/utility/sk-strings.ts` (see README.md and MISSING-STRINGS.md). Any `skStrings` table mentioned below refers to that module.

# SkNote.vue port

- Donor: `/Users/terezi/Local Documents/fedifedifedi/Sharkey/packages/frontend/src/components/SkNote.vue` (1348 lines)
- Target: `/Users/terezi/Local Documents/misskey/packages/frontend/src/components/SkNote.vue`
- SPDX header kept verbatim.
- Typecheck (`npx -y pnpm@11.25.0 --filter frontend typecheck`): exit 0, zero errors at time of writing.

## Ported as-is

- Template structure: SkMutedNote wrapper, collapsed reply, pinned tip, renote header, collapsed renote target, article, clickToOpen, CW, content, files, poll, URL preview group, quote, show more/less, channel link, footer.
- Hotkeys (`keymap`): r, e|a|plus, q, m, c, t, o, v|enter, esc, up|k|shift+tab, down|j|tab.
- Collapse logic: `renoteCollapsed` (collapseRenotes), `inReplyToCollapsed` (collapseNotesRepliedTo), `collapsed` (long notes), `showContent` (uncollapseCW).
- Boost: `boostVisibility`, `renote`, `undoRenote`, `boostMenuItems`, `computeRenoteTooltip`.
- Quote, reply, like, react, undoReact, toggleReact, reaction picker, confirmOnReact, likeOnly handling.
- `canRenote`, rejectQuotes gating on the quote button, likeOnly gating on like and reactions viewer.
- Footer clip and translate buttons gated by prefs.
- Context menu (`onContextmenu`, useReactionPickerForContextMenu), `showMenu`, `showRenoteMenu`, `clip`.
- Animated MFM: `animatedMFM()` confirm flow and `checkAnimationFromMfm`.
- Emits: reaction, removeReaction, expandMute.
- Style block copied verbatim from donor (lines 851-1348), including container queries.

## Deviations and why

1. **useNoteCapture.** Donor signature `{rootEl, note, pureNote, isDeletedRef}` is not in target. Target signature is `{note, parentNote, mock}`, returning `$note` and `subscribe`. Reaction and poll display now reads `$appearNote`. `subscribeManuallyToNoteCapture()` is called on menu-open paths, as target's use-note does.
2. **Deletion.** `isDeleted` is set via `useGlobalEvent('noteDeleted')`, as in target's use-note. The donor's capture callback is not used.
3. **MkReactionsViewer.** Target props are `noteId`, `reactions`, `reactionEmojis`, `myReaction`, not `note`.
4. **MkPoll.** Target props are `multiple`, `expiresAt`, `choices`, not `poll`. `local` dropped. `author` kept.
5. **Tooltips.** `anchorElement` replaces donor's `targetElement` for MkUsersTooltip and MkReactionsViewer.details (target prop names). `useTooltip` imported from `@/composables/use-tooltip.js`.
6. **getNoteMenu / getNoteClipMenu.** Donor's `isDeleted` argument dropped; target signatures do not accept it. `currentAntenna` is not passed.
7. **translateNote** imported from `@/utility/translate-note.js`. Local `translation` ref typed `NotesTranslateResponse | null`, as in target use-note.
8. **os.post** returns `Promise<void>` in target, so the donor's `cancelled` check is removed. The quote toast still only fires when `notes/renotes?quote=true` returns a quote.
9. **Channel branch.** `else if (!channel || channel.allowRenoteToExternal)` became `else`. Inside that branch `channel` is always null, so the condition was always true. Behavior unchanged.
10. **Router.** `router.push('/notes/:noteId/:initialTab?', { params: { noteId } })`, the typed form used elsewhere in target.
11. **SkNote-only type.** Local `type SkNote` intersects `Note` with `updatedAt`, `isRenoted`, `isFavorited`, and `user.rejectQuotes`. Those fields are not in misskey-js types. `$i.rejectQuotes` is read through a cast into `myRejectQuotes`.
12. **SkNoteHeader.** Donor `:mini="true"` dropped (not a prop in target; target has `classic`).
13. **MkMediaList.** Added `:user="appearNote.user"` to match target's signature.
14. **Event type.** `onContextmenu(ev: PointerEvent)`, matching target use-note.
15. **Icons (Phosphor to Tabler).** `ph-pencil-simple` to `ti-pencil`; `ph-play` to `ti-player-play`; `ph-stop` to `ti-player-stop`; `ph-quotes` to `ti-quote`; `ph-heart` to `ti-heart`; `ph-smiley` to `ti-mood-smile`.
16. **Removed unused donor bits.** `MkUrlPreview` and `MkNoteSub` imports, `showTicker` computed, `readPromo()` (`promo/read`, never called from the template), `MkInstanceTicker` (see "Not ported").
17. **Dropped non-target attributes.** `isBlock` and `isAnim` on Mfm.

## i18n keys replaced with local `skStrings` (pending locales, see MISSING-STRINGS.md)

- `quoted`: "Quoted."
- `rmboost`: "Boost removed."
- `noteFooterLabel`: "Note actions"
- `_animatedMFM.play`: "Play"
- `_animatedMFM.stop`: "Stop"
- `_animatedMFM._alert.text`: "Animated MFM can be resource-intensive. Play it anyway?"
- `_animatedMFM._alert.confirm`: "Play"

No locale keys added.

## Prefs used

Present in target def.ts: showNoteActionsOnlyHover, skipNoteRender, clickToOpen, uncollapseCW, collapseRenotes, collapseNotesRepliedTo, like, advancedMfm, animatedMfm, visibilityOnBoost, showVisibilitySelectorOnBoost, useReactionPickerForContextMenu, confirmOnReact, animation, showClipButtonInNoteFooter, showTranslationButtonInNoteFooter, showReactionsCount.

**Missing: `expandLongNote`.** Not edited in def.ts. Defaulted in-component to `false` (donor default from Sharkey def.ts), as `const expandLongNote: boolean = false`. Swap to `prefer.s.expandLongNote` once def.ts has the key.

## Endpoints

- `notes/create`, `notes/renotes`, `notes/reactions`, `notes/reactions/create`, `notes/reactions/delete`, `notes/unrenote`, `notes/delete`: present in misskey-js.
- `notes/like`: **absent from misskey-js.** Kept as in donor via `callNotesLike()`, which casts `misskeyApi` to accept the endpoint string. Remove the cast when misskey-js has it.
- `promo/read`: present in misskey-js, but the donor function that called it was unused and was dropped.
- `notes/versions`: not called here. Goes through `@/utility/get-note-versions-menu.js` (written by another agent).

## Not ported / could not reproduce

- **Per-note animated MFM play override.** Target `MkMfm` has no `isAnim` prop and gates animation on prefs only. The Play/Stop button still toggles `allowAnim`, but nothing downstream reads it. Needs a shared MkMfm change to take effect.
- **Instance ticker.** Donor SkNote computes `showTicker` but its template never renders a ticker (the ticker lives in SkNoteHeader). Not rendered here.
- **`hideFiles` and `numberOfReplies`.** Not present in donor SkNote.vue. They live in donor SkNoteSimple and MkNoteSub, so nothing was added here.
- **Backend-only fields.** `updatedAt` (edited marker), `isRenoted` (renote button state), `isFavorited` (renote collapse), `user.rejectQuotes` (quote gate), and `$i.rejectQuotes`. Not in misskey-js types. Typed through the local SkNote intersection. If the backend does not send them, those behaviors silently no-op. Not tested against a backend.

## Shared changes needed

- `preferences/def.ts`: add `expandLongNote` (default false).
- `MkMfm.ts`: add an `isAnim` prop if the per-note animated MFM play override should work.
- `misskey-js`: add `notes/like` if the endpoint is real.
- `MISSING-STRINGS.md`: already lists `quoted`, `rmboost`, `noteFooterLabel`. Confirm the `_animatedMFM.*` keys are tracked there too.
