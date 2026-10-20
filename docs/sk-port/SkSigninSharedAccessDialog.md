# Shared-access login dialog port

- Donor: `/Users/terezi/Local Documents/fedifedifedi/Sharkey/packages/frontend/src/components/SkSigninSharedAccessDialog.vue`
- Target: `packages/frontend/src/components/SkSigninSharedAccessDialog.vue` (+ `getAccountWithSharedAccessDialog` in `utility/accounts.ts`)
- SPDX header kept (hazelnoot / Sharkey contributors).

## What it is

"Login with shared access" dialog: lists accounts that granted the user shared
access (`i/shared-access/list`) and logs into one (`i/shared-access/login`).
Opened from the account menu via `getAccountWithSharedAccessDialog`
(`pages/settings/accounts.vue`).

## Adapted

- Icons (Phosphor to Tabler): `ph-sign-in` to `ti ti-login`,
  `ph-caret-up/down` to `ti ti-chevron-up/down`. `@phosphor-icons/web` is not added.
- Strings: all stock (`loginWithSharedAccess`, `noSharedAccess`,
  `sharedAccessUnsupported`, `login`, `expand`, `collapse`, `permissions`,
  `somethingHappened`). No new locale keys.
- Endpoint casts: `i/shared-access/*` are Sharkey endpoints absent from
  misskey-js (and stock Misskey / Pinetree). Calls go through untyped aliases
  with a remove-the-cast comment. `UNKNOWN_API_ENDPOINT` on the list call
  shows the `sharedAccessUnsupported` note instead of a dead dialog.

## Known gaps

- Unverified live: Pinetree answers `UNKNOWN_API_ENDPOINT` for
  `i/shared-access/*` (probe commit `01d9d3e810`), so the dialog always shows
  the unsupported note on our targets.
- No browser verification; covered only by typecheck.
