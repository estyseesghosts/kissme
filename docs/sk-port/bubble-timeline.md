# Bubble timeline UI (Gap 4)

- Donor: `timelines.ts:9-52` (`bubble` in `basicTimelineTypes`, `ti-drop` icon,
  `btlAvailable` gate), `store.ts:72` (tl.src union), `components/MkTimeline.vue`
  (`notes/bubble-timeline` endpoint + `bubbleTimeline` channel, `withRenotes`/
  `withFiles`/`withBots`, no `withReplies`), `pages/timeline.vue`
  (`srcWhenNotSignin`, `saveSrc`), `ui/deck/tl-column.vue` (`setType` items),
  `widgets/WidgetTimeline.vue` (inherits via `availableBasicTimelines`).
- Target: same paths under `packages/frontend/src`, plus the spec'd
  `utility/sk-timeline-query.ts` (`buildTimelineQuery`/`buildTimelineChannel`)
  with `test/unit/sk-timeline-query.test.ts`.

## Behavior

- `bubble` joins `basicTimelineTypes` between `social` and `global` (donor
  order). Tabs on the timeline page, deck column picker, and widget menu pick it
  up automatically through `availableBasicTimelines()`.
- `isAvailableBasicTimeline('bubble')` reads `btlAvailable` through a tolerant
  cast: `($i == null ? instance.policies : $i.policies)`. The key is Sharkey-only
  and absent from misskey-js `RolePolicies`; backends that do not advertise it
  (falsy/undefined) hide the tab instead of showing dead UI.
- Renderer is `MkStreamingNotesTimeline` (smallest clean diff; the consumerless
  `MkTimeline.vue` stays deleted). Its new `bubble` branch is the only caller of
  `buildTimelineQuery`/`buildTimelineChannel`: `notes/bubble-timeline` endpoint
  via untyped cast, `bubbleTimeline` channel via cast shaped like the global
  timeline channel, params `{ withRenotes, withFiles, withBots }`, no
  `withReplies` (donor shape).
- Backends without the endpoint answer `UNKNOWN_API_ENDPOINT`; the paginator's
  existing `MkError` + retry state surfaces it honestly. No backend changes:
  `notes/bubble-timeline` and the `bubbleTimeline` channel exist only on
  Sharkey-like backends.
- `withBots` prop added to the renderer (default `true`, matching the store
  `tl.filter.withBots` default); only the bubble branch sends it, so other
  timelines' requests are byte-identical to stock.
- `tl.src` union and logged-out `srcWhenNotSignin`/`saveSrc` accept `bubble`.
  New locale keys `_timelines.bubble` and `_timelineDescription.bubble` in both
  `en-US.yml` and `ja-JP.yml` (donor Sharkey has neither; the tab would render
  titleless without them). Icon is Tabler `ti ti-droplet` (no Phosphor in tree;
  donor `ph-drop`).

## Tests

- `test/unit/sk-timeline-query.test.ts`: all 11 sources for query + channel
  (bubble asserts `notes/bubble-timeline` / `bubbleTimeline`).
- Widget inherits the tab/availability/icon through shared helpers; no widget
  edit and no widget test changes.

## Not verified

- No live streaming/backend check. `notes/bubble-timeline` is absent from this
  repo's backend, so a stock dev server shows the timeline error state, not notes.
