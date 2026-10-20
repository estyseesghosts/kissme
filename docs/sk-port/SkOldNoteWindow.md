> Note: Sharkey UI strings are now centralized in `packages/frontend/src/utility/sk-strings.ts` (see README.md and MISSING-STRINGS.md). Any `skStrings` table mentioned below refers to that module.

# SkOldNoteWindow.vue

- Donor: `/Users/terezi/Local Documents/fedifedifedi/Sharkey/packages/frontend/src/components/SkOldNoteWindow.vue`
- Target: `/Users/terezi/Local Documents/misskey/packages/frontend/src/components/SkOldNoteWindow.vue`

## Ported as-is
- Window layout, note header, content, footer, CSS module styles, plugin `note_view_interruptor` handling, reply/channel links, and the old-text/updatedAt substitution.
- Uses `getSelfNoteIds` from `@/utility/get-self-note-ids.js` (already in target).
- Imports `SkNoteTranslation` (ported) and `SkUrlPreviewGroup` by path (`@/components/SkUrlPreviewGroup.vue`, written by another agent).
- SPDX header kept.

## Deviations
- Phosphor icons converted to Tabler: warning-circle -> alert-circle, house -> home, lock -> lock, envelope -> mail, rocket -> rocket, rocket-launch -> rocket, arrow-bend-left-up / arrow-u-up-left -> arrow-back-up, television -> device-tv, quotes -> quote, heart -> heart.
- `inject('inChannel', null)` -> `inject(DI.inChannel, null)` (target's `@/di.js` key).
- `<MkNoteSimple>` no longer passes `:skipMute` (target's MkNoteSimple has only a `note` prop).
- `<MkPoll>` props adapted to the target signature: `poll` is split into `:multiple`, `:expiresAt`, `:choices`. The donor's `:local` prop does not exist in target and is dropped.
- `appearNote.user.rejectQuotes` is not on target's User type. Read through a narrow cast: `(appearNote.user as { rejectQuotes?: boolean }).rejectQuotes`.
- Imports use the target's `.js` suffix style (`@/preferences.js`, `@/utility/get-self-note-ids.js`).
- `ref="window"` and `ref="specified"` kept as in donor.

## i18n keys replaced with local strings
- `i18n.ts.noteFooterLabel` (not in en-US.yml) -> `skStrings.noteFooterLabel` ("Note footer").

## i18n keys used as-is
- `i18n.ts.private`, `i18n.ts._visibility[...]` (including `disableFederation`).
- Hardcoded English in the donor ("Previous Version from ...", "bot", "RN:") left unchanged.

## Prefs
- `prefer.s.instanceTicker` (exists in target `preferences/def.ts`).

## Endpoints
- None directly. Note content is passed in from `getNoteVersionsMenu`.

## Not ported
- Nothing functional. The translate/translating refs are never set by the donor either.
