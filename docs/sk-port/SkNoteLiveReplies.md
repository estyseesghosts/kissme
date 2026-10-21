# Live reply append (SkNoteSub / SkNoteDetailed)

- Donor: `use/use-note-capture.ts` (`onReplyCallback`, `onDeleteCallback`, `replied` /
  `updated` stream events), `components/SkNoteSub.vue:182-202` (`addReplyTo`,
  conditional callback wiring), `components/SkNoteDetailed.vue:415-434`
  (unconditional `addReplyTo`); donor `misskey-js` `streaming.types.ts` already
  types `replied` (`{ id, userId }`) and `updated` (`Record<string, never>`).
- Target: `composables/use-note-capture.ts`, `components/SkNoteSub.vue`,
  `components/SkNoteDetailed.vue`, `utility/sk-reply-list.ts`
  (new, with `test/unit/sk-reply-list.test.ts`).

## What was ported

- `useNoteCapture` accepts optional `onReplyCallback` and `onDeleteCallback`
  (both `(… ) => void | Promise<void>`). The existing
  `{ note, parentNote, mock }` signature keeps working; stock callers pass
  neither and behave exactly as before.
- Stream `replied`: fetches the reply via `notes/show` (`body.id`) and calls
  `onReplyCallback`. Stream `updated`: refetches via `notes/show` and patches
  the note in place (`Object.assign`), as the donor does. Stream `deleted`:
  keeps the existing `noteDeleted` global emit and additionally awaits
  `onDeleteCallback`, as the donor does.
- `SkNoteSub` regains `addReplyTo` (unshift + `repliesCount++`) and passes
  `onReplyCallback: addReplyTo` / `onDeleteCallback: props.onDeleteCallback`
  only when `detail && depth < numberOfReplies` (donor condition). The
  `useGlobalEvent('noteDeleted', …)` handler stays so unsubscribed (old or
  polling-mode) notes still drop; `removeReplyFromList` is a no-op for unknown
  ids, so a stream echo after the global delete cannot double-decrement.
- `SkNoteDetailed` regains unconditional `addReplyTo` and passes both
  callbacks (`onReplyCallback: addReplyTo`, `onDeleteCallback: removeReply`;
  the latter is a no-op for the main note id).
- `addReplyTo` / `removeReply` bodies live in `utility/sk-reply-list.ts`
  (`addReplyToList`, `removeReplyFromList`) so the list bookkeeping is unit
  tested; the SFCs keep the donor's async function shapes.

## Adaptations

- **Untyped seam.** misskey-js (stock) `NoteUpdatedEvent` has no `replied` /
  `updated` members, so the handler reads them through
  `noteData as unknown as { type: string; body: { id: string } }` with a comment
  naming the events and telling the reader to remove the cast once misskey-js
  exposes them (the donor needed no cast because Sharkey's misskey-js types
  them). `notes/show` is typed, so no endpoint cast is needed.
- **No `Ref` note.** The donor capture takes `note: Ref` and mutates
  `note.value`; the Misskey composable takes a plain note object, so `updated`
  patches via `Object.assign(note, editedNote)` on the passed object (the
  components pass their live `appearNote` object, so the patch lands).
- **Root-element subscription dropped.** The donor's `rootEl`-based
  `sr` vs `s` selection is not ported; the Misskey `sr` capture call is kept
  unchanged.

## Gaps

- If the backend never emits `replied` / `updated`, nothing breaks: the extra
  block never runs, replies still load via `notes/children`, and deletes still
  propagate via the `noteDeleted` global event. No fake behavior.
- `notes/show` failures (invisible or deleted reply) are swallowed, as in the
  donor.
- No new locale strings were needed.
