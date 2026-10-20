# Note error list port

- Donor: Sharkey `SkErrorList` (surfaced in slice `ceacd1d2c1`)
- Target: `packages/frontend/src/components/SkErrorList.vue`
- SPDX header kept.

## What it is

Renders a viewed note's `processErrors` (quote-unavailable, attachment-failed)
as a caution block matching `MkRemoteCaution` styling. Rendered from the Sk*
note components. Unknown codes fall back to the raw code string.

## Adapted

- Icons: `ti ti-alert-triangle` (no Phosphor in the donor here).
- Strings: stock `_processErrors.*` keys, read through a cast (`i18n.ts` types
  the section without a string index signature). Texts were migrated with the
  note-loading-state batch; no `sk-strings` involvement remains.
- No endpoint casts (renders data the note already carries).

## Known gaps

- Only codes the client knows are humanized; anything else shows the raw code.
- No browser verification; covered only by typecheck.
