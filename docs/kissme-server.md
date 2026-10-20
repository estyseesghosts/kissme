# kissme-server — workstream (b) schedule/edit/versions

Port of Sharkey scheduled-notes + note-edit + note-versions to upstream Misskey.
Donor: `Sharkey/packages/backend/{src/server/api/endpoints/notes/schedule/*.ts,src/server/api/endpoints/notes/{edit,versions}.ts,src/models/NoteSchedule.ts,src/models/NoteEdit.ts,src/core/NoteEditService.ts,src/queue/{types,const,processors/ScheduleNotePostProcessorService}.ts}`.
Base: `de89118a22`. Branch: `jules/kissme-server-b-schedule-edit`.

## 0. Verification answers (donor archaeology)

1. **How donor versions are stored.** Separate table `note_edit` (entity `NoteEdit`,
   bare `@Entity()` → TypeORM 1.x `snakeCase` naming gives table `note_edit`;
   verified against `DefaultNamingStrategy.tableName`). One row per edit, written by
   `NoteEditService.edit()`: it snapshots the pre-edit note (`text`, `newText`, `cw`,
   `newCw`, `fileIds`, `visibility`, `renoteId`, `replyId`, `hasPoll`, `oldDate`,
   `updatedAt`). First edit: `oldDate` = note creation time parsed from the note ID;
   later edits: `oldDate` = previous `note.updatedAt`. Read path:
   `notes/versions` → `GetterService.getEdits(noteId)` → `noteEditsRepository.findBy({ noteId })`,
   sorted by `oldDate` desc, shaped as `{ oldDate, updatedAt, text }`.
2. **Queue/processor wiring for scheduleNotePost.** Bull queue name `scheduleNotePost`
   (`QUEUE_TYPES` entry in donor `queue/const.ts`); job data `{ scheduleNoteId }`;
   jobId `schedNote_<scheduleNoteId>` (+ legacy `schedNote:<id>` removed for compat);
   `delay = scheduledAt - now`, `removeOnComplete: true`. Processor
   `ScheduleNotePostProcessorService.process()` resolves reply/renote/channel/files,
   calls `noteCreateService.create()`, deletes the schedule row, notifies
   `scheduledNotePosted` / `scheduledNoteFailed`. Wired via DI token
   `'queue:scheduleNotePost'` (donor `QueueModule` equivalent) and a worker in donor
   `QueueProcessorService`. Coexists with upstream's separate `postScheduledNote`
   queue (which serves `note_draft`-based scheduling); the two systems are independent.
3. **Donor `MiNote` columns.** Donor `MiNote` HAS `updatedAt: Date | null` and
   `mandatoryCW: string | null`. Upstream `MiNote` (`packages/backend/src/models/Note.ts`)
   has NEITHER (verified). **Not added here** — owned by workstreams (e)/(f)
   (entity columns). `NoteEditService` is ported as-is with minimal type-relaxation
   casts at the three touch points, each marked `TODO(workstreams-e/f)`.

## 1. Contract

### Endpoints (5)

| Endpoint | cred | kind (OAuth scope) | limit | res shape |
|---|---|---|---|---|
| `notes/schedule/create` | required | `write:notes-schedule` (NEW permission) | 1h / 300 | none (returns `''`, donor-exact) |
| `notes/schedule/delete` | required | `write:notes-schedule` | 1h / 300 | none |
| `notes/schedule/list` | required | `read:notes-schedule` (NEW permission) | 1h / 300 | array of `{ id, note: { createdAt, text, cw, fileIds, visibility, visibleUsers: UserLite[], user: User, reactionAcceptance, isSchedule } (+ packed renote/reply/files/poll), userId, scheduledAt }` |
| `notes/edit` | required | `write:notes` | 1h / 300 + 500ms floor (donor token-bucket approximated; bucket unsupported upstream) | `{ createdNote: Note }` |
| `notes/versions` | none | — | 5s / 10 | array of `{ oldDate: string, updatedAt: string, text: string \| null }` |

Params: donor `paramDef` shapes verbatim (schedule create keeps `scheduleNote: { scheduledAt }`
required + `anyOf` text/renoteId/fileIds/mediaIds/poll; edit keeps `editId` + note fields;
versions keeps `noteId`). All `meta`/`paramDef`/`res` English-only, `as const`.

Error-ID policy: donor UUIDs reused verbatim after collision-grep against
`packages/backend/src/server/api/endpoints/` (no collisions found); no new UUIDs needed.

### Queue

- Name: `scheduleNotePost`. Job: `{ scheduleNoteId: string }` (`ScheduleNotePostJobData`).
- Enqueue: jobId `schedNote_<id>`, `delay = scheduledAt - Date.now()`, `removeOnComplete: true`.
- Delete path removes both `schedNote_<id>` and legacy `schedNote:<id>` (compat with pre-2025.4 rows).
- Wiring: `QUEUE.SCHEDULE_NOTE_POST` (`queue/const.ts`), `ScheduleNotePostQueue` type +
  `'queue:scheduleNotePost'` provider (`core/QueueModule.ts`), public field on
  `QueueService`, worker + start/stop in `queue/QueueProcessorService.ts`,
  `ScheduleNotePostProcessorService` in `queue/processors/` + `QueueProcessorModule.ts`.

### Storage (new tables only — never edit merged migrations)

- `note_schedule`: `id` varchar(32) PK, `note` jsonb NOT NULL (`MiScheduleNoteType`),
  `userId` varchar(260) NOT NULL + index, `scheduledAt` timestamptz NOT NULL.
- `note_edit`: `id` varchar(32) PK, `noteId` varchar(32) NOT NULL + index + FK→`note(id)`
  CASCADE, `userId` varchar(32) NOT NULL + FK→`user(id)` CASCADE, `renoteId`/`replyId`
  nullable + FKs→`note(id)` CASCADE, `visibility` enum NOT NULL, `newText`/`text`/`cw`/`newCw`
  text nullable, `fileIds` varchar(32)[] NOT NULL DEFAULT `'{}'`, `updatedAt` timestamptz
  NOT NULL, `oldDate` timestamptz nullable, `hasPoll` bool NOT NULL DEFAULT false.
- One fresh timestamped migration file per table (`up` + `down`, SPDX header,
  `PascalCaseName<13-digit-ms>` class/`name` match). Entity↔migration sync verified with
  `pnpm --filter backend check-migrations`.

### Supporting additions (additive, no DDL, no entity-column edits)

- Permissions: `read:notes-schedule`, `write:notes-schedule` in `packages/misskey-js/src/consts.ts`
  (required: endpoint `kind` type-checks against misskey-js `permissions`).
- Policy mapping: donor `scheduleNoteMax` error kept, threshold read from upstream
  `scheduledNoteLimit` policy (default 1). No new role policy added.
- Notification types (additive, stream+pack only, no table): `edited`
  `{ notifierId, noteId }` and `scheduledNoteFailed` `{ reason }` in
  `models/Notification.ts`, `types.ts:notificationTypes`, `models/json-schema/notification.ts`,
  `NotificationEntityService` (`NOTE_REQUIRED_NOTIFICATION_TYPES` += `edited`;
  pack case for `scheduledNoteFailed.reason`), `MainEventTypes.edited`,
  `packages/misskey-js/src/consts.ts:notificationTypes`.
- `GetterService.getEdits(noteId)` (+ `noteEditsRepository` injection).
- `NoteCreateService.extractMentionedUsers`: `private` → `public` (reused by `NoteEditService`).

## 2. Upstream adaptations (donor → this tree)

- `isPureRenote(x)` → `isRenote(x) && !isQuote(x)` (no `isPureRenote` upstream).
- `TimeService.now/date` → `Date.now()` / `new Date()` (no `TimeService` upstream).
- `userService.markUserActive(me, true)` → `userService.updateLastActiveDate(me)`.
- `noteVisibilityService.checkNoteVisibilityAsync` → `noteEntityService.isVisibleForMe`.
- `checkQuotePermissions` OMITTED — quote-permission feature absent upstream; the
  `quoteDisabledForUser` error mapping in `notes/edit` is kept (currently untriggerable).
- `queueService.createPostNoteJob` / backgroundTask queue absent upstream → `NoteEditService.edit()`
  calls `postNoteEdited()` directly after re-fetch (same-process, documented).
- `cacheService.threadMutingsCache` / `getUserRelation` / `userListMembershipsCache` /
  `findUsersById` absent → repository calls mirroring upstream `NoteCreateService`
  (`noteThreadMutingsRepository.exists`, `userProfilesRepository.findBy`,
  `userListMembershipsRepository.find`, `usersRepository.findOneByOrFail`).
- `collapsedQueueService` / `LatestNoteService` absent → instance/user count-queue updates
  omitted (TODO in code); `instanceChart.updateNote` kept behind existing meta flags.
- `user.noindex` absent on upstream `MiUser` → search index called unconditionally
  (mirrors upstream `create()`).
- `processErrors` field dropped from ported `Option` (upstream `MiNote` has no such
  column; the `notes/edit` endpoint never sends it).
- `mandatoryCW` / `note.updatedAt` (missing upstream columns): casts + `TODO(workstreams-e/f)`.
- Schedule processor posts via upstream `NoteCreateService.fetchAndCreate` (ID-based params)
  instead of donor `create()` (object params); `visibleUsers: MinimumUser[]` → ID array.

## 3. Deliberately NOT implemented

- Frontend (web UI for schedule/edit/versions), locales/i18n strings.
- `MiNote.updatedAt` / `MiNote.mandatoryCW` columns + their migrations (workstreams e/f).
- Quote-permission checks (`checkQuotePermissions`, `quoteDisabledForUser` trigger).
- `postScheduledNote` (draft-based) changes — untouched; both schedulers coexist.
- Webhook event type `edited` (donor `WebhookTestService` only; no runtime use in ported flow).
- `AccountMoveService` / `DeleteAccountProcessorService` schedule cleanup (donor deletes
  `note_schedule` rows on account move/delete) — upstream equivalents untouched; orphaned
  schedule rows for deleted users are skipped at fire time by the processor (user lookup fails
  → row removed). Follow-up workstream may add cleanup.

## 4. E2E

Needs `.config/test.yml` (copy from `.github/misskey/test.yml`; NOT committed).
`notes/schedule` create→list→delete roundtrip; `notes/edit` returns `createdNote`;
`notes/versions` lists the pre-edit snapshot. Honest PASS/FAIL/SKIPPED reported per commit.
