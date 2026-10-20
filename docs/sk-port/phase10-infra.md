# Phase 10.4-10.7: config, boot, build, themes, locales, embed

Per-file notes for the infra slices. Backend untouched. No live/browser smoke (by direction).

## 10.4 frontend-shared and boot

| File | Result |
|---|---|
| `frontend-shared/js/config.ts` | Unchanged. Split-mode logic verified by reading: `backendUrlOverride` = `?backend=` query, else `instance_url` meta, else `location.href`; `apiUrl`/`wsOrigin` derive from `address.origin`. The Vite dev proxy uses `VITE_BACKEND_URL`-style `url` from `.config/default.yml`. Sharkey's `instanceName` fallback (`'Sharkey'`) not adopted; upstream compares against `'Misskey'`. |
| `frontend-shared/js/i18n.ts` | Unchanged. Upstream masking proxy and `Tsx` kept; typecheck does not demand Sharkey's simplified `Tsx`. |
| `frontend-shared/js/emoji-base.ts` | Added `char2tossfaceFilePath` (e50a -> twemoji, drops `fe0f`, null-filter, `padStart(4,'0')`) and applied the null-filter and `padStart` to `char2fluentEmojiFilePath`. Unit test `test/unit/emoji-base.test.ts`. The `/tossface/` path is only a URL; no Tossface assets exist in this tree (see follow-ups). |
| `frontend-shared/js/emojilist.ts` | Unchanged (upstream `@misskey-dev/emoji-data` kept; Sharkey json not vendored). |
| `frontend-shared/js/url.ts` | Already has `tryParseUrl` (landed earlier, tested). No change. |
| `frontend-shared/js/const.ts` | Added Sharkey `notificationTypes`, `obsoleteNotificationTypes`, `ROLE_POLICIES`, and MFM tag `followmouse` (+ params), which `MkMfm` already renders. The donor's `scheduledNoteFailed` was renamed `scheduledNotePostFailed` to match the upstream notification type that `MkNotification.vue` uses. Not added: MFM tags `crop` and `fade` (see follow-ups). MIME entries already present (`FILE_TYPE_BROWSERSAFE_SHARKEY`); upstream watermark/effector/search-index entries kept. Name overlap: `notificationTypes` in this module is not the one in misskey-js; no module imports both. |
| `frontend/src/boot/common.ts` | Kept upstream (locale HMR, `themeManager`, analytics, safe mode). Added viewport clamp for smartphone/tablet (idempotent; appends `minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover` once, after `overridedDeviceKind` is applied). Locale loading is untouched: upstream's boot reads the locale JSON per `lang`, not Sharkey's `langsVersion` path. |
| `frontend/src/boot/main-boot.ts` | Kept upstream. Added: favicon dot (`setFavIconDot`, gated by pref `enableFaviconNotificationDot`; shown at boot if unread, on `unreadNotification`, cleared on `readAllNotifications`); `myTokenRegenerated` -> `signout()`; pref migration call (below). Live emoji add/update/delete handlers already exist upstream (inside the `realtimeMode` block), so nothing was added. |
| `frontend/src/utility/favicon-dot.ts` | Already landed in Phase 9; only wired here. |

### pref-migrate call site

`main-boot.ts`, right before the `MkUpdated` popup:

```ts
if ($i && shouldMigrateOldSettings(lastVersion)) {
	migrateOldSettings();
}
```

`lastVersion` is what `common()` already returns. `shouldMigrateOldSettings` (from `@/pref-migrate`) does the `compareVersions('2025.3.2-alpha.0', lastVersion) === 1` check and is false for a missing or malformed version. The condition does not require `isClientUpdated`; it holds only for clients last used on a version older than 2025.3.2-alpha.0. The migration needs the signed-in API (registry reads), hence `$i`.

## 10.5 deps and build

Nothing to add; the dependency and config merge had already happened.

- Present: `@ruffle-rs/ruffle` (esm.sh-proxy plugin and `_RUFFLE_VERSION_` define in `vite.config.ts`), `katex`, `@types/katex`, `vuedraggable`.
- `promise-limit`: not added. `SkUrlPreviewGroup.vue` inlines a minimal limiter with the same contract.
- `photoswipe`: not added (Phase 4 decision: upstream lightbox, no PhotoSwipe).
- `uuid`: not added to `frontend`. `genId` replaces it there (`frontend-embed` already uses `uuid` itself).
- `@transfem-org/sfm-js` (MFM fork): not adopted; `mfm-js` stays. The fork's extra syntax is only needed for `fade`/`crop`, which are not ported.
- Vite config: no changes. Kept `VITE_BASE`, proxy, postbuild, GLSL, unref-i18n. Not added: `pluginReplaceIcons` (no icon pipeline need), `__VUE_OPTIONS_API__` stays `false` (no ported Sk* file uses Options API), Sharkey emoji dist aliases (`/fluent-emojis/`, `/tossface/`; no such packages here).
- `SPLIT_BUILD.md` does not exist in this tree (only `SPLIT_FINISH_GUIDE.md`, which describes creating it). Build gate: `pnpm --filter frontend build` runs the i18n/locale bundles and `postbuild.mjs` and finishes with `[postbuild] index.html generated.`

## 10.6 themes and locales

- Themes `rosepine.json5` and `rosepine-dawn.json5` copied verbatim from the donor into `frontend-shared/themes/` and registered in `getBuiltinThemes()` (`frontend-shared/js/theme.ts`), which feeds the settings theme picker. Upstream themes untouched. The storybook preload list is not changed.
- `locales/ja-JP.yml`: appended one block of top-level keys, same names as `skStrings` (flat entries plus nested `animatedMFM` and `mfmCheatsheet` with 39 sections). Japanese written for this port (the donor has no ja-JP text for them). No other locale file touched. `packages/i18n/src/autogen/locale.ts` regenerated (`pnpm --filter i18n generate`). Components still read `skStrings`; moving them to `i18n.ts.*` is a later cleanup (see MISSING-STRINGS.md).
- Keys are the same as in `MISSING-STRINGS.md`; added to the "Not strings" note there.

## 10.7 misskey-js and embed

- `misskey-js`: no change, no autogen run. Earlier phases deliberately cast untyped endpoints (`notes/following`, `admin/approve-user`, `notes/versions`, `notes/schedule/*`, ...); several are not stock Misskey endpoints, so typing them would be wrong for this tree. No ported UI needs a missing endpoint that exists in the backend.
- `frontend-embed`: nothing ported. The donor's embed has no Tossface or tracker handling (`grep -i tossface|tracker` is empty), and its `EmCustomEmoji` / `EmReactionsViewer` are older than upstream (their deltas would regress the upstream `emoji-name.ts` helpers and `reactions` array handling). Donor `EmMfm` additions are `fade`/`crop`/`followmouse` and `<bdi>` wrapping; the embed stylesheet has no `mfm-fade` keyframes, so these were left out. `EmEmoji.vue` still uses twemoji only.

## Follow-up slice proposals

1. Tossface and Fluent emoji assets: ship `/tossface/*.svg` (a package or backend-served path, Pinetree) and add a `emojiStyle` choice that uses `char2tossfaceFilePath`; add dev aliases in `vite.config.ts` once a package exists.
2. MFM `fade` and `crop`: add `MkMfm` cases + `mfm-fade` keyframes (and embed equivalents), then add the tags to `MFM_TAGS`/`MFM_PARAMS` for autocomplete. Needs a decision on the `<bdi>` wrapping.
3. RuffleSans: bundle or proxy the Ruffle fallback font so Flash text renders without esm.sh.
4. Bubble timeline wiring: `TimelinePageSrc` lacks `'bubble'` (currently a typecheck problem only while 10.1 is in flight; confirm it is resolved there).
5. Settings UI for prefs added earlier without a UI (`showWordMuteTester`, `showAttributionDomains`, `showTickerOnReplies`, `oneko`, `welcomeEntranceStyle`, `enableFaviconNotificationDot` if still missing).
6. (Done) `skStrings` consumers moved to `i18n.ts.*`; the module is deleted.
