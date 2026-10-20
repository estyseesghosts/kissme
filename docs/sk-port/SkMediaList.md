# SkMediaList

- Donor: `/Users/terezi/Local Documents/fedifedifedi/Sharkey/packages/frontend/src/components/MkMediaList.vue`
- Target: `/Users/terezi/Local Documents/misskey/packages/frontend/src/components/SkMediaList.vue`

## Ported
Built on upstream `MkMediaList.vue` (stock path kept as-is): previewable/nonPreviewable split, per-item marker (`data-marker`), `onMediaClick` -> `openGallery` -> `MkLightbox` (via `os.popupAsyncWithDialog`), `imageNewTab`, `showMediaListByGridInWideArea`, `mediaListWithOneImageAppearance` aspect-ratio classes and `calcAspectRatio`. Props (`mediaList`, `user`, `raw`) and the exposed `openGallery` are identical, so it is a drop-in.

Sharkey parts added:
- Classification through `utility/sk-media-types.ts` (`classifySkMedia`, `isSkPreviewable`) instead of upstream `isPreviewable`.
- `SkModPlayer` (prop `module`) for tracker modules and `SkFlashPlayer` (prop `flashFile`) for Flash content, rendered inline in the grid.
- `SkMediaBanner`, `SkMediaImage`, `SkMediaVideo` replace the Mk equivalents (SkMediaImage is assumed to be a drop-in for MkMediaImage props/events/exposes incl. `marker`, `isRevealed`, `mediaClick`).

## Changed vs donor
- PhotoSwipe is NOT used (not a dependency); the donor's lightbox code is dropped and images open the stock `MkLightbox`.
- Tracker/flash items are inline-only: they are not passed to the lightbox (`getType` only supports image/video/audio). `openGallery()` without id opens the first image/video.
- Audio: `isSkPreviewable` excludes audio, so audio files render as banners (Sharkey behavior), not as the upstream inline `MkMediaAudio`. `SkMediaAudio` is therefore not imported here.
- `.root` keeps upstream `container-type: inline-size` (needed by the wide-area grid), not the donor's `cursor: auto`.

## Prefs read
`showMediaListByGridInWideArea`, `mediaListWithOneImageAppearance`, `imageNewTab` (all already in def.ts).

## Known gaps
Not browser-tested. Depends on SkMediaBanner/Image/Video, SkModPlayer, SkFlashPlayer landing from sibling slices.
