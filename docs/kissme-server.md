# kissme-server — workstream notes

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
