# SkDateSeparatedList

- Donor: `/Users/terezi/Local Documents/fedifedifedi/Sharkey/packages/frontend/src/components/SkDateSeparatedList.vue`
- Target: `/Users/terezi/Local Documents/misskey/packages/frontend/src/components/SkDateSeparatedList.vue`

## Ported as-is
Generic list built on upstream's `makeDateSeparatedTimelineComputedRef`. Upstream `utility/timeline-date-separate.ts` is a superset of the donor's (adds `isSeparatorNeeded`, `getSeparatorInfo`), so the donor util is not copied. Unit tests: `test/unit/timeline-date-separate.test.ts`.
