# MkSchedulePostListDialog.vue (+ utility/sk-schedule-api.ts)

- Donor: `/Users/terezi/Local Documents/fedifedifedi/Sharkey/packages/frontend/src/components/MkSchedulePostListDialog.vue`
- Target: `components/MkSchedulePostListDialog.vue`, `utility/sk-schedule-api.ts`

Modal listing scheduled notes via `notes/schedule/list` (offset paging), each as a `SkNoteSimple` with edit/delete; the list reloads after an edit.

## Changes from the donor
- `SkPagination` (Sharkey paging model, see SkPagination.md) and `SkNoteSimple` (which now carries the schedule actions; donor put them in `MkNoteSimple`). Dropped the donor's meaningless `:scheduled="true"` attr.
- `i18n.ts.schedulePostList` is not in en-US.yml -> `skStrings.schedulePostList`.
- `SkNoteSimple.vue` (upstream-coexisting, Sharkey-only file) gained the donor's edit/delete buttons for `note.isSchedule`: delete = confirm + `notes/schedule/delete`; edit = delete, then `os.post({ initialNote, renote, reply, channel })`.
- `utility/sk-schedule-api.ts` wraps `notes/schedule/create|delete|list` through untyped aliases (tested with mocked API: `test/unit/sk-schedule-api.test.ts`).

## Gap
`notes/schedule/*` do not exist in misskey-js or a stock Misskey backend. Implemented as the donor does; **implemented, unverified against a backend**. (Upstream Misskey has its own draft-based scheduling; the two coexist, see MkPostForm.md.)
