# MkNotifications.vue

- Donor: `/Users/terezi/Local Documents/fedifedifedi/Sharkey/packages/frontend/src/components/MkNotifications.vue`
- Target: `packages/frontend/src/components/MkNotifications.vue`
- Coexists with upstream `MkStreamingNotificationsTimeline.vue` (untouched, still the one used by upstream pages).

Thin wrapper: pull-to-refresh (`MkPullToRefresh` when `enablePullToRefresh`) + `SkPagination` + `SkTransitionGroup`, rendering `DynamicNote` for reply/quote/mention and the existing `MkNotification` otherwise. Streams `notification`/`notificationFlushed` on the `main` channel and prepends.

## Changes from the donor
- `SkPagination` instead of `MkPagination`; `notificationTypes` imported from `misskey-js`.
- Typing fixes only (`NotificationItem` cast helper; the note branch also checks `'note' in notification`, as upstream does for grouped items).
- Uses the existing `useGroupedNotifications` pref (`i/notifications-grouped` vs `i/notifications`).

## Not verified
No live check.
