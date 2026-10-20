# SkModPlayer

- Donor: `/Users/terezi/Local Documents/fedifedifedi/Sharkey/packages/frontend/src/components/SkModPlayer.vue`
- Target: `/Users/terezi/Local Documents/misskey/packages/frontend/src/components/SkModPlayer.vue`

Tracker module (.mod/.xm/.it/.s3m ...) player; renders the live pattern on canvases using chiptune2 + vendored libopenmpt.

## Ported
Template, canvas slice renderer, seek/scroll/slider logic and styles as in the donor. Prop `module: DriveFile`.

## Changed vs donor
- Phosphor icons became Tabler (`ti ti-eye`, `eye-off`, `player-play/pause/stop`, `download`, `alert-triangle`).
- Layout constants and pure helpers (row number hex, channel clamp, widths, row text, scroll columns, channels in view) moved to `utility/sk-mod-player.ts` (see sk-mod-player.md).
- Graceful degradation: if `AudioContext` is missing the component shows an error placeholder instead of constructing the player; a failed fetch/decode (`load().catch`) sets `loadError` and shows the same placeholder instead of leaving a dead player. `playPause/stop/performSeek` bail out when audio is unsupported or no buffer is loaded.
- "Pattern Hidden", "Module failed to load" and "Audio playback is not supported in this browser." now live in the trailing Sharkey locale section (`i18n.ts.modPatternHidden`, `.modFailedToLoad`, `.modAudioUnsupported`).
- `buffer` is typed `ArrayBuffer | null`.

## Prefs read
`nsfw` (`force` hides always; `ignore` never hides; otherwise hides sensitive files). The donor does not use `confirmWhenRevealingSensitiveMedia`, so neither does this port.

## Known gaps
No browser testing. The module is still fetched on mount even when hidden by the sensitive gate (donor behavior).
