# Missing i18n strings (Sharkey frontend port)

Sharkey UI strings used by the ported `Sk*` components that Misskey's `locales/en-US.yml`
does not have. Nothing has been added to any locale file.

All of them live in one module: `packages/frontend/src/utility/sk-strings.ts`. Components
import `skStrings` from there, so there is one wording per key.

To settle them later: move each key into `locales/en-US.yml` (and `ja-JP.yml`), switch the
components to `i18n.ts.<key>`, and delete the entry from `sk-strings.ts`.

| Key in `skStrings` | English text | Used in |
|---|---|---|
| `noteIsFlaggedAs` | `Flagged as: {cw}` | `components/SkMutedNote.vue` |
| `userIsFlaggedAs` | `{name} is flagged as: {cw}` | `components/SkMutedNote.vue` |
| `instanceIsFlaggedAs` | `{name} is flagged as: {cw}` | `components/SkMutedNote.vue` |
| `userSaysSomethingInMutedNote` | `{name} posted a muted note` | `components/SkMutedNote.vue` |
| `userSaysSomethingInMutedThread` | `{name} posted in a muted thread` | `components/SkMutedNote.vue` |
| `silencedUserSaysSomething` | `{name} ({host}) is silenced and posted` | `components/SkMutedNote.vue` |
| `silencedInstanceSaysSomething` | `{name} is from a silenced instance and posted` | `components/SkMutedNote.vue` |
| `writtenBy` | `Written by {user}` | `components/SkUrlPreview.vue` |
| `fetchLinkedNote` | `Fetch linked note` | `components/SkUrlPreview.vue` |
| `quoted` | `Quoted.` | `SkNote.vue`, `SkNoteSub.vue`, `SkNoteDetailed.vue` |
| `rmboost` | `Removed boost.` | `SkNote.vue`, `SkNoteSub.vue`, `SkNoteDetailed.vue` |
| `noteFooterLabel` | `Note actions` | `SkNote.vue`, `SkNoteSub.vue`, `SkNoteDetailed.vue`, `SkOldNoteWindow.vue` |
| `animatedMFM.play` | `Play` | `SkNote.vue`, `SkNoteDetailed.vue` |
| `animatedMFM.stop` | `Stop` | `SkNote.vue`, `SkNoteDetailed.vue` |
| `animatedMFM.alertText` | `Animated MFM may be distracting. Play it anyway?` | `SkNote.vue`, `SkNoteDetailed.vue` |
| `animatedMFM.alertConfirm` | `Play` | `SkNote.vue`, `SkNoteDetailed.vue` |
| `translationFailed` | `Translation failed` | `components/SkNoteTranslation.vue` |
| `cannotLoadNote` | `Cannot load note` | `components/SkFetchNote.vue` |
| `externalWarningTitle` | `External website` | `components/MkUrlWarningDialog.vue` |
| `externalWarningDescription` | `This link goes to a website outside {host}. Check that you trust it before you continue.` | `components/MkUrlWarningDialog.vue` |
| `externalWarningTrust` | `Trust this domain` | `components/MkUrlWarningDialog.vue` |

## Not strings, but related

- `expandLongNote` pref: now in `preferences/def.ts` (default `false`, Sharkey default).
- Backend endpoints/fields absent from Misskey: see `docs/sk-port/README.md`, section "Known gaps".
