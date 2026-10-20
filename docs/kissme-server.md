# kissme-server — port notes

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

### Deliberately NOT ported here (deferred to workstream F / integration)

- `CacheService.threadMutingsCache` / `noteMutingsCache` + endpoint `refresh()` calls:
  donor relies on Sharkey's `ManagedQuantumKVCache` infra, which does not exist in this
  tree (here `RedisKVCache`). Adding write-only caches with no readers would be dead code.
- `QueryService.generateMutedNoteThreadQuery` isPostMute/renote handling and packed
  `isMutingThread` / `isMutingNote` fields: owned by workstream F — untouched.
  Note: until F lands, `isPostMute: true` rows are still matched by the existing
  thread-based `generateMutedNoteThreadQuery`, so note-only mutes over-hide in timelines.
