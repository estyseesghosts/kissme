/*
 * SPDX-FileCopyrightText: syuilo and other misskey contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

# Single-note mute menu port

- Donor: Sharkey `packages/frontend/src/utility/get-note-menu.ts:265-277`
  (`toggleThreadMute` with `noteOnly: false`, `toggleNoteMute` with
  `noteOnly: true`), `:409-435` (thread items driven by
  `appearNote.isMutingThread`, note items driven by
  `appearNote.isMutingNote`; `i18n.ts.muteNote` / `unmuteNote` from
  `sharkey-locales/en-US.yml`: `"Mute note"` / `"Unmute note"`).
- Donor backend: `packages/backend/src/server/api/endpoints/notes/thread-muting/create.ts`
  `paramDef` is `{ noteId, noteOnly: { type: 'boolean', default: false } }`
  (same shape in `delete.ts`); `NoteEntityService` packs `isMutingNote`
  onto notes (`core/entities/NoteEntityService.ts:536,706`, schema in
  `models/json-schema/note.ts:178`).
- Target: `packages/frontend/src/utility/get-note-menu.ts`
  (`toggleNoteMute`, `muteNote` / `unmuteNote` items), strings in the
  trailing Sharkey locale sections. Covered by
  `test/unit/sk-note-mute.test.ts`.
- SPDX header kept (new test file carries one).

## What it is

The note menu gains Sharkey's per-note mute items next to the existing
thread-mute items. Muting a single note calls
`notes/thread-muting/create` with `{ noteId, noteOnly: true }`
(and `delete` to unmute); thread items keep the typed `{ noteId }`-only
shape.

## Adapted

- `noteOnly` cast: misskey-js types `notes/thread-muting/*` with
  `{ noteId }` only, so `toggleNoteMute` calls `os.apiWithDialog`
  through the same `(endpoint: string, body: object)` untyped alias
  `getMandatoryCWMenu` already uses in this file. Comment on the call
  names the endpoint pair and the `{ noteId, noteOnly: true }` shape,
  with a remove-the-cast-once-misskey-js-exposes-`noteOnly` note
  (same convention as `utility/sk-like.ts`).
- State source: `appearNote.isMutingNote` is read via
  `(appearNote as unknown as { isMutingNote?: boolean }).isMutingNote`.
  Stock Misskey / Pinetree never pack the field, so it is `undefined`
  there and the menu shows the mute action; the endpoint call then
  reports the backend error honestly through `apiWithDialog`
  (`UNKNOWN_API_ENDPOINT` on Pinetree) instead of faking the mute.
  `notes/state` is not a fallback: its misskey-js response is
  `{ isFavorited, isMutedThread }` with no note-mute field.
- Icons stay Tabler (`ti ti-message-off`, as the donor); no icon mapping
  was needed.
- Read side needed no change: `utility/sk-check-mute.ts` already
  cast-reads `isMutingNote` into `noteMuted` (part of `hasMute`), and
  `SkMutedNote.vue` renders the muted-note placeholder from it. On
  backends without the field that branch is simply inactive, same as
  before.
- Strings: `muteNote: "Mute note"` / `unmuteNote: "Unmute note"` reuse
  the donor `sharkey-locales/en-US.yml` wording verbatim in the trailing
  Sharkey section of `locales/en-US.yml`; `locales/ja-JP.yml` gains
  `muteNote: "ノートをミュート"` /
  `unmuteNote: "ノートのミュートを解除"`, following the existing
  `muteThread` / `unmuteThread` Japanese wording. Regen: locale
  interface regenerated, i18n `built/` rebuilt (esbuild + `built/locales`
  copies + frontend locales JSON).
- Existing thread-mute items are unchanged (unit test pins the
  `{ noteId }`-only call shape).

## Known gaps

- Pinetree answers `UNKNOWN_API_ENDPOINT` for `notes/thread-muting/*`,
  so both the thread and the new note items fail through the standard
  error dialog there; nothing is muted. Behavior on a Sharkey backend
  (where `noteOnly` and `isMutingNote` exist) is unverified live — no
  authed session, no browser connected.
- Stock `MkNote*` menus share `getNoteMenu`, so they gain the items too;
  same honest-error behavior applies.
- No browser verification; covered by typecheck and unit tests.
