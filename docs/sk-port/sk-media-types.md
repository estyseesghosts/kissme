# sk-media-types

- Donor: `isModule` / `isFlash` inside `components/MkMediaList.vue` (Sharkey develop @ 752a392d3b)
- Target: `packages/frontend/src/utility/sk-media-types.ts`, test `packages/frontend/test/unit/sk-media-types.test.ts`

Pure MIME/extension classification: `isTrackerModule`, `isFlashContent`, `isSkBrowserSafe`, `classifySkMedia` (`image | video | audio | tracker | flash | other`), `isSkPreviewable`. Unsupported types classify as `other` and fall back to `SkMediaBanner`.

Deviation from the donor: `image/jxl` and `video/x-matroska` are added in a separate `FILE_TYPE_BROWSERSAFE_SHARKEY` list in `frontend-shared/js/const.ts`, not in `FILE_TYPE_BROWSERSAFE`. The stock lightbox (`utility/lightbox.ts`) and `EmMediaList` read the latter, so adding to it would change them. The test asserts the stock `isPreviewable` stays false for both.
