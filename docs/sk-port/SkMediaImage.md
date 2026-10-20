# SkMediaImage

- Donor: `Sharkey/packages/frontend/src/components/MkMediaImage.vue`
- Target: `packages/frontend/src/components/SkMediaImage.vue`

## Ported
Based on upstream `MkMediaImage.vue` (drop-in: same props incl. `marker`, same `mediaClick` emit, `isRevealed` expose, upstream lightbox compatible). Sharkey features added: `title` prefers `image.comment` over name; GIF/ALT/sensitive badges stop click propagation; "lacks descriptive text" badge (`ti-pencil`, hardcoded English title as in donor).

## Changed vs donor
Upstream newer behavior kept: `sensitive-file.ts` gate (nsfw / dataSaver / confirmWhenRevealingSensitiveMedia), `getFileMenu` for the dots menu and context menu (includes moderator/mark-sensitive entries), high-quality placeholder pref, two corner buttons. No new `sk-media-sensitive.ts`: upstream `utility/sensitive-file.ts` already provides `shouldHideFileByDefault` / `canRevealFile`.

## Prefs read
nsfw, dataSaver.media, confirmWhenRevealingSensitiveMedia, highlightSensitiveMedia, enableHighQualityImagePlaceholders, loadRawImages, disableShowingAnimatedImages.

## Known gaps
Pencil badge title not localized (no key).
