# kissme-server — workstream (f) timelines + packed

Ports Sharkey bubble timeline, following feed, note search filters, and packed
entity fields. Donor: Sharkey (`endpoints/notes/*`, `core/entities/*`,
`core/SearchService.ts`, `stream/channels/bubble-timeline.ts`).

## API contracts

### `notes/bubble-timeline` (new)

- Auth: not required (`requireCredential` unset). Rate limit: 10 calls / 5s.
- Gate: `RoleService` policy `btlAvailable` (default `false`); otherwise error
  `BTL_DISABLED` (`0332fc13-6ab2-4427-ae80-a9fadffd1a6c`).
- Params: `withFiles` (default false), `withBots` (default true),
  `withRenotes` (default true), `limit` 1–100 (default 10),
  `sinceId` / `untilId` / `sinceDate` / `untilDate` (pagination).
- Filter: `visibility = public`, `channelId IS NULL`, `userHost IS NOT NULL`,
  joined against `instance` rows with `isBubbled = true`
  (`meta.bubbleInstances` suffix match via `UtilityService.isBubbledHost`),
  plus the shared base note filtering (blocks, mutes, suspended hosts) and
  the visitor UGC-visibility rule for anonymous callers.
- Response: `Note[]`.

### `notes/following` (new)

- Auth: required (`read:account`), `allowGet: true`. Rate limit: 10 calls / 5s.
- Params: `list` enum `following` (default) / `followers` / `mutuals`;
  `filesOnly` (default false), `includeNonPublic` (default false),
  `includeReplies` (default false), `includeQuotes` (default false),
  `includeBots` (default true); `limit` 1–100 (default 10);
  `sinceId` / `untilId` / `sinceDate` / `untilDate`.
- Errors: `BOTH_INCLUDE_REPLIES_AND_FILES_ONLY`
  (`91c8cb9f-36ed-46e7-9ca2-7df96ed6e222`) when `includeReplies && filesOnly`;
  `BOTH_LIST_FOLLOWERS_AND_INCLUDE_NON_PUBLIC`
  (`7a1b9cb6-235b-4e58-9c00-32c1796f502c`) when `list = followers &&
  includeNonPublic`.
- Implementation: joins the per-user latest-note table (`SkLatestNote`,
  one row per user × {public, reply, quote}), selecting `MAX(note_id)` per
  user, then applies visibility / block / mute filtering and pagination.
- Response: `Note[]`.
- Deviation from donor: the silenced-user/silenced-instance filter is not
  applied (this tree has no `User.isSilenced`-column-driven query helper and
  no `Instance.isSilenced` column); anonymous-visitor handling follows the
  `notes/global-timeline` precedent.

### `notes/search` (extended)

- New params: `filetype` (nullable enum `fileTypeCategories` =
  `image | video | audio | module | flash | null`, kept in sync with
  `SearchService.fileTypes` MIME map) and `order` (string, meilisearch sort
  direction, default `desc`).
- Both are threaded into `SearchService.searchNote` opts: SQL providers filter
  `note.attachedFileTypes && :types`; meilisearch adds an OR filter on
  `attachedFileTypes` and `sort: createdAt:<order>`.
- `attachedFileTypes` added to the meilisearch index settings
  (`filterableAttributes`) and indexed documents.

### Stream channel `bubbleTimeline` (new)

- Registered in `Connection.getChannelConstructor` (this tree routes channels
  there; there is no `ChannelsService`).
- Anonymous allowed (`requireCredential = false`); gated on `btlAvailable`.
- Params: `withRenotes` (default true), `withFiles` (default false),
  `withBots` (default true).
- Per-note filter: `channelId == null`, `visibility = public`,
  `isBubbledHost(note.user.host)`, file/bot/renote prefs, mute/block check,
  `NoteStreamingHidingService` filter (mirrors `globalTimeline`).

### `RolePolicies.btlAvailable`

- New boolean policy, default `false`, aggregated with `some(v => v === true)`.
  Exposed in `packedRolePoliciesSchema`. `notes/global-timeline` precedent
  (`gtlAvailable`) followed for gating.

## Packed-field contract

| Entity | Field | Type | Semantics |
| --- | --- | --- | --- |
| Note | `threadId` | string (id) | `note.threadId ?? note.id`; the conversation root. |
| Note | `updatedAt` | date-time, optional | `note.updatedAt`; absent when never edited. |
| Note | `mandatoryCW` | string \| null, optional | Forced CW for this note. **Depends on workstream E** (`Note.mandatoryCW` column); currently reads the property defensively with `TODO(workstream E)` and yields `null` until the column lands. |
| Note | `isMutingThread` | boolean | Viewer mutes the note's thread (`threadId ∈` viewer's thread mutes). |
| Note | `isMutingNote` | boolean | Viewer mutes this exact note. **Depends on workstream C** (`NoteThreadMuting.isPostMute`); currently always `false`, marked `TODO(workstream C)`. |
| Note | `isFavorited` | boolean | Viewer favorited the note (batched via `noteFavoritesRepository` in `packMany`, `existsBy` in `pack`). Anonymous → `false`. |
| Note | `isRenoted` | boolean | Viewer pure-renoted the note (batched in `packMany`, `getExists` in `pack`). Anonymous → `false`. |
| Note | `bypassSilence` | boolean | `true` when the viewer authored the note, the viewer follows the author, or an ancestor note in the pack already bypasses (self-reply/self-renote propagate the outer value). |
| Note | `processErrors` | string[], optional, detail only | Non-fatal processing errors (translation key or raw string). |
| UserLite | `mandatoryCW` | string \| null | Forced CW for all notes by this user. **Depends on workstream E** (`User.mandatoryCW`); `TODO(workstream E)`, `null` until then. |
| UserLite | `rejectQuotes` | boolean, optional | Quotes of this user's notes are downgraded. **Depends on workstream E** (`User.rejectQuotes`); `TODO(workstream E)`, `false` until then. |
| UserLite | `bypassSilence` | boolean | `isMe \|\| relation.isFollowing`. Relations are now fetched for Lite packs too (batched in `packMany`). |
| UserLite.instance | `mandatoryCW` | string \| null | Instance-wide forced CW (`Instance.mandatoryCW`). |
| FederationInstance | `isBubbled` | boolean | `UtilityService.isBubbledHost(host)` (suffix match against `meta.bubbleInstances`). |
| FederationInstance | `rejectQuotes` | boolean | `Instance.rejectQuotes`: quotes from this instance are downgraded with a process error. |
| FederationInstance | `mandatoryCW` | string \| null | `Instance.mandatoryCW`. |

## Owned schema (this workstream)

- `Instance.isBubbled` / `Instance.mandatoryCW` / `Instance.rejectQuotes`
- `Note.updatedAt` / `Note.processErrors`
- `Meta.bubbleInstances` (`varchar(256)[]`, default `'{}'`)
- `RolePolicies.btlAvailable` (+ `packedRolePoliciesSchema`)
- `SkLatestNote` table (`latest_note`, PK `(user_id, is_public, is_reply, is_quote)`,
  FKs `FK_20e346fffe4a2174585005d6d80` → `user`, `FK_47a38b1c13de6ce4e5090fb1acd` → `note`)
- `bubbleTimeline` channel + endpoint registrations

Not owned here (referenced only): `User.mandatoryCW` / `User.rejectQuotes` /
`Note.mandatoryCW` (E), `NoteThreadMuting.isPostMute` (C), access-token columns (D).

## Refresh pipeline (`SkLatestNote`)

Donor drives updates through a background-task queue. This tree has no
background-task queue, so `LatestNoteService` runs synchronously:

- `NoteCreateService.postNoteCreated` → `handleCreatedNote(note)` (fire-and-forget)
- `NoteDeleteService.delete` → `handleDeletedNote(note)` (fire-and-forget,
  recomputes the newest remaining note for the key when the latest is deleted)
- `DeleteAccountProcessorService` → deletes the user's `latest_note` rows
- `handleUpdatedNote(before, after)` is implemented for API parity (delete +
  create when the compound key changes); no edit service exists in this tree
  yet, so it currently has no callers.
