# Static pages (slice 9.3)

| Page | Route | Notes |
|---|---|---|
| `pages/about-sharkey.vue` | `/about-sharkey` | Sits beside `/about-misskey` (untouched). Uses `PageWithHeader` like upstream. Contributor lists shuffled via `shuffled()`. Sponsors fetched on mount from `sponsors` (Sharkey endpoint, not in misskey-js); failure hides the section. Phosphor icons mapped to Tabler. |
| `pages/unsubscribe.vue` | `/unsubscribe/:user/:token` | Public route. Submits `unsubscribe/<user>/<token>` (segments URL-encoded by `buildUnsubscribeEndpoint`) through an untyped `misskeyApi` alias. Shows a success state (donor showed nothing) and an error alert. |
| `pages/welcome.entrance.a.vue` | (variant of `/`) | Selected in `welcome.vue` by pref `welcomeEntranceStyle`. |

Pref `welcomeEntranceStyle`: `'server' | 'a'`, default `'server'`. `'server'` keeps stock behavior (server `entrancePageStyle`, default classic). `'a'` forces the Sharkey variant. `resolveEntranceStyle` in `utility/sk-static-pages.ts` is the tested decision. No settings UI yet (Phase 10).

Deviations from donor: entrance A uses upstream `MkMarqueeText` (donor `MkMarquee` is slice 9.2) and `/client-assets/misskey.svg` (no `sharkey.svg` in this tree). Strings via `i18n.ts` (trailing Sharkey locale section in both locale files; `sk-strings.ts` deleted).

Not verified: rendering, unsubscribe against a backend (endpoint absent from stock Misskey), sponsors endpoint.
