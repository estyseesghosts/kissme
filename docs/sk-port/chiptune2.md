# chiptune2

- Donor: `/Users/terezi/Local Documents/fedifedifedi/Sharkey/packages/frontend/src/utility/chiptune2.ts`
- Target: `/Users/terezi/Local Documents/misskey/packages/frontend/src/utility/chiptune2.ts`

libopenmpt wrapper (ChiptuneJsConfig, ChiptuneJsPlayer) over the vendored `utility/libopenmpt` (untouched).

## Changed vs donor
Prototype-style constructors became ES classes with identical method names/behavior so vue-tsc (strict) accepts them; internals use `any` for the emscripten module and script-processor node (file keeps `eslint-disable`). `play(null)` is a no-op. webkitAudioContext fallback typed. Original MIT header kept (see gap).

## Known gaps
`scripts/check-spdx.mjs` flags this MIT-licensed file (and `types/ruffle/**`, copied without headers); lead should exclude them like libopenmpt.
