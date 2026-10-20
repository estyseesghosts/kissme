# Search-result window port

- Donor: `/Users/terezi/Local Documents/fedifedifedi/Sharkey/packages/frontend/src/components/SkSearchResultWindow.vue`
- Target: `packages/frontend/src/components/SkSearchResultWindow.vue`
- SPDX header kept (marie / Sharkey contributors).

## What it is

`MkWindow` wrapper that renders a `notes/search` paginator (`MkNotesTimeline`)
for the search widget / search page flow. Opened from `pages/search.note.vue`
and `widgets/WidgetSearch.vue`. Header shows the stock
`i18n.ts.searchResult` key with a `ti ti-search` icon.

## Adapted

- Icons (Phosphor to Tabler): header icon is `ti ti-search`.
- Strings: stock only (`searchResult`). No new locale keys, no `sk-strings`
  involvement at any point.
- Takes a ready-made `Paginator<'notes/search'>` (`notes/search` is a stock
  typed endpoint); no untyped casts.

## Known gaps

- Search backend behavior (e.g. credential-gated providers) is unchanged
  stock behavior; the window only presents the paginator.
- No browser verification; covered only by typecheck and unit tests of the
  surrounding search flow.
