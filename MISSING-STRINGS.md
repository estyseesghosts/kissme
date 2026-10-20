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
- `_skSettings.*` and flat pref labels (`clickToOpen`, `expandLongNote`, …).

| Key in `skStrings` | English text | Used in |
|---|---|---|

Phase 4 additions. The last column notes where the wording comes from.

| Key in `skStrings` | English text | Used in |
|---|---|---|
| `flashContentHidden` | `Flash Content Hidden` | `components/SkFlashPlayer.vue` (donor) |
| `flashPoweredByRuffle` | `Powered by Ruffle.` | `components/SkFlashPlayer.vue` (donor) |
| `flashArbitraryCodeExecutionWarning` | `Always be wary of arbitrary code execution!` | `components/SkFlashPlayer.vue` (donor) |
| `flashFailedToLoad` | `Flash Content Failed To Load:` | `components/SkFlashPlayer.vue` (donor) |
| `flashIsLoading` | `Flash Content Is Loading` | `components/SkFlashPlayer.vue` (donor) |
| `flashLoadingRufflePlayer` | `Loading Ruffle player` | `components/SkFlashPlayer.vue` (donor) |
| `flashLoadingFlashFile` | `Loading Flash file` | `components/SkFlashPlayer.vue` (donor) |
| `flashCspError` | `raw.esm.sh could not be accessed, meaning this instance's Content Security Policy is likely out of date. Please contact your instance administrators.` | `components/SkFlashPlayer.vue` (donor) |
| `modPatternHidden` | `Pattern Hidden` | `components/SkModPlayer.vue` (donor (hard-coded)) |
| `modFailedToLoad` | `Module failed to load` | `components/SkModPlayer.vue` (written for this port, donor has none) |
| `modAudioUnsupported` | `Audio playback is not supported in this browser.` | `components/SkModPlayer.vue` (written for this port, donor has none) |
| `imageLacksDescription` | `Image lacks descriptive text` | `components/SkMediaImage.vue` (donor (hard-coded)) |
| `likeNotSupported` | `This server does not support likes yet.` | `utility/sk-like.ts` (written for this port, donor has none) |
| `mutuals` | `Mutuals` | `utility/following-feed-utils.ts`, `components/SkRemoteFollowersWarning.vue` (donor) |
| `showBots` | `Show bots in timeline` | `utility/following-feed-utils.ts`, `components/SkRemoteFollowersWarning.vue` (donor) |
| `showQuotes` | `Show quotes` | `utility/following-feed-utils.ts`, `components/SkRemoteFollowersWarning.vue` (donor) |
| `showReplies` | `Show replies` | `utility/following-feed-utils.ts`, `components/SkRemoteFollowersWarning.vue` (donor) |
| `showNonPublicNotes` | `Show non-public` | `utility/following-feed-utils.ts`, `components/SkRemoteFollowersWarning.vue` (donor) |
| `remoteFollowersWarning` | `Remote followers may have incomplete or outdated activity` | `utility/following-feed-utils.ts`, `components/SkRemoteFollowersWarning.vue` (donor) |
| `approvals` | `Approvals` | `SkApprovalUser / admin approvals` (donor) |
| `approveAccount` | `Approve` | `SkApprovalUser / admin approvals` (donor) |
| `denyAccount` | `Deny and delete` | `SkApprovalUser / admin approvals` (donor) |
| `signupReason` | `Signup reason` | `SkApprovalUser / admin approvals` (donor) |
| `approveConfirm` | `Approve this account?` | `SkApprovalUser / admin approvals` (donor) |
| `denyAccountConfirm` | `Deny and delete this account? This cannot be undone.` | `SkApprovalUser / admin approvals` (donor) |
| `approvalsUnsupported` | `This server does not support account approvals.` | `SkApprovalUser / admin approvals` (donor) |
| `approvalsEmpty` | `No accounts are waiting for approval.` | `SkApprovalUser / admin approvals` (donor) |
| `wordMuteTestLabel` | `Test your mutes` | `SkPatternTest` (donor) |
| `wordMuteTestDescription` | `Enter text to check against the mutes above. Each line is tested separately.` | `SkPatternTest` (donor) |
| `wordMuteTestTest` | `Test` | `SkPatternTest` (donor) |
| `wordMuteTestNoResults` | `Enter some text and press Test.` | `SkPatternTest` (donor) |
| `wordMuteTestNoMatch` | `No mutes matched.` | `SkPatternTest` (donor) |
| `wordMuteTestMatch` | `Matched` | `SkPatternTest` (donor) |
| `wordMuteTestInvalid` | `Some mutes were skipped because they are invalid.` | `SkPatternTest` (donor) |
| `attributionDomains` | `Attribution domains` | `profile.attribution-domains-setting` (donor) |
| `attributionDomainsDescription` | `Websites listed here may credit you as an author. Enter one domain per line.` | `profile.attribution-domains-setting` (donor) |
| `attributionDomainsTutorial` | `Add this tag to the website to be credited:` | `profile.attribution-domains-setting` (donor) |
| `attributionDomainsUnsupported` | `This server does not support attribution domains.` | `profile.attribution-domains-setting` (donor) |
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
