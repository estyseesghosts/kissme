# Following feed (Phase 7)

- Donor: `types/following-feed.ts`, `utility/following-feed-utils.ts`, `components/Sk{RemoteFollowersWarning,FollowingFeedEntry,FollowingRecentNotes,UserRecentNotes}.vue`, `pages/following-feed.vue`, `pages/user/recent-notes.vue`. There is no donor `utility/following-feed.ts`.
- Target: same paths under `packages/frontend/src`.

## Behavior
- `/following-feed`: two-pane page (latest note per followed user, plus the selected user's recent notes). Tabs: following, mutuals, followers. On narrow containers the detail pane is hidden and selecting a user navigates to `/following-feed/:userId` (standalone `pages/user/recent-notes.vue`).
- State lives in pref `followingFeed` (default `defaultFollowingFeedState`); `createModel()` reads/writes it. The `withNonPublic` getter is forced to `false` on the followers tab.
- Nav entry `skFollowingFeed` in `navbar.ts`, shown only when pref `showFollowingFeedNav` is on (default off) and signed in.

## Deviations
- Uses `SkPagination` (not upstream `MkPagination`), and `useMuteOverrides` from `sk-check-mute.ts`.
- `notes/following` is a Sharkey endpoint absent from misskey-js and stock Misskey; the `Paging` endpoint is cast. Without it the list shows its error state.
- The detail pane is a plain `div` instead of `MkLazy` (upstream `MkLazy` exposes neither `showing` nor `rootEl`); "pane visible" is read from computed `display`.
- `getNoteSummary(note, { showFiles: false })` (upstream signature). Router push uses the typed `/following-feed/:userId` form.
- Strings come from `i18n.ts` (trailing Sharkey locale section in both locale files; donor wording).
- Routes added to `router.definition.ts` with `loginRequired`; Phase 10.3 should consolidate them. The donor's own router lists them twice; only one copy is kept here.

## Tests
`test/unit/following-feed-utils.test.ts`: tab names/icons, model defaults, save merging, followers-tab rule, options menu disabling.

## Deferred
Settings UI for `followingFeed`/`showFollowingFeedNav` (Phase 10). Backend `notes/following` and live behavior unverified.
