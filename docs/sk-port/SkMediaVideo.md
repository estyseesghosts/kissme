# SkMediaVideo.vue

- Donor: `Sharkey/packages/frontend/src/components/MkMediaVideo.vue`
- Target: `components/SkMediaVideo.vue` (pure logic in `utility/sk-media-player.ts`, see `sk-media-player.md`)
- Upstream `MkMediaVideo.vue` (thumbnail + lightbox) is untouched. This is the donor's inline player as a coexisting file.

## Ported
Props unchanged (`video: DriveFile`). Container with `controlsShowing` (hover show/hide with 100ms leave delay), custom controls (play/pause, seekbar with buffer, time, volume slider default 0.25, mute, download, settings menu, fullscreen), `v-hotkey` up/down/left/right/space, native-UI fallback (`useNativeUiForVideoAudioPlayer`), poster / playsinline / preload=metadata, autoplay-muted-loop for audio-less clips, sensitive gate and highlight, hide button + ALT/sensitive indicators, onActivated/onDeactivated re-init.

## Changed vs donor
- Sensitive gate uses upstream `utility/sensitive-file.ts` (`shouldHideFileByDefault`, `canRevealFile`), which has identical logic to the donor's inline code. No `sk-media-sensitive.ts` existed.
- Menu: loop, speed (upstream's array-form `radio` options), PiP, then upstream `getFileMenu()` (hide, mod mark-sensitive, drive/moderation links, dev copy file id) replaces the donor's hand-written copy of the same items.
- `defineExpose<MediaComponentExposes>({ isRevealed })` added so SkMediaList can track reveal state.
- `ph-download` -> `ti ti-download`; typo `@cilick.stop` -> `@click.stop`.
- `MkMediaRange` is the stock upstream one; the donor's `sliderBgWhite` prop does not exist upstream and is not passed, so the seekbar uses the upstream accent colouring.
- Keymap math, mute toggle, ratios and time format use `sk-media-player.ts`.

## Prefs read
`nsfw`, `dataSaver.media`, `highlightSensitiveMedia`, `confirmWhenRevealingSensitiveMedia`, `useNativeUiForVideoAudioPlayer`, `devMode` (via getFileMenu). All exist.

## Known gaps
Not exercised in a browser. Right-click keeps the browser's native menu (as donor), no custom context menu. i18n keys all exist in en-US.
