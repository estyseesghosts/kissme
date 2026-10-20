# SkMediaBanner

- Donor: `Sharkey/packages/frontend/src/components/MkMediaBanner.vue`
- Target: `packages/frontend/src/components/SkMediaBanner.vue`

## Ported
Upstream `MkMediaBanner.vue` plus the donor's inline audio branch (`SkMediaAudio`, for audio/* except audio/midi) and sensitive overlay only for sensitive files.

## Changed vs donor
Reveal gate uses upstream `sensitive-file.ts` (nsfw, dataSaver, confirmWhenRevealingSensitiveMedia) instead of inline code.

## Prefs read
nsfw, dataSaver.media, confirmWhenRevealingSensitiveMedia (via sensitive-file.ts).

## Known gaps
Depends on `SkMediaAudio.vue` (other agent).
