# utility/sk-media-player.ts

- Donor: inline logic in `MkMediaVideo.vue` / `MkMediaAudio.vue`
- Target: `utility/sk-media-player.ts`, test `test/unit/sk-media-player.test.ts`
- No upstream equivalent helper exists (upstream's `filters/hms.ts` is wrapped, not replaced).

## Exports
`DEFAULT_VOLUME` (0.25), `VOLUME_STEP`, `SEEK_STEP_SECONDS` (5), `PLAYBACK_SPEEDS` (`{label,value}[]`, 0.25x..2.0x), `clampVolume`, `stepVolume` (rounds to 2 decimals to avoid float drift), `toggleMuteVolume`, `seekTarget` (clamps; tolerates NaN/Infinity duration), `ratioToSeconds`, `elapsedRatio`, `bufferedRatio` (both return 0 when duration unknown; donor returned Infinity/NaN), `formatMediaTime` (wraps `hms`, NaN -> 0).

## Tests
`test/unit/sk-media-player.test.ts` mocks `@/i18n.js` because `filters/hms` imports it.
