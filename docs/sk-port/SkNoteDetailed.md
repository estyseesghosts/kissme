> Note: Sharkey UI strings are now centralized in `packages/frontend/src/utility/sk-strings.ts` (see README.md and MISSING-STRINGS.md). Any `skStrings` table mentioned below refers to that module.

# SkNoteDetailed.vue (Sharkey detailed note view port)

- Donor: `/Users/terezi/Local Documents/fedifedifedi/Sharkey/packages/frontend/src/components/SkNoteDetailed.vue` (1241 lines)
- Target: `/Users/terezi/Local Documents/misskey/packages/frontend/src/components/SkNoteDetailed.vue`
- SPDX header kept as in the donor. Style block kept verbatim. Props (`note`, `initialTab`, `expandAllCws`) and the `expandMute` emit are unchanged.

## Ported as-is

- Template structure: mute wrapper (`SkMutedNote`), renote header, conversation and reply blocks, article/header/content/footer, tabs (replies, renotes, quotes, reactions).
- Script logic: thread and reply loading (`notes/children`, `notes/conversation`), renotes and quotes tabs, reaction-tab auto-select, renote/quote/react/like/undo-renote flows, delete-renote menu, keymap, scroll-into-view on mount and update, wheel tracking, `setupNoteViewInterruptors`, `expandAllCws` watch, `autoloadConversation`.
- Translation: `translateNote` (from `@/utility/translate-note.js`) with `SkNoteTranslation`, and the `prefer.s.showTranslationButtonInNoteFooter` button.

## Deviations and why

Imports and components:
1. `translateNote` now comes from `@/utility/translate-note.js` (was `get-note-menu.js`, which in Misskey has no `translateNote`).
2. `SkInstanceTicker` is replaced by `MkInstanceTicker` with the same `host` and `instance` props.
3. `Paging` / `MkPagination :pagination` is replaced by `Paginator` from `@/utility/paginator.js` with `:paginator` and `:autoLoad="false"`. Misskey's `MkPagination` takes a paginator, and `disableAutoLoad` is not a prop there.
4. `useNoteCapture` uses Misskey's signature `{ note, parentNote }`. The donor's `rootEl`, `pureNote`, `isDeletedRef` and `onReplyCallback` options do not exist in Misskey. Live reactions and poll choices come from `$appearNote`. `subscribe()` is called in `onMounted`.
5. Because of (4), `addReplyTo` is dropped. The replies list no longer updates live when a reply is posted from this view.
6. `MkReactionsViewer` takes `reactions`, `reactionEmojis`, `myReaction`, `noteId`, as upstream `MkNoteDetailed` does.
7. `MkPoll` takes `noteId`, `multiple`, `expiresAt`, `choices`, `author`, `emojiUrls` (Misskey props). The donor's `poll` and `local` props are dropped.
8. Popups: `targetElement` is renamed to `anchorElement` for `MkUsersTooltip` and `MkReactionsViewer.details`, matching their props.
9. `getNoteMenu` and `getNoteClipMenu` no longer take `isDeleted` (not in Misskey's signature). `translation` is cast to `Ref<NotesTranslateResponse | null>` for `getNoteMenu`, because the donor's `false` state is not in its type.
10. `os.post` resolves to `void` in Misskey, so the donor's `cancelled` check is dropped. The donor's two `quote()` branches differed only by `channel`, so they are merged into one (`channel` is passed in both cases).
11. `os.contextMenu` needs a `PointerEvent`, so the handler casts `ev`.
12. `boostMenuItems` takes a `Ref`. It is given `ref(appearNote.value)`, which wraps the same note object.
13. `inject('inChannel', null)` becomes `inject(DI.inChannel, null)`.
14. `appearNote` is `getAppearNote(note) ?? note`, as in upstream `use-note.ts`. Its type is `Note & { isRenoted?: boolean; updatedAt?: string | null }`, because those two fields are Sharkey-only and misskey-js does not type them.
15. `$i.rejectQuotes` and `appearNote.user.rejectQuotes` are read through `rejectsQuotes()`, which is untyped. The field is not in misskey-js or the Misskey backend type, so quotes are treated as not rejected.
16. `notes/like` is called through `misskeyApiUntyped`, a cast alias of `misskeyApi`. The request is unchanged from the donor.
17. Keymap `'o'` uses a block body. The donor's expression body caused a TS circularity error with `useTemplateRef('galleryEl')`.
18. Unused donor imports dropped: `extractUrlFromMfm`, `MkUrlPreview`, `Paging`. Unused refs dropped: `rootComp` and `rootEl` (only the Sharkey capture used it), `pollViewer`.
19. Icons (Phosphor to Tabler): `ph-pencil-simple` to `ti-pencil`, `ph-quotes` to `ti-quote`, `ph-heart` to `ti-heart`, `ph-smiley` to `ti-mood-smile`, `ph-play` to `ti-player-play`, `ph-stop` to `ti-player-stop`.
20. Hard-coded English kept from the donor: `title="Edited"` and the `bot` badge text.

## i18n keys replaced (local `skStrings`, no locale edits)

Each key is missing from `locales/en-US.yml` and is listed in `MISSING-STRINGS.md`:
- `quoted`: "Quoted."
- `rmboost`: "Removed renote."
- `noteFooterLabel`: "Note actions"
- `_animatedMFM.play`: "Play"
- `_animatedMFM.stop`: "Stop"
- `_animatedMFM._alert.text`: "Animated MFM may be distracting. Play it anyway?" (provisional English)
- `_animatedMFM._alert.confirm`: "Play"

Keys used that exist in en-US: `loadConversation`, `renotedBy`, `_visibility.*` (including `disableFederation`), `private`, `edited`, `replies`, `renotes`, `_notification._types.quote`, `loadReplies`, `renoted`, `unrenote`, `reactions`, `reactAreYouSure` (`tsx`).

## Prefs used (all present in `preferences/def.ts`, none missing)

`uncollapseCW`, `advancedMfm`, `animatedMfm`, `animation`, `instanceTicker`, `like`, `showReactionsCount`, `showClipButtonInNoteFooter`, `showTranslationButtonInNoteFooter`, `visibilityOnBoost`, `showVisibilitySelectorOnBoost`, `confirmOnReact`, `useReactionPickerForContextMenu`, `autoloadConversation`.

## Endpoints

| Endpoint | Where | In misskey-js |
|---|---|---|
| `notes/children` | `loadReplies` | yes |
| `notes/conversation` | `loadConversation` | yes |
| `notes/renotes` (with and without `quote`) | renotes/quotes tabs, tooltips, quote check | yes |
| `notes/reactions` | reactions tab, likeOnly tooltip | yes |
| `notes/reactions/create` / `delete` | react, undo react, MFM emoji react | yes |
| `notes/create` | renote | yes |
| `notes/unrenote` | undo renote | yes |
| `notes/delete` | delete own renote | yes |
| `notes/translate` | via `translateNote` helper | yes |
| `notes/like` | likeOnly react, like button | NO, called via untyped alias |
| `notes/versions` | not called here; through `getNoteVersionsMenu` (other agent's file) | NO |

## Behavior that depends on absent backend fields or endpoints

- `notes/like` is absent. The like button and likeOnly react will fail on a stock Misskey backend.
- `notes/versions` is absent. The edit-history menu (via `getNoteVersionsMenu`) will fail on a stock backend.
- `updatedAt` is not in Misskey notes. The "Edited" marker and footer line only show if the backend returns it.
- `isRenoted` is not in Misskey notes. The renote button never shows as renoted, and the undo path is only reachable if the backend sends the field.
- `rejectQuotes` is not in Misskey users. The quote button is always shown.
- Reply streaming (donor `onReplyCallback`) is not ported. See deviation 5.

## Not ported

- Sharkey `useNoteCapture` extras: `rootEl`-based visibility subscription, `isDeletedRef`, and the reply callback.
- `addReplyTo` (see deviation 5).

## Shared changes needed

None are required for this file. Suggested for other Sk* components: a shared local type for the Sharkey-only note fields (`isRenoted`, `updatedAt`) and a shared untyped helper for `notes/like`, so each component does not repeat the cast.
