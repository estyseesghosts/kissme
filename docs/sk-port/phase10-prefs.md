# Phase 10.1-10.3: prefs, migration, routes

## Open owner decision

**`noteDesign` defaults to `'sk'`** in `packages/frontend/src/preferences/def.ts`. The plan (and the Phase 1 exit criterion "no regression to stock MkNote* path") says `'misskey'`. This slice did not change it. Until decided, a fresh profile renders Sharkey-style notes everywhere `DynamicNote*` is used. The settings page (`/settings/sharkey`) lets users switch it.

## Store (`store.ts`)

- Added: `timelineTutorials`, `abusesTutorial`, `readDriveTip` (account scoped, Sharkey defaults), `tl.filter.withBots: true`.
- `menuDisplay` already existed upstream (`'sideFull' | 'sideIcon'`); unchanged.
- Restored from upstream's pre-removal `store.ts` (commit `8af257929d^`) as a clearly marked legacy block ("そのうち消す"), plus a Sharkey legacy block, **only as the migration source** for `pref-migrate`. Nothing else reads these keys. Not restored: `ColdDeviceStorage` (pref-migrate reads `miux:<key>` from localStorage read-only instead).
- Deviations from the plan: `accountInfos` stays `Record<string, MeDetailed>` (`Record<string, User>` fails typecheck in `accounts.ts`, which stores `$i`); `tl.src` does not gain `'bubble'` (`pages/timeline.vue` `TimelinePageSrc` has no bubble source; belongs with the deferred bubble-timeline wiring in 10.7).

## Preferences (`preferences/def.ts`, `manager.ts`)

`manager.ts` is unchanged: it is the upstream manager (Sharkey's is an older design, with no `mergeStrategy`, `definePreferences` or account/server scopes). Upstream-only blocks (`mutingEmojis`, watermark and frame presets, compression levels, `showAvailableReactionsFirstInNote`, `pollingInterval`, plugin merge strategies) are untouched.

Added in 10.1: `collapseFiles`, `disableCatSpeak`, `enableFaviconNotificationDot`, `notificationClickable`, `searchEngine`, `warnMissingAltText`. These have **no consumer in this tree yet**, so they have no settings UI (a switch that does nothing would mislead).

### Defaults table (Sharkey prefs)

"UI" = control on `/settings/sharkey` (`pages/settings/sharkey.vue`). Defaults match Sharkey unless the note says otherwise.

| Pref | Default | Sharkey default | UI | Note |
|---|---|---|---|---|
| **`noteDesign`** | `'sk'` | `'sharkey'` (renamed `'sk'`) | yes | **OPEN OWNER DECISION: plan says `'misskey'`** |
| `useSharkeyPostForm` | `false` | n/a (new gate) | yes | gate, default off |
| `useSharkeyEmojiPicker` | `false` | n/a (new gate) | yes | gate, default off |
| `useSharkeyUploader` | `false` | n/a (new gate) | yes | gate, default off |
| `mutedEmojis` | `[]` | `[]` | yes | one emoji per line |
| `showFollowingFeedNav` | `false` | n/a (new gate) | yes | |
| `showWordMuteTester` | `false` | n/a (new gate) | yes | |
| `showAttributionDomains` | `false` | n/a (new gate) | yes | |
| `welcomeEntranceStyle` | `'server'` | n/a | yes | `'a'` = `welcome.entrance.a.vue` |
| `oneko` | `false` | `false` | yes | |
| `showTickerOnReplies` | `false` | `false` | yes | |
| `showGapBetweenNotesInTimeline` | `false` | `false` | yes | |
| `disableStreamingTimeline` | `false` | `false` | yes | |
| `expandLongNote` | `false` | `false` | yes | |
| `clickToOpen` | `true` | `true` | yes | |
| `collapseNotesRepliedTo` | `false` | `false` | yes | |
| `numberOfReplies` | `5` | `5` | yes | |
| `showVisibilitySelectorOnBoost` | `true` | `true` | yes | |
| `visibilityOnBoost` | `'public'` | `'public'` | yes | |
| `uncollapseCW` | `false` | `false` | yes | |
| `autoloadConversation` | `true` | `true` | yes | |
| `warnExternalUrl` | `true` | `true` | yes | |
| `trustedDomains` | `[]` | `[]` | yes | one domain per line |
| `like` | `null` | `null` | yes | empty = default like emoji |
| `showTranslationButtonInNoteFooter` | `false` | `false` | no | already has no UI; moved by earlier phase, consumed by `SkNote*` |
| `followingFeed` | `defaultFollowingFeedState` | same | no | state, edited in the following feed page |
| `collapseFiles` | `false` | `false` | no | no consumer yet |
| `disableCatSpeak` | `false` | `false` | no | no consumer yet |
| `enableFaviconNotificationDot` | `true` | `true` | no | no consumer yet (`utility/favicon-dot.ts` exists; boot wiring is 10.4) |
| `notificationClickable` | `false` | `false` | no | no consumer yet |
| `searchEngine` | first of `searchEngineMap` | same | no | no consumer yet |
| `warnMissingAltText` | `true` | `true` | no | no consumer yet |

Not ported: Sharkey's `cornerRadius` hybrid pref and the other localStorage-synced "hybrid" prefs (`fontSize`, `lang`, ...): upstream handles those differently and they belong to the theme/boot slices.

Settings UI: `/settings/sharkey` is a new page (menu entry in `pages/settings/index.vue`, route `/settings/sharkey` in `router.definition.ts`). Strings are in `skStrings.skSettings` (and the existing `welcomeEntranceStyle*` keys); no locale edits. It does not use `SearchMarker`/`SearchLabel`, so the page is not in the settings search index (that index extracts `i18n.ts` references at build time and `skStrings` has none).

## Migration (`pref-migrate.ts`, `pref-migrate-core.ts`)

- Pure logic (`planPrefMigration`, `shouldMigrateOldSettings`) lives in `pref-migrate-core.ts`; `pref-migrate.ts` does the I/O (`i/registry/*`, localStorage `miux:*`, `prefer.commit`) and exports `migrateOldSettings` and `shouldMigrateOldSettings`.
- Gate: `compareVersions('2025.3.2-alpha.0', lastVersion) === 1` (lastVersion older). Missing or unparsable `lastVersion` does not migrate.
- Migrates registry themes, plugins (`id` -> `installId`), deck profile and profiles (malformed entries skipped), light/dark theme and `syncDeviceDarkMode`, emoji palettes, all legacy store prefs, and the Sharkey legacy state (`noteDesign` `'sharkey'` -> `'sk'`, `followingFeed` completed with defaults, `dataSaver.urlPreview` -> `urlPreviewThumbnail`). Absent values are skipped rather than committed as defaults.
- Differences from Sharkey: no `os.waiting` string from locales (`skStrings.settingsMigrating`, because upstream removed `settingsMigrating`); no `prefer.suppressReload/allowReload` (not in the upstream manager); upstream's delayed `unisonReload` (10 s) is kept; hybrid localStorage prefs are not migrated.
- **Call site (owned by 10.4, `boot/main-boot.ts`)**: not wired here. In `mainBoot()`, inside the `isClientUpdated` branch (the removed upstream code sat right after the `MkUpdated` popup):

  ```ts
  import { migrateOldSettings, shouldMigrateOldSettings } from '@/pref-migrate.js';
  // ...
  if (shouldMigrateOldSettings(lastVersion)) {
  	console.log('Preferences migration');
  	migrateOldSettings();
  }
  ```

  `lastVersion` is already returned by `common()`. The manual "migrate old settings" button on settings/other was also removed upstream and is not restored.

## Routes (`router.definition.ts`)

- Sharkey routes are one contiguous block after `/about-misskey`: `/about-sharkey`, `/unsubscribe/:user/:token` (public), `/following-feed`, `/following-feed/:userId` (both `loginRequired`). Each path appears once; the earlier duplicate placement and the "consolidate in 10.3" comments are gone.
- `/admin/approvals` stays under the admin children (Sharkey also serves it there).
- Kept: `/verify-email/:code`, `/about-misskey`, `/qr`. Added `/settings/sharkey`.
- **`/admin/server-rules`: not added.** Upstream `pages/admin/server-rules.vue` is a section component embedded in `admin/moderation.vue` (no `definePage`), not a standalone page; Sharkey's standalone route targets a different page layout. Adding the route would render a headerless fragment. Follow-up: make it a page, or keep the embedded section.
- Unknown paths resolve to the catch-all `/:(*)` not-found route. Covered by `test/unit/router-table.test.ts` (uniqueness of top-level paths, deep links, unknown paths).
