> Note: Sharkey UI strings formerly lived in `packages/frontend/src/utility/sk-strings.ts` (deleted after the migration). All ported strings now live in `locales/en-US.yml` / `locales/ja-JP.yml` and are read via `i18n.ts` / `i18n.tsx` (see `MISSING-STRINGS.md`). `skStrings` tables below describe the pre-migration wording.

# get-note-versions-menu.ts

- Donor: `/Users/terezi/Local Documents/fedifedifedi/Sharkey/packages/frontend/src/utility/get-note-versions-menu.ts`
- Target: `/Users/terezi/Local Documents/misskey/packages/frontend/src/utility/get-note-versions-menu.ts`

## Ported as-is
- `getNoteVersionsMenu(props)` logic: renote-aware `appearNote`, menu entries per edit (date text via `dateTimeFormat`), `openVersion` opening `SkOldNoteWindow`, and the cleanup function.
- Calls `notes/versions` with `{ noteId }` through `misskeyApi`, as the donor does.
- SPDX header kept.

## Deviations
- Icon `ph-pencil-simple ph-bold ph-lg` -> `ti ti-pencil`.
- Imports use the target's `.js` suffix style (`./misskey-api.js`, `./intl-const.js`).
- Typing: `misskeyApi` is typed against `Misskey.Endpoints`, which has no `notes/versions`. The call goes through a loosely typed alias (`misskeyApi as unknown as (endpoint: 'notes/versions', data) => Promise<NoteEdit[]>`). Runtime behaviour is identical.
- Failure path: the donor's `.then` had no catch, so a failed request rejected `getNoteVersionsMenu`. Here a `.catch` clears `menu` to an empty array, so the caller shows no version entries. The error is logged only in dev builds.

## i18n keys replaced with local strings
- None.

## Prefs
- None.

## Endpoints
- `notes/versions` (`{ noteId }`). **Not in misskey-js.** Called as the donor does.
  Probed 2026-10-20: Pinetree HAS it (answers `INVALID_PARAM` without `noteId`);
  stock Misskey does not, where the failure degrades to an empty menu.

## Not ported / notes
- No caller in the target yet. Whoever wires it into the note menu should treat an empty `menu` as "nothing to show".
- Cleanup logic is a no-op in the donor too (`cleanups` is never populated); kept for parity.
