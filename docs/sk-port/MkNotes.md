# MkNotes

- Donor: `/Users/terezi/Local Documents/fedifedifedi/Sharkey/packages/frontend/src/components/MkNotes.vue`
- Target: `/Users/terezi/Local Documents/misskey/packages/frontend/src/components/MkNotes.vue`

## Deviations
- Uses `SkPagination` instead of Sharkey's `MkPagination` (see SkPagination.md). Props/emit are otherwise unchanged: `pagination: Paging`, `noGap`, `disableAutoLoad`; emits `expandMute`.
- Renders `DynamicNote` with `withHardMute`, so the `noteDesign` pref selects Misskey or Sharkey notes.
- Ad slot (`_shouldInsertAd_`) uses `MkAd` with `preferForms`; hidden when empty.
