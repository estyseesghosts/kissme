# SkFlashPlayer

- Donor: `/Users/terezi/Local Documents/fedifedifedi/Sharkey/packages/frontend/src/components/SkFlashPlayer.vue`
- Target: `/Users/terezi/Local Documents/misskey/packages/frontend/src/components/SkFlashPlayer.vue`

Ruffle-based Flash (.swf) player. Prop `flashFile: DriveFile`.

## Ported
Whole component. Ruffle is loaded lazily with `await import('@ruffle-rs/ruffle')` (vite rewrites it to esm.sh); config uses `_RUFFLE_VERSION_` for `publicPath`, same hardened options as the donor (no script access, no networking, no fullscreen by Ruffle).

## Changed vs donor
- Phosphor to Tabler icons.
- `_flash.*` strings are not in en-US.yml; local `flashStrings` constants with the donor wording (reported to lead).
- Errors already degrade to a placeholder with the message (no throw); unchanged.
- Types: `src/types/ruffle/**` copied as-is from donor; added `src/types/ruffle-module.d.ts` (`declare module '@ruffle-rs/ruffle'`) because the package entry has no types.

## Prefs read
`nsfw` (same gate as the donor; no `confirmWhenRevealingSensitiveMedia` in the donor). Content also stays behind a click-to-run warning (arbitrary code).

## Known gaps
Needs CSP allowing raw.esm.sh (the component reports it). Untested in browser.
