> Note: Sharkey UI strings are now centralized in `packages/frontend/src/utility/sk-strings.ts` (see README.md and MISSING-STRINGS.md). Any `skStrings` table mentioned below refers to that module.

# SkNoteSub.vue

- Donor: `/Users/terezi/Local Documents/fedifedifedi/Sharkey/packages/frontend/src/components/SkNoteSub.vue`
- Target: `/Users/terezi/Local Documents/misskey/packages/frontend/src/components/SkNoteSub.vue`

## Ported as-is

- SPDX header, template layout, and the full `<style>` block, including the classes listed in the brief (avatarContainer, content, detailed, footer, isReply, line, noteFooterButton, noteFooterButtonCount, reacted, single, threadLine).
- Self-recursion: `import SkNoteSub from '@/components/SkNoteSub.vue'` added explicitly.
- `SkMutedNote` with `mutedClass`, `expandedClass`, and `expandMute` threading.
- `expandMute` and `skipMute` threading via `SkMutedNote`.
- Reply, renote, quote, react, like, undo-react, undo-renote, boost-visibility, clip, menu, translate, and the `notes/children` load for detail mode.
- `setupNoteViewInterruptors(note, isDeleted)`, `deepClone`, `pleaseLogin`, `showMovedDialog`, `reactionPicker`, `claimAchievement`, `getNoteMenu`, `getNoteClipMenu`, `translateNote`, `boostMenuItems`, `computeRenoteTooltip`.

## Deviations

- **Imports.** `@/use/use-note-capture.js` became `@/composables/use-note-capture.js`. `translateNote` now comes from `@/utility/translate-note.js`, and `getNoteMenu` / `getNoteClipMenu` from `@/utility/get-note-menu.js`. `@/instance` became `@/instance.js`. `@/utility/get-appear-note` gained `.js`. `userPage` was imported but unused, so it was dropped.
- **`useNoteCapture`.** The Misskey composable has a different API: `{ note, parentNote, mock }` and it returns `{ $note, subscribe }`. Live reactions now come from `$note`. Template and handler reads of `note.myReaction` became `$note.myReaction`. The `rootEl`, `isDeletedRef`, `onReplyCallback`, and `onDeleteCallback` options don't exist in the target.
- **Delete handling.** Replaced with `useGlobalEvent('noteDeleted', ...)` from `@/events.js`, which sets `isDeleted`. It still calls `props.onDeleteCallback` under the same condition the donor used (`detail && depth < numberOfReplies`), so parent threads still drop deleted replies.
- **Live reply append** (Sharkey's `onReplyCallback`, which pushed new replies into `replies`) is not ported. The target composable exposes no reply event. Replies still load on mount via `notes/children`.
- **`appearNote` typing.** `getAppearNote` returns `Note | null` in the target. Now `getAppearNote(note) ?? note`, typed as `Note & { isRenoted?: boolean }`, because `isRenoted` is a Sharkey field the Misskey `Note` entity does not declare.
- **`rejectQuotes`.** `$i?.rejectQuotes` is not declared on the target `MeDetailed`. Read via `Reflect.get($i ?? {}, 'rejectQuotes') === true`.
- **`notes/like`.** Not in misskey-js, so `misskeyApi` is cast to an untyped `sharkeyApi` wrapper used only for `notes/like` (in `react()` for `likeOnly` and in `like()`). The call and its `override` payload are the donor's.
- **`reply()`.** The `viaKeyboard` argument and `animation` option were dropped. `PostFormProps` has no `animation`.
- **`quote()`.** The target `os.post()` resolves to `void` and does not report cancellation. The donor's `if (cancelled) return;` was removed, so the renotes check runs after every post attempt. It only toasts when a quote exists, so the visible behaviour is unchanged.
- **`getNoteMenu` / `getNoteClipMenu`.** The target has no `isDeleted` parameter, so the donor's `isDeleted` argument was dropped. `translation` is typed `Ref<NotesTranslateResponse | null>` (the target `getNoteMenu` requires this, and `translateNote` still accepts it).
- **`MkReactionsViewer`.** The donor's `:note="note"` became explicit props: `:reactions`, `:reactionEmojis`, `:myReaction` from `$note`, and `:noteId`. The target viewer takes these props.
- **`MkSubNoteContent`.** Donor passes `translating`, `translation`, `expandAllCws`. The target component only declares `note`, so these fall through and do nothing. Translation output is therefore not shown in the sub-note body yet.
- **Icons.** Phosphor to Tabler: `ph-arrow-u-up-left` to `ti-arrow-back-up`, `ph-rocket-launch` to `ti-rocket`, `ph-quotes` to `ti-quote`, `ph-prohibit` to `ti-ban`, `ph-heart` to `ti-heart`, `ph-smiley` to `ti-mood-smile`, `ph-minus` to `ti-minus`, `ph-dots-three` to `ti-dots`. `ph-bold ph-lg` classes dropped. Existing `ti-paperclip`, `ti-language-hiragana`, and `ti-chevron-double-right` kept.
- **Translation ref type.** `ref<NotesTranslateResponse | false | null>` changed to `ref<NotesTranslateResponse | null>`, matching the target `getNoteMenu` parameter type.

## i18n keys replaced with local strings

These keys are absent from `locales/en-US.yml`. Each is in a local `skStrings` const with a comment pointing at MISSING-STRINGS.md.

- `noteFooterLabel` replaced with `'Note actions'`
- `rmboost` replaced with `'Removed boost.'`
- `quoted` replaced with `'Quoted.'`

Keys used and present in target: `continueThread`, `renoted`, `reactAreYouSure` (tsx), and the `ts` keys used by `getNoteMenu`.

## Prefs used

All present in `preferences/def.ts`. None missing.

- `uncollapseCW`
- `numberOfReplies`
- `like`
- `confirmOnReact`
- `showVisibilitySelectorOnBoost`
- `visibilityOnBoost`
- `showClipButtonInNoteFooter`
- `showTranslationButtonInNoteFooter`

## Endpoints called

| Endpoint | In misskey-js |
|---|---|
| `notes/children` | yes |
| `notes/renotes` | yes |
| `notes/unrenote` | yes |
| `notes/create` | yes |
| `notes/reactions/create` | yes |
| `notes/reactions/delete` | yes |
| `notes/like` | **no**, kept as donor, untyped via `sharkeyApi`. Backend endpoint not verified. |

## Not ported

- Live reply append (see Deviations).
- Translation output inside the sub-note body (see Deviations; needs `MkSubNoteContent` props).
- `ref="rootComp"` has no matching `const` in script. Kept as donor, it is a no-op.
- `ref="clipButton"` resolves via `useTemplateRef`. The `el` ref is never bound in the template, so `focus()` is a no-op. Kept as donor.

## Shared changes needed

- `composables/use-note-capture.ts`: accept `onReplyCallback` / `onDeleteCallback` (or emit a reply event) so live replies can be appended in threads.
- `MkSubNoteContent.vue`: accept `translating`, `translation`, `expandAllCws` (and `hideFiles` for SkNoteSimple).
- misskey-js: `notes/like` endpoint (Sharkey-only), `MeDetailed.rejectQuotes`, `Note.isRenoted`.
