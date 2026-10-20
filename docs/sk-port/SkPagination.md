# SkPagination

- Donor: `/Users/terezi/Local Documents/fedifedifedi/Sharkey/packages/frontend/src/components/MkPagination.vue`
- Target: `/Users/terezi/Local Documents/misskey/packages/frontend/src/components/MkPagination.vue`

## Decision (slice 2.4)
Upstream `IPaginator`, `MkPagination.vue` and `MkPaginationControl.vue` are untouched. Sharkey's legacy `Paging{endpoint,limit,params}` model is vendored as `SkPagination.vue` (renamed from `MkPagination`; type `Paging` is exported from it). Reason: Sharkey's `MkNotes`/`MkTimeline` call its imperative API (`prepend`, queue, `reload`, `status`/`queue` emits), and the later Sharkey pages that are ported pass `Paging`. Adapting them to the upstream `Paginator` would change every consumer. The two models share no state, so there is no cross-talk. `SkNoteDetailed` keeps using the upstream `Paginator` with `autoLoad=false`.

## Ported as-is
Everything; only the name changed (`MkPagination` -> `SkPagination`). Uses `types/date-separated-list.ts` for `MisskeyEntity` (also vendored).

## Not verified
No live check against a backend.
