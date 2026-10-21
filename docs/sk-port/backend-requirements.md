/*
 * SPDX-FileCopyrightText: syuilo and other misskey contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

# Backend requirements for the five Gap fixes

What a hypothetical backend must implement for each Gap 1–5 fix to function.
Backend-agnostic: endpoint names, methods, params, response shapes, and entity
fields any backend would need — no assumptions about a specific backend
implementation. Example IDs are Misskey-format opaque strings. Unless noted,
write endpoints require authentication (same convention as the surrounding
`notes/*` API); read endpoints behave like their `notes/*` neighbours.

Conventions: `POST /api/<endpoint>` with a JSON object body, mutex with the
rest of the Misskey API. `UNKNOWN_API_ENDPOINT` / `CREDENTIAL_REQUIRED` below
refer to the standard Misskey API error envelopes.

## Gap 1 — Live reply append (`SkNoteLiveReplies.md`)

### (1) What changed in the frontend and why

Upstream `composables/use-note-capture.ts` only handled reactions / poll
votes / deletes, so open threads never grew live replies. The composable was
extended **additively** (existing `{ note, parentNote, mock }` callers
unchanged) with optional `onReplyCallback` / `onDeleteCallback`.
`SkNoteSub.vue` regained the donor's `addReplyTo` (prepend + `repliesCount++`,
gated by `detail && depth < numberOfReplies`) and `SkNoteDetailed.vue` regained
its unconditional variant; shared list math lives in
`utility/sk-reply-list.ts` (unit-tested). Stream handling: on a `replied`
event the frontend fetches `notes/show` for `body.id` and passes the note to
the callback (visibility-gated, failures swallowed); on `updated` it refetches
`notes/show` and patches the note in place. Both event branches go through
`as unknown as` casts because `misskey-js` `NoteUpdatedEvent` has no
`replied` / `updated` members (comment in code names them; remove the casts
once misskey-js exposes them). One-shot loading via `notes/children` and
delete propagation via the `noteDeleted` global event are unchanged.

### (2) What the backend must implement

Without this, the new branches never run and threads behave exactly as
before (polling-free one-shot load, no errors) — the feature is inert, not
broken.

- **Emit `replied` on the parent note's note stream when a reply is created.**
  Channel: `noteStream:{parentNoteId}` (the existing per-note subscribe
  channel, same one the `s` / `sr` subscribe messages target). Event name:
  `noteUpdated`. Payload:

  ```json
  { "id": "<parentNoteId>", "type": "replied", "body": { "id": "<newReplyId>", "userId": "<replyAuthorId>" } }
  ```

- **Emit `updated` on the note's own note stream when a note is edited.**
  Channel: `noteStream:{noteId}`, event `noteUpdated`, payload:

  ```json
  { "id": "<noteId>", "type": "updated", "body": {} }
  ```

- **`notes/show` must return the reply** to a viewer entitled to see it
  (standard visibility rules; the frontend tolerates rejection).
- **`notes/children`** (stock Misskey pagination) is unchanged — no new
  contract.
- **misskey-js**: add the two members to the `NoteUpdatedEvent` union:

  ```ts
  | { type: 'updated'; body: Record<string, never>; }
  | { type: 'replied'; body: { id: Note['id']; userId: User['id']; }; }
  ```

## Gap 2 — Single-note mute menu (`sk-note-mute.md`)

### (1) What changed in the frontend and why

The port shipped only thread-mute items because `appearNote.isMutingNote`
does not exist upstream. `utility/get-note-menu.ts` gained an additive
`toggleNoteMute()` that calls `notes/thread-muting/create|delete` with
`{ noteId, noteOnly: true }` through an untyped alias (upstream misskey-js
types `{ noteId }` only; comment says to remove the cast once misskey-js
exposes `noteOnly`), plus `muteNote` / `unmuteNote` items driven by
cast-read `appearNote.isMutingNote ?? false`. Without the field the mute
action is still offered and reports the backend error via `apiWithDialog`
(honest, never faked). The hide-notes read side was already staged in
`utility/sk-check-mute.ts`.

### (2) What the backend must implement

- **`notes/thread-muting/create` and `notes/thread-muting/delete` accept an
  optional `noteOnly: boolean` (default `false`).** `POST /api/notes/thread-muting/create`:

  ```json
  { "noteId": "<noteId>", "noteOnly": true }
  ```

  Semantics: `noteOnly: false` (or omitted) mutes the whole thread rooted at
  `note.threadId ?? note.id` (existing behavior); `noteOnly: true` mutes
  only `note.id` and records the muting as a single-note (post) mute.
  `delete` mirrors this with the same params. Errors: standard
  `NO_SUCH_NOTE` for unknown notes.
- **Pack per-viewer muting state on Note.** `Note` gains:

  ```json
  { "threadId": "<rootNoteId>" | null, "isMutingThread": false, "isMutingNote": true }
  ```

  `threadId` is the thread root (`threadId ?? id`); the two flags reflect the
  requesting user's thread-mutings / note-mutings sets (false for
  logged-out viewers).
- **`notes/state`** (already used for the thread item) may additionally
  return `isMutedNote`; the frontend currently reads the thread flag from it
  and the note flag from the packed note.
- **misskey-js**: add `noteOnly?: boolean` to the thread-muting request
  types; add `threadId`, `isMutingThread`, `isMutingNote` to `Note`
  (and `isMutedNote` to the `notes/state` response type if the backend
  provides it).

## Gap 3 — File-type search filter (`search-filetype.md`)

### (1) What changed in the frontend and why

The port's `pages/search.note.vue` had no file-type dropdown. Restored
additively against the donor: an `MkSelect` bound to `filetype`
(`null | 'image' | 'video' | 'audio' | 'module' | 'flash'`), labels under
`_noteSearch.fileType` / `_noteSearch._fileType.*`, merged into both
`notes/search` paginator constructions via `buildFiletypeParams()` from the
new tested `utility/sk-note-search-params.ts` (`null` omits the key). The
param name is lowercase **`filetype`** (donor spelling) and rides an
untyped cast since misskey-js has no such field (comment in code). Backends
that reject the unknown field surface the paginator's error state; the
frontend never filters client-side.

### (2) What the backend must implement

- **`notes/search` accepts `filetype` (nullable enum) and `order`.**
  `POST /api/notes/search`:

  ```json
  { "query": "sunset", "limit": 10, "filetype": "image", "order": "desc" }
  ```

  `filetype` is one of `'image' | 'video' | 'audio' | 'module' | 'flash' |
  null`; `null`/omitted means no filter. Response shape is unchanged
  (array of packed `Note`).
- **Track attached file types on Note.** Each note stores the MIME types of
  its attachments (e.g. `attachedFileTypes: string[]`), populated at
  upload/attach time. The six labels map to MIME categories, for example:
  `image` (jpeg/png/gif/webp/avif/svg), `video` (mp4/webm/…), `audio`
  (mp3/ogg/flac/…), `module` (tracker formats: xm/mod/s3m/it/mptm/…),
  `flash` (`application/x-shockwave-flash`, `application/vnd.adobe.flash.movie`).
  The exact table is the backend's choice; it must cover all six labels.
- **Filter search on those types** in both search paths (full-text/SQL and
  the Meilisearch-style index path), combined with the existing
  query/host/user/channel/range filters.
- **misskey-js**: add `filetype?: 'image' | 'video' | 'audio' | 'module' |
  'flash' | null` (and `order?: string`) to the `notes/search` request type.
  Without this the frontend cast stays and the filter errors honestly.

## Gap 4 — Bubble timeline UI (`bubble-timeline.md`)

### (1) What changed in the frontend and why

The query builder (`utility/sk-timeline-query.ts`) existed only as a spec.
It was restored (`buildTimelineQuery` / `buildTimelineChannel`, unit-tested
for all 11 sources) and given exactly one additive consumer surface instead
of a second renderer: `'bubble'` joined `basicTimelineTypes` with a Tabler
icon, gated by a tolerant cast-read of the Sharkey-only `btlAvailable`
policy (`$i.policies`, else instance policies; hidden when falsy — no dead
UI); `tl.src` accepts `'bubble'`; `MkStreamingNotesTimeline` routes bubble
through the builder for both the paginator and the stream channel (other
timelines' requests byte-identical); the timeline page and deck column list
bubble (the widget inherits via `availableBasicTimelines()`). Unknown
endpoints render the standard `MkError` + retry state.

### (2) What the backend must implement

- **`POST /api/notes/bubble-timeline`** (no credential required, like the
  other public timelines). Params (all optional except pagination
  behaviour):

  ```json
  { "withFiles": false, "withBots": true, "withRenotes": true, "limit": 10, "sinceId": "<id>", "untilId": "<id>" }
  ```

  (`sinceDate` / `untilDate` integers likewise accepted.) Returns an array
  of packed `Note`: public (`visibility = 'public'`), remote-only notes
  (`userHost IS NOT NULL`) from instances flagged as bubble members (see
  below), `channelId IS NULL`, with the standard exclusions (blocked hosts,
  suspended/silenced/muted users, muted/blocked-user renotes, muted threads
  when logged in). Response errors: `BTL_DISABLED`
  (`{ "message": "Bubble timeline has been disabled.", "code":
  "BTL_DISABLED" }`) when the caller's `btlAvailable` policy is false.
- **Stream channel `bubbleTimeline`** with params `{ withRenotes?,
  withFiles?, withBots? }`, emitting `note` events with packed `Note`
  payloads (same shape as the other timeline channels).
- **Role policy `btlAvailable`** (per-user, falling back to instance
  policies) and an **instance flag marking bubble members** (donor: `instance.isBubbled`).
- **misskey-js**: `notes/bubble-timeline` endpoint types, the
  `bubbleTimeline` channel declaration (`params: { withRenotes?: boolean;
  withFiles?: boolean; withBots?: boolean }`, events `{ note: Note }`), and
  `btlAvailable` on the policy types.

## Gap 5 — Dead components (wired or removed)

### (1) What changed in the frontend and why

- `SkDateSeparatedList.vue` **wired**: `pages/admin/abuses.vue` now wraps
  its report list in it (additive slot wrap, compatible with the new
  `Paginator` API shape; the donor's `:metaHint` omitted because stock
  `MkAbuseReport` has no such prop).
- `SkFetchNote.vue` **deleted** (component + `SkFetchNote.md` + the
  `cannotLoadNote` locale key): its only donor consumer is the
  `createPromo` moderation-log branch, which has no stock counterpart, so
  wiring it would be unreachable dead code and would fail typecheck against
  the stock `ModerationLog` union.
- `SkBadgeStrip.vue` **deleted** (component + doc row): faithful wiring is
  impossible without backend changes — stock `FederationInstance` /
  `User` / `admin/show-user` lack most of the fields the badge computeds
  need, and most badge labels have no stock locale keys; a subset strip
  would diverge from the donor.

### (2) What the backend must implement

**Nothing.** This gap is pure wiring/deletion and needs no backend work:
no new endpoints, no new entity fields, no stream events, no misskey-js
changes. The wired surface (`admin/abuses.vue`) uses the existing abuse-list
pagination response unchanged.
