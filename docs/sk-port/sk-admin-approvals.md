# Admin approvals queue port

- Donor: `/Users/terezi/Local Documents/fedifedifedi/Sharkey/packages/frontend/src/pages/admin/approvals.vue`, `.../components/SkApprovalUser.vue`
- Target: `packages/frontend/src/pages/admin/approvals.vue`, `.../components/SkApprovalUser.vue`, `utility/sk-approvals-api.ts`
- SPDX headers kept.

## What it is

`/admin/approvals` route plus the admin nav entry: lists local accounts awaiting
approval (`SkApprovalUser` rows with approve / deny-and-delete buttons).

## Adapted

- Icons (Phosphor to Tabler): row icon `ph-user ph-bold ph-lg` to `ti ti-user`;
  page icon `ti ti-user-check`. `@phosphor-icons/web` is not added.
- Strings: the 8 approval keys now live in the trailing Sharkey section of
  `locales/en-US.yml` / `locales/ja-JP.yml` (`i18n.ts`), donor wording adopted
  (`denyAccount` is "Deny & Delete").
- Endpoint casts: `admin/approve-user` and `admin/decline-user` are Sharkey
  endpoints absent from misskey-js (and stock Misskey); calls go through an
  untyped alias with a remove-the-cast comment (`sk-approvals-api.ts`). The
  list itself pages `admin/show-users` with the Sharkey-only `state:
  'approved'` value, hence the cast.
- Honest degradation: `probeApprovalsSupported()` POSTs `admin/approve-user`
  with no `userId` (a Sharkey backend answers a 400 parameter error, stock
  answers 404). On 404/405/501 the page shows the `approvalsUnsupported`
  disabled note instead of a dead list.

## Known gaps

- Unverified live: Pinetree answers `UNKNOWN_API_ENDPOINT` for the approval
  endpoints (probe commit `01d9d3e810`), so on our targets the page always
  shows the disabled note. No dead UI beyond that note.
- No browser verification; covered only by typecheck.
