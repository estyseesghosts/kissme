# SkNoteHeader.vue port

- Donor: `/Users/terezi/Local Documents/fedifedifedi/Sharkey/packages/frontend/src/components/SkNoteHeader.vue`
- Target: `/Users/terezi/Local Documents/misskey/packages/frontend/src/components/SkNoteHeader.vue`
- SPDX header kept (marie / Sharkey contributors).

## What it is

Sharkey-style note header (avatar name, account, timestamp, visibility / local-only /
channel badges, instance ticker). Two layouts: full (`SkNote`) and `classic`
(`SkNoteSimple`, `SkNoteSub`). Used by `SkNote`, `SkNoteSimple` and `SkNoteSub`;
`SkNoteDetailed` renders its own header variant instead.

## Adapted

- Donor call sites pass `:mini="true"` (`SkNote`, `SkNoteSub`); the donor
  header only declares `classic`, so `mini` is a meaningless fallthrough
  attribute. The port drops it at the call sites.
- Icons (Phosphor to Tabler): visibility `home` / `followers` / `specified`,
  `localOnly`, channel badges all use `ti-*`. `@phosphor-icons/web` is not added.
- Instance ticker is `SkInstanceTicker` (Phase 9.1), shown per the stock
  `instanceTicker` display pref; the compact/classic header additionally needs
  pref `showTickerOnReplies` (default `false`) and a non-mobile viewport.
  Clicking the ticker opens the note on the original instance
  (`showNoteOnOriginalInstance`, Phase 9.4 util).
- `bot` badge text kept hard-coded, as in the donor.
- No endpoint casts (pure client-side rendering).

## Known gaps

- `SkNote` shows the header; the donor's header-compute-but-never-render
  ticker path is not reproduced (the ticker renders only where the donor
  renders it).
- No browser verification; covered only by typecheck.
