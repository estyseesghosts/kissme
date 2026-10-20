# MkTimeline.vue (+ utility/sk-timeline-query.ts)

- Donor: `/Users/terezi/Local Documents/fedifedifedi/Sharkey/packages/frontend/src/components/MkTimeline.vue`
- Target: `packages/frontend/src/components/MkTimeline.vue`, `packages/frontend/src/utility/sk-timeline-query.ts`
- Coexists with upstream `MkStreamingNotesTimeline`/`MkNotesTimeline` (untouched). Nothing imports `MkTimeline` yet; pages that consume it come in later phases.

## Changes from the donor
- The source->endpoint+params builder and the source->stream-channel builder moved out of the component into `sk-timeline-query.ts` (`buildTimelineQuery`, `buildTimelineChannel`) so they are unit-tested (`test/unit/sk-timeline-query.test.ts`: each of home/local/social/bubble/global/mentions/directs/list/antenna/channel/role).
- Uses `SkPagination` (see SkPagination.md) and `SkTransitionGroup` (falls back to a plain tag when `prefer.s.animation` is off).
- `paginationQuery` is a `shallowRef` (the donor used a plain `let`, so a source change would not re-render).
- **Deviation:** `mentions` builds `notes/mentions` with empty params. The donor set `query = null`, which made its `endpoint && query` check skip pagination entirely.
- `prepend`, `notesPerOneAd` (`_shouldInsertAd_`), and the note sfx are as donor.
- Typed channel names: `bubbleTimeline` and the `notes/bubble-timeline` endpoint are absent from misskey-js, so they go through casts.

## Prefs
Added to `preferences/def.ts`, default matching Sharkey: `showGapBetweenNotesInTimeline` (false), `disableStreamingTimeline` (false).

## Live reply append (decision)
Not needed by `MkTimeline` (it never used `use/use-note-capture.ts`; the donor timeline only prepends). The upstream `composables/use-note-capture.ts` is left unchanged and no Sk variant is written in this phase. Sharkey's live reply append stays an open gap in `SkNote`.

## Not verified
No live streaming/backend check. `notes/bubble-timeline` and the `bubbleTimeline` channel exist only on Sharkey-like backends.
