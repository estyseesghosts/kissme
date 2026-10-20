# SkMediaAudio.vue

- Donor: `Sharkey/packages/frontend/src/components/MkMediaAudio.vue`
- Target: `components/SkMediaAudio.vue` (pure logic in `utility/sk-media-player.ts`, see `sk-media-player.md`)
- Upstream `MkMediaAudio.vue` is untouched; this is the donor's inline player as a coexisting file.

## Ported
Props unchanged (`audio: DriveFile`). Controls grid (play/pause, seekbar with buffer, time, volume default 0.25, mute, download, settings menu), `v-hotkey` seek and volume, native `<audio controls>` fallback (`useNativeUiForVideoAudioPlayer`), preload=metadata, sensitive gate/highlight, onActivated/onDeactivated re-init.

## Changed vs donor
- Sensitive gate via upstream `utility/sensitive-file.ts`; menu tail via upstream `getFileMenu()` (hide, moderator sensitive toggle, drive/moderation links, dev copy file id). Loop and speed items stay local (array-form `radio` options).
- `defineExpose<MediaComponentExposes>({ isRevealed })` added.
- `ph-download` -> `ti ti-download`.
- Keymap math, mute toggle, ratios and time format use `sk-media-player.ts`.

## Prefs read
`nsfw`, `dataSaver.media`, `highlightSensitiveMedia`, `confirmWhenRevealingSensitiveMedia`, `useNativeUiForVideoAudioPlayer`, `devMode` (via getFileMenu). All exist.

## Known gaps
Not exercised in a browser.
