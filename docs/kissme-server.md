# kissme-server — Sharkey port workstream status

Porting selected Sharkey endpoints to upstream Misskey. One row per endpoint.
Backend-only: no frontend / locales / docs-frontend changes.

| Endpoint | Upstream status | kissme-server status | Notes |
|---|---|---|---|
| `notes/like` | missing | ported | Donor: Sharkey `notes/like`. `kind: write:reactions`, limit 2/sec. `override ?? ❤️` (donor `Meta.defaultLike` DB default `❤️` = U+2764 U+FE0F; upstream `MiMeta` has no such column, so the default is a constant — see `DEFAULT_LIKE` in the endpoint file). Already-reacted (`51c42bb4…`) toggles off via `ReactionService.delete` instead of erroring. `ReactionService` normalizes `❤️` → `❤` (U+2764) when stored. Error UUIDs are new (donor UUIDs collide with existing `notes/reactions/create` errors). |
| `notes/thread-muting/create` | exists (no `noteOnly`) | ported `noteOnly` | `paramDef` += `noteOnly` (default false); `isPostMute` column; unique index widened to `(userId, threadId, isPostMute)`; `ALREADY_MUTING` guard removed to match donor. |
| `notes/thread-muting/delete` | exists (no `noteOnly`) | ported `noteOnly` | Same `noteOnly`/`isPostMute` criteria; limit added `{ duration: 1h, max: 20 }` (donor bucket has no upstream shape). |
| `i/shared-access/list` | missing | ported | Grantee token list (`secure`, 2/sec). See section below. |
| `i/shared-access/login` | missing | ported | Grant-id → `{userId, token}` exchange + `sharedAccessLogin` notify. See section below. |
| `admin/cw-note` | missing | ported | Force CW on a note (`write:admin:cw-note`). Direct column update (no NoteEditService upstream). |
| `admin/cw-user` | missing | ported | Force CW on all user notes (`write:admin:cw-user`). |
| `admin/silence-user` | missing | ported | New `User.isSilenced` column (upstream derives silence from roles). |
| `admin/unsilence-user` | missing | ported | Clears `User.isSilenced`. |
| `admin/approve-user` | missing | ported | New `User.approved` column (default true — upstream has no approval flow). |
| `admin/decline-user` | missing | ported | Deletes unapproved local user; `USER_PROTECTED` reserved. |
| `notes/bubble-timeline` | missing | ported | Public remote bubble notes; gated by role policy `btlAvailable`. |
| `notes/following` | missing | ported | Per-user latest-note feed via `SkLatestNote`; `following/followers/mutuals`. |
| `notes/search` | exists (no filetype/order) | extended | `+filetype` (attachment category) `+order` params. |
| `bubbleTimeline` (stream) | missing | ported | Channel gated by `btlAvailable`; no ChannelsService in this tree. |
| packed Note/User/Instance fields | missing | ported | See packed-field contract below. |

## Frontend / backend contract (`notes/like`)

- Request: `{ noteId: string, override?: string | null }` (`override` = custom reaction; default like when omitted/null).
- Auth: credential required, `write:reactions` permission. `prohibitMoved: true`.
- Response: `204` empty on success (like created, or existing like removed on toggle).
- Errors: `NO_SUCH_NOTE`, `YOU_HAVE_BEEN_BLOCKED`, `CANNOT_REACT_TO_RENOTE` (all 400 client errors).
- Rate limit: max 2 req/sec.

Example:

```sh
curl -X POST https://your-instance.example/api/notes/like \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"noteId":"<NOTE_ID>"}'
```

(Note: verified shape only via E2E tests against a local dev server, not via a public instance.)

## (c) threadmute — `noteOnly` / `isPostMute` thread-muting (Sharkey port)

Donor: `Sharkey/packages/backend/src/server/api/endpoints/notes/thread-muting/{create,delete}.ts`,
`Sharkey/packages/backend/src/models/NoteThreadMuting.ts`.

### Changed (this workstream)

- `packages/backend/src/server/api/endpoints/notes/thread-muting/create.ts`
  - `paramDef` += `noteOnly: { type: 'boolean', default: false }` (donor verbatim).
  - `threadId = ps.noteOnly ? note.id : (note.threadId ?? note.id)`; insert carries
    `isPostMute: ps.noteOnly` (donor verbatim).
  - `alreadyMuting` error + pre-insert `exists()` check removed (donor has neither;
    duplicate create now surfaces the unique-constraint violation instead of `ALREADY_MUTING`).
  - `limit` kept as upstream `{ duration: 1h, max: 10 }` — the worktree `IEndpointMeta`
    has no donor `bucket`/`dripRate` shape, and burst-10 matches the donor bucket size.
  - `noSuchNote` UUID reused (`5ff67ada-…`, identical in donor and upstream).
- `packages/backend/src/server/api/endpoints/notes/thread-muting/delete.ts`
  - `paramDef` += `noteOnly` (donor verbatim); delete criteria += `isPostMute: ps.noteOnly`
    with the same `threadId` selection as create.
  - `limit` added `{ duration: 1h, max: 20 }` — adapted from the donor bucket
    `{ size: 20, dripRate: 2000 }` (burst number preserved; drip rate not expressible).
  - `noSuchNote` UUID reused (`bddd57ac-…`, identical in donor and upstream).
- `packages/backend/src/models/NoteThreadMuting.ts`
  - Added `isPostMute: boolean` (`default: false`, donor comment ported).
  - Unique index widened `(userId, threadId)` → `(userId, threadId, isPostMute)` (donor verbatim).
- New timestamped migration `packages/backend/migration/*-*.js`
  (up: `ADD COLUMN`, drop old unique `IDX_ae7aab18a2641d3e5f25e0c4ea`, create new unique;
  down reverses; generated via `typeorm migration:generate`).
- `endpoint-list.ts` already registered both routes — verified, no change.
- `misskey-js` autogen regenerated (`pnpm build-misskey-js-with-types`) — `paramDef` changed.

### Frontend / backend contract (thread-mute `noteOnly`)

- Request (both routes): `{ noteId: string, noteOnly?: boolean }` (default `false` = whole thread).
- Auth: credential required, `write:account`.
- Response: empty success. A thread mute and a note-only mute on the same note coexist.
- Until workstream F lands: `isPostMute: true` rows are still matched by the existing
  thread-based `generateMutedNoteThreadQuery`, so note-only mutes over-hide in timelines.

### Deliberately NOT ported here (deferred to workstream F / integration)

- `CacheService.threadMutingsCache` / `noteMutingsCache` + endpoint `refresh()` calls:
  donor relies on Sharkey's `ManagedQuantumKVCache` infra, which does not exist in this
  tree (here `RedisKVCache`). Adding write-only caches with no readers would be dead code.
- `QueryService.generateMutedNoteThreadQuery` isPostMute/renote handling and packed
  `isMutingThread` / `isMutingNote` fields: owned by workstream F — untouched.
Backend port notes for the kissme-server worktree (Sharkey donor → Misskey base).

## Shared access (`i/shared-access/*`)

Donor: Sharkey `packages/backend/src/server/api/endpoints/i/shared-access/`.

### Endpoints

- `i/shared-access/list` — lists access tokens the caller has been granted (i.e. rows
  where the caller's id is in `access_token.granteeIds`). `requireCredential: true`,
  `secure: true` (no `kind`: internal endpoint, not callable via OAuth). Pagination via
  `limit`/`sinceId`/`untilId`. Rate limit: 2 calls/sec. Response items:
  `{ id, user (UserLite of the token owner), permissions, rank }`.
- `i/shared-access/login` — exchanges a `grantId` (an `access_token` id) for the raw
  `{ token, userId }` pair, but only if the caller is in that token's `granteeIds`.
  Otherwise `NO_SUCH_ACCESS` (403, `d536e0f2-47fc-4d66-843c-f9276e98030f`).
  Same auth/rate-limit shape as `list`.

### Schema (owns `AccessToken` additions `granteeIds` + `rank` only)

- `access_token.granteeIds`: `varchar(32)[] NOT NULL DEFAULT '{}'`, GIN index
  `IDX_access_token_granteeIds` (`USING GIN (granteeIds array_ops)`).
  IDs of other users permitted to use the token.
- `access_token.rank`: nullable enum `access_token_rank_enum`
  (`'user' | 'mod' | 'admin'`). Limits the rank in effect when the token is used;
  `null` means the user's actual rank.
- Migration: `packages/backend/migration/1792535629293-AccessTokenSharedAccess.js`
  (up creates the enum type, adds both columns with comments, creates the GIN index;
  down drops them in reverse).

### Notification side-effect

`i/shared-access/login` calls
`notificationService.createNotification(token.userId, 'sharedAccessLogin', {}, me.id)`,
notifying the token owner that a grantee logged in. Supporting type only
(`sharedAccessLogin`; no `Granted`/`Revoked` variants in this workstream):
`MiNotification` union, `notificationTypes`, and the `Notification` JSON schema.

### Grant-write path (donor flow, not redesigned)

Grants are written embedded in the existing auth flow, not via a dedicated endpoint:

- Sharkey `miauth/gen-token.ts:106-119` accepts `grantees` (+ `rank`) params, validates
  each grantee is a local user (`mustBeLocal`, `noSuchUser`), then inserts the access
  token with `granteeIds: ps.grantees` and `rank: ps.rank`, and emits
  `sharedAccessGranted` notifications (`gen-token.ts:121-124`).
- This worktree does **not** port that hunk (owned by the auth workstream); E2E here
  inserts the grant row directly via the repository. Do not redesign: when the auth
  side lands, it must reuse the same column semantics (`granteeIds` array + nullable
  `rank enum`).

### Security notes

- Both endpoints are `secure: true`: third-party/OAuth apps cannot call them, so no
  `kind` scope is declared.
- `login` never reveals whether a `grantId` exists vs. the caller not being a grantee
  (both are `NO_SUCH_ACCESS`/403).
- The returned `token` is the raw secret: treat the response as sensitive; the login
  event is notified to the token owner for auditability.
- `list` filters strictly with `:meId <@ token.granteeIds`; the array operator needs
  the GIN index above to stay fast.

## (e) adminmod — Sharkey admin moderation endpoints port

Ports six Sharkey `admin/*` endpoints into upstream Misskey:

- `admin/cw-note` (`write:admin:cw-note`) — force a content warning on a note
- `admin/cw-user` (`write:admin:cw-user`) — force a content warning on all of a user's notes
- `admin/silence-user` (`write:admin:silence-user`)
- `admin/unsilence-user` (`write:admin:unsilence-user`)
- `admin/approve-user` (`write:admin:approve-user`)
- `admin/decline-user` (`write:admin:decline-user`)

All six: `requireCredential: true`, `requireModerator: true`, donor `meta`/`paramDef`
verbatim (error UUIDs reused), English-only messages. Six new permission kinds were
added to `packages/misskey-js/src/consts.ts` (hand-edited src, not autogen).

### Entity columns added

| Column | Donor default | Port default | Note |
|---|---|---|---|
| `MiUser.mandatoryCW` (nullable text) | null | null | owned by this workstream |
| `MiUser.rejectQuotes` (boolean) | false | false | owned by this workstream (no endpoint yet; packing is workstream F) |
| `MiNote.mandatoryCW` (nullable text) | null | null | owned by this workstream (workstream B references, F packs) |
| `MiUser.isSilenced` (boolean) | false | false | **not present upstream** — added because silence endpoints need it; upstream derives silence from role policies |
| `MiUser.approved` (boolean) | false | **true** | **not present upstream** — added because approve/decline need it; default true preserves existing behavior (upstream has no signup-approval flow) |

Migration `1792535740516-adminmod-cw-silence-approval.js` covers all five columns
(up/down, incl. `COMMENT ON COLUMN` so `check-migrations` is clean).

Moderation-log types added (donor names/payloads verbatim):
`approve`, `decline`, `setMandatoryCW`, `setMandatoryCWForNote`, `silenceUser`,
`unSilenceUser`.

### Upstream adaptations (deviations from donor)

- No `NoteEditService` upstream → `admin/cw-note` applies `mandatoryCW` with a
  direct column update instead of the note-edit flow.
- No `InternalEventService` / generic `userUpdated` event upstream →
  `localUserUpdated` / `remoteUserUpdated` via `GlobalEventService` based on
  `user.host` (`approve-user` target is always local).
- No `CacheService.findOptionalUserById` upstream → `usersRepository` /
  `userProfilesRepository` direct loads in approve/decline.
- No `errorCodes`/`isIdentifiableError` upstream → plain-English error messages;
  donor UUIDs kept. `USER_PROTECTED` kept in `decline-user` meta for contract
  parity (upstream `DeleteAccountService` throws plain errors for root/system
  accounts, surfacing as 500).
- `MiUsedUsername` delete uses criteria delete, not the donor query-builder
  form (invalid under TypeORM 1: `missing FROM-clause entry for table "uu"`).
- `admin/cw-instance` / `admin/reject-quotes` / federation `rejectQuotes` were
  verified in the donor but **not ported** (out of scope); no instance/user-pack
  changes here — packing of the new columns is workstream F.

### Gates

- `eslint --quiet` on all touched files: PASS
- `node scripts/check-shipping.mjs`: Lint PASS, SPDX PASS, Locale safety PASS
- `pnpm --filter backend typecheck` (incl. test projects): PASS
- `check-migrations` on isolated scratch DB (`migrate` → `revert` → `migrate`):
  PASS, `All migrations are clean.`
- `pnpm build-misskey-js-with-types`: PASS, autogen committed
- E2E `test/e2e/admin-mod.ts`: 8/8 PASS (cw set/unset, silence/unsilence,
  approve/decline incl. unapproved happy paths via direct `approved` flag flip,
  non-moderator 403, moderation-log entry)

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
| Note | `mandatoryCW` | string \| null, optional | Forced CW for this note (`Note.mandatoryCW`; resolved at integration — direct read). |
| Note | `isMutingThread` | boolean | Viewer mutes the note's thread (`threadId ∈` viewer's thread mutes). |
| Note | `isMutingNote` | boolean | Viewer mutes this exact note (`NoteThreadMuting` rows with `isPostMute = true`; resolved at integration). |
| Note | `isFavorited` | boolean | Viewer favorited the note (batched via `noteFavoritesRepository` in `packMany`, `existsBy` in `pack`). Anonymous → `false`. |
| Note | `isRenoted` | boolean | Viewer pure-renoted the note (batched in `packMany`, `getExists` in `pack`). Anonymous → `false`. |
| Note | `bypassSilence` | boolean | `true` when the viewer authored the note, the viewer follows the author, or an ancestor note in the pack already bypasses (self-reply/self-renote propagate the outer value). |
| Note | `processErrors` | string[], optional, detail only | Non-fatal processing errors (translation key or raw string). |
| UserLite | `mandatoryCW` | string \| null | Forced CW for all notes by this user (`User.mandatoryCW`; resolved at integration). |
| UserLite | `rejectQuotes` | boolean, optional | Quotes of this user's notes are downgraded (`User.rejectQuotes`; resolved at integration). |
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
