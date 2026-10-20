> Note: Sharkey UI strings formerly lived in `packages/frontend/src/utility/sk-strings.ts` (deleted after the migration). All ported strings now live in `locales/en-US.yml` / `locales/ja-JP.yml` and are read via `i18n.ts` / `i18n.tsx` (see `MISSING-STRINGS.md`). `skStrings` tables below describe the pre-migration wording.

# SkNoteSimple.vue

- Donor: `/Users/terezi/Local Documents/fedifedifedi/Sharkey/packages/frontend/src/components/SkNoteSimple.vue`
- Target: `/Users/terezi/Local Documents/misskey/packages/frontend/src/components/SkNoteSimple.vue`

## Ported as-is

- SPDX header, template structure, props, emits, and the full `<style>` block.
- `SkMutedNote` wrapper with `skipMute`, `expandMute` threading, and `$style.root`.
- `MkAvatar` (global component in Misskey), `Mfm` (global), `MkCwButton`, `MkSubNoteContent`.
- `setupNoteViewInterruptors(note, null)`, `deepClone`, and the `expandAllCws` watcher.
- Schedule fields kept as-is: `isSchedule`, `scheduledNoteId` on the note type, and the `editScheduleNote` emit. Nothing calls `notes/schedule/*` (Phase 3).

## Deviations

- `MkNoteHeader` replaced with the shared `SkNoteHeader` (`components/SkNoteHeader.vue`). The target `MkNoteHeader` has no `classic` prop; `SkNoteHeader` does, and it is the Sharkey header that SkNoteSub also uses.
- `:mini="true"` dropped. Neither `MkNoteHeader` nor `SkNoteHeader` declares a `mini` prop, so it would have been an unused HTML attribute.
- `hideFiles` and `expandAllCws` are still bound on `MkSubNoteContent`, but the target `MkSubNoteContent` only declares `note`, so these fall through and have no effect. See shared changes.

## i18n keys replaced with local strings

None. The template uses no `i18n.ts` keys.

## Prefs used

- `prefer.s.uncollapseCW`. Present in `preferences/def.ts`.

## Endpoints called

- None. The component makes no API calls.

## Not ported

- Nothing from the donor was dropped.

## Shared changes needed

- `MkSubNoteContent` should accept `hideFiles` and `expandAllCws`, so that the CW and hide-files behaviour works here.
