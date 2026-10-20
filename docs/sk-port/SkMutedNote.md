# SkMutedNote.vue port

- Donor: `/Users/terezi/Local Documents/fedifedifedi/Sharkey/packages/frontend/src/components/SkMutedNote.vue`
- Target: `/Users/terezi/Local Documents/misskey/packages/frontend/src/components/SkMutedNote.vue`
- SPDX header kept (hazelnoot / Sharkey contributors).

## What it is

Placeholder wrapper used by `SkNote`, `SkNoteSub`, `SkNoteSimple`, `SkNoteDetailed`
and `SkFollowingFeedEntry`. When `sk-check-mute.ts` `checkMute()` reports a mute,
the note body is replaced by a one-line reason; clicking expands the real note.
A hard mute hides everything, including the placeholder.

Mute precedence and the `Mute` object live in `utility/sk-check-mute.ts`
(`checkMute`, `useMuteOverrides`); upstream `utility/check-word-mute.ts`
(`checkWordMute`) is unchanged because other upstream code uses it.
`DynamicNote*` dispatchers write per-note overrides through `utility/merge.ts`
`deepAssign`.

## Adapted

- Icons: none in this component (no Phosphor to map).
- Strings: the 7 mute reasons (`noteIsFlaggedAs`, `userIsFlaggedAs`,
  `instanceIsFlaggedAs`, `userSaysSomethingInMutedNote`,
  `userSaysSomethingInMutedThread`, `silencedUserSaysSomething`,
  `silencedInstanceSaysSomething`) now live in the trailing Sharkey section of
  `locales/en-US.yml` / `locales/ja-JP.yml` and are read via `i18n.ts`. English
  follows the donor wording. The ja `silencedInstanceSaysSomething` gained the
  missing `{host}` param to match the donor signature.
- Word-mute line reuses the stock `i18n.ts.userSaysSomethingAbout` /
  `i18n.ts.userSaysSomething` keys; sensitive-mute line reuses stock
  `i18n.ts.userSaysSomethingSensitive`.
- No endpoint casts (pure client-side rendering).

## Known gaps

- Thread mute, note mute, user/instance mandatory CW and silenced-user/instance
  placeholders are inactive without the backend fields (`threadId`,
  `isMutingThread`, `isMutingNote`, `bypassSilence`, user/instance
  `mandatoryCW` / `isSilenced`), which stock Misskey and Pinetree do not send.
  Word, hard and sensitive mutes work. Behavior degrades honestly: no
  placeholder is shown for data the server never sent.
- No browser verification; covered only by typecheck and unit tests of
  `sk-check-mute`.
