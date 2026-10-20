# kissme-server — Sharkey port workstream status

Porting selected Sharkey endpoints to upstream Misskey. One row per endpoint.
Backend-only: no frontend / locales / docs-frontend changes.

| Endpoint | Upstream status | kissme-server status | Notes |
|---|---|---|---|
| `notes/like` | missing | ported | Donor: Sharkey `notes/like`. `kind: write:reactions`, limit 2/sec. `override ?? ❤️` (donor `Meta.defaultLike` DB default `❤️` = U+2764 U+FE0F; upstream `MiMeta` has no such column, so the default is a constant — see `DEFAULT_LIKE` in the endpoint file). Already-reacted (`51c42bb4…`) toggles off via `ReactionService.delete` instead of erroring. `ReactionService` normalizes `❤️` → `❤` (U+2764) when stored. Error UUIDs are new (donor UUIDs collide with existing `notes/reactions/create` errors). |
| `notes/thread-muting/create` | exists (no `noteOnly`) | ported `noteOnly` | `paramDef` += `noteOnly` (default false); `isPostMute` column; unique index widened to `(userId, threadId, isPostMute)`; `ALREADY_MUTING` guard removed to match donor. |
| `notes/thread-muting/delete` | exists (no `noteOnly`) | ported `noteOnly` | Same `noteOnly`/`isPostMute` criteria; limit added `{ duration: 1h, max: 20 }` (donor bucket has no upstream shape). |

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
