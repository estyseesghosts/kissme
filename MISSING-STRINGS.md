# Missing i18n strings (Sharkey frontend port)

Sharkey UI strings used by the ported `Sk*` components that Misskey's `locales/en-US.yml`
did not have. Migration is in progress: settled keys live in the locale files and are
deleted from `sk-strings.ts`.

State:
- `locales/ja-JP.yml` has a trailing `# Sharkey frontend port` section with Japanese
  wording for the ported keys (added before the real-locales policy).
- `locales/en-US.yml` is gaining the matching English section key-by-key, reusing the
  donor `sharkey-locales/en-US.yml` wording where it fits.
- `_skSettings.*` plus the flat pref labels were migrated earlier into both locale
  files (new Japanese written in Misskey tone); the orphaned top-level duplicates
  left in the ja-JP tail are still to be removed.

Remaining keys live in one module: `packages/frontend/src/utility/sk-strings.ts`.
Components import `skStrings` from there, so there is one wording per key.

To settle each key: ensure it is in `locales/en-US.yml` (and `ja-JP.yml`), switch the
components to `i18n.ts.<key>`, and delete the entry from `sk-strings.ts`.

Migrated (in both locale files, read via `i18n.ts`, gone from `sk-strings.ts`):
- `SkMutedNote` (7 keys: `noteIsFlaggedAs`, `userIsFlaggedAs`,
  `instanceIsFlaggedAs`, `userSaysSomethingInMutedNote`,
  `userSaysSomethingInMutedThread`, `silencedUserSaysSomething`,
  `silencedInstanceSaysSomething`) — English follows the donor wording.
- `SkUrlPreview` (`writtenBy`, `fetchLinkedNote`) — donor wording.
- Note footers (`quoted`, `rmboost`, `noteFooterLabel`, `animatedMFM.*`) used by
  `SkNote`, `SkNoteSub`, `SkNoteDetailed`, `SkOldNoteWindow` — English follows the
  donor wording (`rmboost` is "Unboosted.", footer is "Note controls").
- Schedule + poll-edit (`postOn`, `schedulePostList`, `confirmPollEditTitle`,
  `confirmPollEditText`) in `MkScheduleEditor`, `MkSchedulePostListDialog`,
  `MkPostForm` — English follows the donor wording.
- Note loading states (`translationFailed`, `cannotLoadNote`) in
  `SkNoteTranslation`, `SkFetchNote` — English follows the donor wording.
- External-link warning (`_externalNavigationWarning.*`) in
  `MkUrlWarningDialog` — aligned to the donor's nested key structure and
  wording (replacing the port's flat `externalWarning*` keys and the
  `.replace('{host}')` hack with `i18n.tsx` params).
- Flash player (`flashContentHidden`, `flashPoweredByRuffle`,
  `flashArbitraryCodeExecutionWarning`, `flashFailedToLoad`, `flashIsLoading`,
  `flashLoadingRufflePlayer`, `flashLoadingFlashFile`, `flashCspError`) in
  `SkFlashPlayer` — donor wording, flat keys as in the ja-JP tail.
- Tracker player (`modPatternHidden`, `modFailedToLoad`, `modAudioUnsupported`)
  in `SkModPlayer` — donor hard-coded English for the first, port wording kept
  for the other two (donor has none).
- Media alt-text hint (`imageLacksDescription`) in `SkMediaImage` and the
  honest-like fallback (`likeNotSupported`) in `sk-like.ts` — donor hard-coded
  English for the former, port wording for the latter.
- `_skSettings.*` and flat pref labels (`clickToOpen`, `expandLongNote`, …).
- Following feed (`mutuals`, `showBots`, `showQuotes`, `showReplies`,
  `showNonPublicNotes`, `remoteFollowersWarning`) in
  `following-feed-utils.ts`, `SkRemoteFollowersWarning` — donor wording.
- Admin approvals (`approvals`, `approveAccount`, `denyAccount`,
  `signupReason`, `approveConfirm`, `denyAccountConfirm`,
  `approvalsUnsupported`, `approvalsEmpty`) in `SkApprovalUser`,
  `admin/approvals`, `admin/index` — donor wording adopted
  (`denyAccount` is "Deny & Delete", `approveConfirm` the full sentence).
- Word-mute tester (`wordMuteTestLabel`, `wordMuteTestDescription`,
  `wordMuteTestTest`, `wordMuteTestNoResults`, `wordMuteTestNoMatch`,
  `wordMuteTestMatch`, `wordMuteTestInvalid`) in `SkPatternTest` — port
  wording kept (donor structures this tester differently).
- Attribution domains (`attributionDomains`, `attributionDomainsDescription`,
  `attributionDomainsTutorial`, `attributionDomainsUnsupported`) in
  `settings/profile` + `attribution-domains-setting` — first two follow the
  donor wording, latter two keep the port wording (donor has none).
  `attributionDomainsUnsupported` is currently unused (kept for the
  backend-gap UI).

Remaining (phases 1–3 are fully migrated):

Phase 4 additions. The last column notes where the wording comes from.

| Key in `skStrings` | English text | Used in |
|---|---|---|
| `aboutSharkey` | `About Sharkey` | `about-sharkey page title` (Phase 9.3) |
| `aboutSharkeyDescription` | `Sharkey is open-source software forked from Misskey.` | `about-sharkey` (Phase 9.3) |
| `aboutSharkeySource` | `Source code (Sharkey)` | `about-sharkey` (Phase 9.3) |
| `aboutSharkeyDonate` | `Donate to Sharkey` | `about-sharkey` (Phase 9.3) |
| `aboutSharkeyTesters` | `Testers` | `about-sharkey` (Phase 9.3) |
| `aboutSharkeyMisskeyContributors` | `Misskey contributors` | `about-sharkey` (Phase 9.3) |
| `aboutSharkeySponsors` | `Our lovely sponsors` | `about-sharkey` (Phase 9.3) |
| `clickToUnsubscribe` | `Click OK to unsubscribe from these emails.` | `unsubscribe` (Phase 9.3) |
| `unsubscribeError` | `Could not unsubscribe. The link may be invalid or expired.` | `unsubscribe` (Phase 9.3) |
| `unsubscribeSuccess` | `You have been unsubscribed.` | `unsubscribe (new, donor showed nothing)` (Phase 9.3) |
| `welcomeEntranceStyle` | `Entrance page style` | `entrance pref label (no settings UI yet)` (Phase 9.3) |
| `welcomeEntranceStyleServer` | `Server default` | `entrance pref option` (Phase 9.3) |
| `welcomeEntranceStyleA` | `Sharkey (A)` | `entrance pref option` (Phase 9.3) |
| `systemAccountTitle` | `System account` | `show-system-account-dialog` (donor key absent from donor locale; text written here) |
| `systemAccountDescription` | `This is a system account used by the server. It cannot be interacted with.` | `show-system-account-dialog` |
| `listeningTo` | `Listening to…` | `SkListenBrainz` (Phase 9.1; donor `_profile.listeningTo`) |
| `mfmCheatsheet.title` / `.openButton` | `MFM Cheatsheet` / `MFM cheatsheet` | `SkMfmWindow`, `MkPostForm` button (Phase 9.1; donor hard-coded the title) |
| `mfmCheatsheet.intro` / `.dummy` / `.uncommonFeature` | donor `_mfm.intro` / `.dummy` / `.uncommonFeature` | `SkMfmWindow` (Phase 9.1) |
| `mfmCheatsheet.sections.<id>.title` / `.description` (39 sections) | donor `_mfm.<id>` / `_mfm.<id>Description` | `SkMfmWindow` via `utility/sk-mfm-cheatsheet.ts` (Phase 9.1) |

## Phase 10.6

All `skStrings` keys above now also exist in `locales/ja-JP.yml` under the same names (Japanese only; Crowdin propagates). Components still read `skStrings`.

## Phase 10.1/10.2 — MIGRATED to locale files

The `skSettings.*`, `welcomeEntranceStyle*`, and `settingsMigrating` keys above now live in
`locales/en-US.yml` and `locales/ja-JP.yml` (`_skSettings.*` section, plus flat donor-canonical
pref labels such as `collapseNotesRepliedTo`, `showVisibilitySelectorOnBoost`,
`numberOfReplies`). `pages/settings/sharkey.vue`, `pages/settings/index.vue`, and
`pref-migrate.ts` read `i18n.ts`, and the entries are deleted from `sk-strings.ts`.
The flat pref labels double as the settings rows added for the former dead prefs
(`collapseFiles`, `disableCatSpeak`, `enableFaviconNotificationDot`,
`notificationClickable`, `searchEngine`, `warnMissingAltText`,
`showTranslationButtonInNoteFooter`).

## Not strings, but related

- `expandLongNote` pref: now in `preferences/def.ts` (default `false`, Sharkey default).
- Backend endpoints/fields absent from Misskey: see `docs/sk-port/README.md`, section "Known gaps".
