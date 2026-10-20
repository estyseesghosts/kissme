# Missing i18n strings (Sharkey frontend port)

Sharkey strings that are used by the ported `Sk*` components but are **not** in Misskey's
`locales/en-US.yml`. Nothing has been added to any locale file. The port is no longer
constrained to match upstream strings, so these are collected here for a later pass.

Where a key is not yet present in the port, the component either uses a local English
string (marked below) or drops the feature. Once the strings are settled, they should move
into `locales/en-US.yml` (and `ja-JP.yml`), and the local copies removed.

## Used now (ported)

| Key | Used in | Current handling | English text in port |
|---|---|---|---|
| `noteIsFlaggedAs` | `components/SkMutedNote.vue` | local `skStrings` | `Flagged as: {cw}` |
| `userIsFlaggedAs` | `components/SkMutedNote.vue` | local `skStrings` | `{name} is flagged as: {cw}` |
| `instanceIsFlaggedAs` | `components/SkMutedNote.vue` | local `skStrings` | `{name} is flagged as: {cw}` |
| `userSaysSomethingInMutedNote` | `components/SkMutedNote.vue` | local `skStrings` | `{name} posted a muted note` |
| `userSaysSomethingInMutedThread` | `components/SkMutedNote.vue` | local `skStrings` | `{name} posted in a muted thread` |
| `silencedUserSaysSomething` | `components/SkMutedNote.vue` | local `skStrings` | `{name} ({host}) is silenced and posted` |
| `silencedInstanceSaysSomething` | `components/SkMutedNote.vue` | local `skStrings` | `{name} is from a silenced instance and posted` |

## Needed by upcoming slices (not yet ported)

| Key | Expected use | Source slice | Status |
|---|---|---|---|
| `renoteShift` | renote tooltip (shift-click hint) | 1.4 `utility/boost-quote.ts` | Dropped from tooltip. `en-US` has no key. |
| `translationFailed` | translation error state | 1.3 `components/SkNoteTranslation.vue` | Not ported yet |
| `cannotLoadNote` | load error | 1.3 `components/SkFetchNote.vue` | Not ported yet |
| `quoted` | quote label | 1.2 `SkNote.vue` / 1.4 | Not ported yet |
| `rmboost` | un-boost label | 1.2 `SkNote.vue` / 1.4 | Not ported yet |
| `noteFooterLabel` | footer aria/label text | 1.2 `SkNote.vue` | Not ported yet |
| `_animatedMFM.play` | animated MFM play button | 1.2 `SkNote.vue` | Not ported yet |
| `_animatedMFM.stop` | animated MFM stop button | 1.2 `SkNote.vue` | Not ported yet |
| `_animatedMFM._alert.text` | animated MFM warning body | 1.2 `SkNote.vue` | Not ported yet |
| `_animatedMFM._alert.confirm` | animated MFM warning confirm | 1.2 `SkNote.vue` | Not ported yet |

## Related, not strings

- Pref `expandLongNote` (used by `SkNote.vue`) is not in `preferences/def.ts`.
- Backend endpoints used by the Sk* components that Misskey does not expose: `notes/like`,
  `notes/versions`, `notes/schedule/create|delete`. These are blocked on backend work.
