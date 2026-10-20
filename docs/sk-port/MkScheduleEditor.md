# MkScheduleEditor.vue (+ utility/sk-schedule.ts)

- Donor: `/Users/terezi/Local Documents/fedifedifedi/Sharkey/packages/frontend/src/components/MkScheduleEditor.vue`
- Target: `components/MkScheduleEditor.vue`, `utility/sk-schedule.ts`

Date + time inputs; `v-model` is `{ scheduledAt: number | null }` (the donor's field name; the handoff's `scheduleAt` is the same thing).

## Changes from the donor
- The date/time logic moved to `utility/sk-schedule.ts` (`defaultScheduleParts`, `splitScheduledAt`, `joinScheduledAt`), with unit tests (`test/unit/sk-schedule.test.ts`).
- Timestamp is built from explicit parts, not `new Date('yyyy-MM-dd HH:mm')` (not portable across engines). Empty or impossible input (e.g. 2025-02-31) yields `scheduledAt: null` instead of `NaN`.
- Label `i18n.ts.postOn` is not in en-US.yml -> `skStrings.postOn`.
- No `deep: true` watcher option (watching two refs, not needed).

## Not verified
Rendering in a browser.
