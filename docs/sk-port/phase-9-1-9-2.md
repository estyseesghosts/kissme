# Phase 9.1 / 9.2 — widgets, marquee, radio, URL warning

Donor: Sharkey `develop` @ `752a392d3b`. Frontend only. Nothing was exercised in a browser or against a backend.

## Component map

| Component | State | Where it is used | Gate |
|---|---|---|---|
| `SkInstanceTicker.vue` | New. Sharkey variant of `MkInstanceTicker` (solid colour, text outline, click handler slot). | `SkNoteHeader` (full and classic headers), `SkNoteDetailed`, `SkOldNoteWindow`. Stock `MkNote*` keep `MkInstanceTicker`. Click opens `showNoteOnOriginalInstance` (9.4 util). | Pref `instanceTicker` (existing). Compact/classic header additionally needs pref `showTickerOnReplies` (new, default `false`) and a non-mobile viewport. |
| `SkBadgeStrip.vue` | New, verbatim. Exports `Badge` type. | No consumer yet. Donor uses it in `pages/instance-info.vue` and `pages/admin-user.vue`; those pages were not touched. | None needed (no UI change). |
| `SkMfmWindow.vue` | New. Donor's 39 hand-copied blocks became a list built by `utility/sk-mfm-cheatsheet.ts`. | Button in the `MkPostForm` footer. | Only rendered when pref `useSharkeyPostForm` is on (default off). |
| `SkListenBrainz.vue` | New. Polls `users/listenbrainz` every 15 s; `utility/sk-listenbrainz.ts` validates the untyped response. | `MkUserPopup`, `pages/user/home.vue`. | Rendered only when the profile has the Sharkey-only `listenbrainz: true` field, so it is absent on stock Misskey. |
| `SkOneko.vue` | New. Pure math in `utility/sk-oneko.ts`. Asset `assets/oneko.gif`. | `ui/_common_/common.vue` (async). | Pref `oneko`, default `false`. |
| `CkFollowMouse.vue` | New. Pure math in `utility/sk-follow-mouse.ts`. | `$[followmouse]` case in `components/global/MkMfm.ts`. | Same as the other animated functions (`advancedMfm` and `animatedMfm`, i.e. `useAnim`). Stock Misskey does not know the function, so notes without it are unaffected. |
| `SkUrlPreviewGroup.vue` | Already landed in phase 1; verified present (413 lines, adapted: inlined limiter, local summaly types). Not redone. | `SkNote*`. | `noteDesign`. |
| `SkTransitionGroup.vue` | Already landed in 2.1; byte-identical to the donor. | Lists, `common.vue`. | `animation` pref fallback built in. |
| `MkMarquee.vue` | New. Donor's render-function `MarqueeText`, typed and using a CSS module. | `welcome.entrance.a.vue` (9.3, Sharkey entrance). | None. |
| `MkMarqueeText.vue` | Upstream, unchanged. | Statusbars (`statusbar-*.vue`), `WidgetRssTicker`, `welcome.entrance.classic.vue`. | None. |
| `MkRadio.vue` | New. Standalone single radio. Adds `role="radio"` and keyboard (space/enter) support that the donor lacked. | No consumer yet (donor: `admin/ads.vue`, `MkPreview.vue`). | None. |
| `MkRadios.vue` | Upstream, unchanged. It renders its own options and does not use `MkRadio`. | Settings pages. | None. |
| `MkUrlWarningDialog.vue` | Already landed in phase 1 (slice 1.x dependency). Compared with the donor: the only differences were three strings routed through `skStrings` (now `i18n.ts._externalNavigationWarning.*`, matching the donor structure). Nothing to reconcile. | `utility/warning-external-website.ts`, `SkListenBrainz` links. | Pref `warnExternalUrl`. |

## Marquee: which consumer uses which

Both components have identical behaviour (upstream's `MkMarqueeText` is the script-setup rewrite of Sharkey's).
Upstream files keep `MkMarqueeText`. New Sharkey-origin pages import `MkMarquee`. They can be merged later by
pointing `MkMarquee` consumers at `MkMarqueeText`; they were kept separate per the "upstream wins, coexist" rule.

## Prefs added (`preferences/def.ts`)

| Pref | Default |
|---|---|
| `showTickerOnReplies` | `false` |
| `oneko` | `false` |

No settings UI yet (Phase 10).

## Deviations from the donor

- `SkOneko`: the donor added the `mousemove` listener to `document` and removed it from `window`, leaking it; now both use `document`, and the animation frame is cancelled on unmount.
- `SkListenBrainz`: Phosphor icon replaced by `ti-player-play`; `<i18n _profile.listeningTo>` replaced by `i18n.ts.listeningTo` (trailing Sharkey locale section, donor wording); response validated.
- `SkInstanceTicker`, `SkBadgeStrip`, `MkRadio`: `--MI-radius-*` variables other than `--MI-radius` are not defined by upstream's `style.scss` (the Sharkey ones are), so these files carry literal fallbacks. Earlier Sk* files using `--MI-radius-xs` etc. have no fallback and render without a radius; follow-up for the coordinator.
- `MkMarquee` uses an object ref for the content element instead of a string ref.

## Verification

Unit tests: `sk-follow-mouse`, `sk-oneko`, `sk-mfm-cheatsheet`, `sk-listenbrainz`. Not verified: rendering, the oneko sprite sheet, ListenBrainz polling, MFM follow behaviour, ticker layout.
