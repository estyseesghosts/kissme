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
