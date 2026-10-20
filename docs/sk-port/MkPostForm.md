# MkPostForm.vue — Sharkey composer options (slice 3.2)

- Donor: `Sharkey/packages/frontend/src/components/MkPostForm.vue`
- Target: `packages/frontend/src/components/MkPostForm.vue` (upstream file, edited additively) + `utility/sk-post-form.ts`, `utility/sk-schedule-api.ts`

Approach: **gated blocks in the stock file**, not a fork. Upstream keeps everything it has (`serverDraftId`/`canSaveAsServerDraft`, the tour/`showHowToUse`, `useUploader`, drafts and upstream `scheduledAt`). Sharkey behavior is behind the pref **`useSharkeyPostForm`** (default `false`), read as `sk` in the component. With the pref off, the only differences from stock are two `:disabled` bindings that depend on the new optional `editId` prop (unset = unchanged) and `globalEvents.emit('notePosted')` being skipped when a response has no `createdNote` (stock `notes/create` always has one).

## Item by item
| Plan item | Where | Gate |
|---|---|---|
| `scheduleNote` + editor | `MkScheduleEditor` shown under the poll editor; menu entries "Schedule note" / "Scheduled notes" (opens `MkSchedulePostListDialog`) when `policies.scheduleNoteMax > 0`; post sends `notes/schedule/create` | `sk` |
| coexistence with upstream scheduling | upstream's `scheduledAt` (draft-based, `scheduledNoteLimit`) is untouched; setting one clears the other | always |
| `editId` | new optional prop; disables visibility and localOnly buttons; post sends `notes/edit`; poll-change confirm uses `initialPoll` | prop-driven (post path `sk`) |
| `reply`/`channel` renames | **No change needed.** Upstream `PostFormProps` already uses `reply`/`renote`/`channel`/`initialNote` like the donor; only the internal refs differ (`replyTargetNote`, `targetChannel`) | n/a |
| `hideFiles`/`skipMute` previews | reply/renote targets render `SkNoteSimple` with `hideFiles` + `skipMute` | `sk` |
| `pushMention`/`getMissingMentions` | `getMissingMentions` (case-insensitive, punycode host compare) drives the not-specified-mentions banner and "add"; mention picker skips yourself and syncs the text model. Pure parts in `sk-post-form.ts` (`getMissingMentions`, `addMentionToText`, `isSelfMention`), tested. Reply/mention prefill text is left as upstream builds it. | `sk` |
| `initialPoll` | tracks the poll loaded from `initialNote` when `editId` is set | `editId` |
| `reactionAcceptance` header toggle | header button with Tabler icons (`ti-heart`, `ti-heart-plus`, `ti-mood-smile`); same `toggleReactionAcceptance` dialog as upstream's menu entry, which stays | `sk` |
| `selectFiles`/`uploadFile` path | one footer attach button using upstream `selectFile({ multiple: true })` (upload / drive / URL menu) replaces the two stock buttons; the stock buttons and `useUploader` path stay | `sk` |
| attaches | `SkPostFormAttaches` with `@replaceFile` (see SkPostFormAttaches.md) | `sk` |
| scheduled `initialNote` | `isSchedule` notes re-open with their schedule (SkNoteSimple's edit flow) | `sk` |

## Strings
`confirmPollEditTitle` / `confirmPollEditText` (donor `_confirmPollEdit` wording), `postOn`, `schedulePostList` live in the trailing Sharkey locale section of both locale files (`i18n.ts`; `sk-strings.ts` deleted).

## Gaps
- `notes/schedule/create`, `notes/edit`: absent from misskey-js and a stock backend. Implemented as the donor, **unverified**.
- `policies.scheduleNoteMax` is read through a cast (not in the misskey-js `Role policies` type).
- Drafts (`saveDraft`) do not persist Sharkey's `scheduleNote`; upstream's draft record has no field for it.
- Not exercised in a browser, and the pref's default-off path was not smoke-tested live either.
