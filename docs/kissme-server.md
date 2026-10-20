# kissme-server

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
