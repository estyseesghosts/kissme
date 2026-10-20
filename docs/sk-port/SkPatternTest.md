# Word-mute tester port

- Donor: `/Users/terezi/Local Documents/fedifedifedi/Sharkey/packages/frontend/src/components/SkPatternTest.vue`
- Target: `packages/frontend/src/components/SkPatternTest.vue`, `utility/sk-parse-mutes.ts`
- SPDX header kept (hazelnoot / Sharkey contributors).

## What it is

"Test your mutes" folder in the mute settings (behind pref `showWordMuteTester`,
default off). Enter text, press Test; each line is checked against the mutes
above and matches are listed. Reuses `getMutedWords` from `sk-check-mute.ts`.

## Adapted

- The donor renders `i18n.ts.wordMuteTest*` with `i18n.tsx.wordMuteTestMatch({words})`.
  The port restructured the result into matches + invalid-lines arrays (`sk-parse-mutes.ts`
  `testMutePatterns`), so the copy differs: 7 flat `wordMuteTest*` keys in the
  trailing Sharkey locale section (`i18n.ts`), port wording kept.
- Parsing core (`sk-parse-mutes.ts`, `parseMuteText`) is tested
  (`test/unit/parse-mutes.test.ts`); the mute-matching helpers are tested in
  `check-word-mute` tests.
- No endpoint casts, no icons (plain buttons).
- No settings-UI gap: shown in mute settings only when the pref is on.

## Known gaps

- The port wording is not the donor wording (donor structures this tester
  differently); a future rebase that unifies them needs new Japanese copy.
- No browser verification.
