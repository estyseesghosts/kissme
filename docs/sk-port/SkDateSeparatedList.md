# SkDateSeparatedList

- Donor: `/Users/terezi/Local Documents/fedifedifedi/Sharkey/packages/frontend/src/components/SkDateSeparatedList.vue`
- Target: `/Users/terezi/Local Documents/misskey/packages/frontend/src/components/SkDateSeparatedList.vue`

## Ported as-is
Generic list built on upstream's `makeDateSeparatedTimelineComputedRef`. Upstream `utility/timeline-date-separate.ts` is a superset of the donor's (adds `isSeparatorNeeded`, `getSeparatorInfo`), so the donor util is not copied. Unit tests: `test/unit/timeline-date-separate.test.ts`.

## Adapted

- No icon or string changes (no donor copy of its own; uses stock keys).
- Coexists with upstream `MkDateSeparatedList` (see MkDateSeparatedList.md);
  stock code untouched.

## Known gaps

- No consumer pages yet: ported ahead of the timeline pages that need it.
  Kept as tested, consumerless code (same status as `SkBadgeStrip`) rather
  than deleted, so the port stays complete for a future wiring.
- No browser verification.
