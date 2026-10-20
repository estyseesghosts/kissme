# sk-mod-player (utility)

- Donor: extracted from `/Users/terezi/Local Documents/fedifedifedi/Sharkey/packages/frontend/src/components/SkModPlayer.vue`
- Target: `/Users/terezi/Local Documents/misskey/packages/frontend/src/utility/sk-mod-player.ts`, test `packages/frontend/test/unit/sk-mod-player.test.ts`

Pure helpers: `formatRowNumber`, `clampChannels`, `virtualCanvasWidth`, `sliceWidthFor`, `buildRowText`, `columnsFromScroll`, `channelsInViewFor`, layout constants. `formatPlaybackTime` (mm:ss) is new and currently unused by the component; kept for future time display.
Behavior matches the donor inline code; `clampChannels` additionally treats NaN/negative as 0.
