## Implementation status

| Phase | Status | Notes |
|-------|--------|-------|
| A | Complete | `config.ts` uses `address.origin`; `VITE_BACKEND_URL` injected via meta tag |
| B | Complete | Post-build script inlines bootloader; `VITE_BASE` configurable |
| C | Complete | Proxy in both frontends; `allowedHosts` tightened |
| D | Complete | `serveFrontend` flag gates SPA shell only |

See `SPLIT_FINISH_GUIDE.md` for implementation details.

# Misskey Split: Backend vs Frontend — Evaluation & Plan

Pinned to stable release tag `2026.10.0` (branch `split-project`).

## 1. Current architecture (summary)

Misskey is a pnpm monorepo. The two halves are already physically separated as packages, but **deployment is monolithic**: the backend (NestJS + Fastify) serves the frontend SPA.

- `packages/backend` — API, WebSocket streaming, DB, jobs, and **also** serves the built frontend (`built/_frontend_vite_`), static assets, and an SSR-ish HTML shell.
- `packages/frontend` — Vue 3 SPA built by Vite to `built/_frontend_vite_`, consumed by backend's `HtmlTemplateService`/`ClientServerService`.
- Shared contracts: `misskey-js` (generated from backend OpenAPI), `i18n`, `frontend-shared`, `misskey-reversi`. No direct source imports between backend and frontend — coupling is only via the generated API client and shared game packages. This is the single biggest reason the split is feasible.

Key files:
- Backend serves frontend: `packages/backend/src/server/web/ClientServerService.ts`, `packages/backend/src/server/web/HtmlTemplateService.ts`.
- Frontend API/WS: `packages/frontend/src/utility/misskey-api.ts`, `packages/frontend/src/stream.ts`.
- Shared runtime config: `packages/frontend-shared/js/config.ts` (reads `<meta property="instance_url">` into `address`, but `apiUrl`/`wsOrigin` are currently hardcoded to `window.location.origin` — Phase A.1 fixes this).
- Tokens: `packages/frontend/src/accounts.ts` (stored in localStorage keyed by `host/userId` — already multi-backend aware).

## 2. How to split (concrete steps)

### Phase A — Make frontend backend-URL configurable
Current state: `packages/frontend-shared/js/config.ts` already derives `address` (host/url) from the `instance_url` meta tag (falling back to `window.location`), but `apiUrl` and `wsOrigin` are hardcoded to `window.location.origin`. That is the root cause to fix for cross-origin backends.

1. Change `apiUrl` → `address.origin + '/api'` and `wsOrigin` → `address.origin` in `packages/frontend-shared/js/config.ts`. Monolithic behavior unchanged because backend sets `instance_url` = `config.url`.
2. Add an optional build-time override (e.g. `VITE_BACKEND_URL`) injected into a generated `index.html` meta tag `<meta property="instance_url" content="...">` (or a tiny `config.js` loaded before the bundle), so a standalone build knows its backend without backend-rendered HTML.
3. Keep `credentials: 'omit'` fetch mode (already correct for cross-origin; auth travels via the `i` token param).
4. (Optional) allow `?backend=` query override for ad-hoc testing against arbitrary instances.

### Phase B — Frontend becomes a self-contained static bundle
1. Vite `base` is currently `/vite/`. For a standalone host, make it configurable (env `VITE_BASE`, default `/vite/` for monolithic compat, `/` for split) and update all absolute asset references accordingly.
2. Assets: Vite aliases `/client-assets/` → `packages/frontend/assets/` (bundled), `/static-assets/` → `packages/backend/assets/` (backend-served), `/fluent-emoji/` → emoji package. For split, either keep backend serving `/static-assets/` + emoji (frontend references backend origin) or copy them into the bundle. Recommend keeping backend-served for internal testing to minimize churn.
3. Port `HtmlTemplateService` injection into the build: `_VERSION_`/`_LANGS_` are already Vite `define`s; the remaining pieces are the Vite manifest's entry JS/CSS + module preloads and `loader/boot.js` + `loader/style.css`. Simplest for testing: a post-build script that reads `manifest.json` and writes `index.html` with those links inlined (mirroring `collectViteAssetFiles`).
4. `og:site_name` and other meta tags used by `config.ts` (`instanceName`) should be injected at build time or defaulted.
5. Service worker: ensure `/sw.js` is served from the frontend origin with scope `/`; the SW reads backend origin from `instance_url`/config. Push subscriptions point at backend (unchanged).

### Phase C — Decouple dev workflow
1. Add a Vite `server.proxy` for `/api` and `/streaming` (WS upgrade) to the backend origin, so the frontend dev server can be used standalone against a remote/locally-running backend.
2. `allowedHosts` in `vite.config.ts` is derived from backend config url hostname; for split dev, also allow the frontend host.
3. Update `scripts/dev.mjs` to pass `VITE_BACKEND_URL` (and optionally `VITE_BASE`) to the frontend watch process; keep monolithic mode as default.

### Phase D — Backend drops frontend serving (optional but clean)
1. Add a config flag (e.g. `serveFrontend: boolean`, default true) gating `ClientServerService` frontend/static routes and `HtmlTemplateService` preparation, so backend can run API-only. Keep default on to preserve monolithic dev/prod.
2. Backend still serves `/static-assets/` and emoji assets in split mode (frontend references backend origin) to avoid duplicating assets; only the SPA shell + `/vite/` manifest handling is disabled.
3. OG/link previews: backend currently renders `UserPage`/`NotePage` views with OG meta. Either keep these routes (redirecting to the frontend after meta) or accept preview loss. Recommend keeping for minimal regression.

### Phase E — Build/deploy
1. Frontend build output (`built/_frontend_vite_`) becomes the deployable artifact for a static host; add a post-build step to emit `index.html` from the manifest (Phase B.3).
2. Backend build unchanged; run with `serveFrontend: false` for split mode.
3. Keep `build-misskey-js-with-types` flow (backend → misskey-js → frontend) — it still works since misskey-js is the contract; run it whenever backend API changes.

## 3. Difficulty assessment

| Area | Difficulty | Notes |
|---|---|---|
| API decoupling | Low | CORS already `origin: '*'` on `ApiServerService`. Tokens host-keyed. |
| WebSocket decoupling | Low | `StreamingApiServerService` has no origin check. |
| Backend-URL config | Low-Medium | `frontend-shared/js/config.ts` already reads `instance_url` meta; needs env/build-time injection. |
| Vite base path (`/vite/`) | Medium | Hardcoded base; needs env-configurable base for standalone hosting. |
| Asset bundling | Medium | `/static-assets/` and emoji assets are backend-served; decide keep-remote vs bundle. |
| HTML bootstrap / Vite manifest injection | Medium | `HtmlTemplateService` does nontrivial injection (loader, manifest, preloads); replicate via build script. |
| Dev HMR/proxy | Medium | Vite config needs proxy; dev script needs env wiring. |
| Service worker | Medium | Scope and origin; push subscription endpoint unchanged (backend). |
| OAuth redirects | Medium | Redirect URIs configured per instance; should work if instance URLs set correctly. |
| OGP / link previews for notes & users | Medium-High | Backend currently renders OG meta HTML; dropping it loses previews unless backend keeps lightweight OG routes. |
| File uploads (multipart) | Low | CORS `*` already covers. |
| Overall | **Medium** (messy but very doable) | Coupling is already low (only generated API + shared games), which is the saving grace. No SSR framework to untangle — just a Vite SPA. |

Estimated effort: ~1–2 weeks for a working (messy, internal-testing) split; ~3–4 weeks for a clean, production-grade split (OGP, SW, embed, all asset paths). Given the stated goal (internal testing, never prod), Phase A–C plus a gated Phase D is enough; skip OGP polish.

## 4. Risks / gotchas

- `frontend-shared` is consumed via Vite alias `@@/` → `../frontend-shared/`, not as an npm dep. Keep that alias working in any new build config.
- `misskey-js` autogen must be regenerated whenever backend API changes (`pnpm build-misskey-js-with-types`); the split does not remove this dependency.
- In split mode there is no backend-rendered HTML, so `_LANGS_`/`_VERSION_` must come from Vite `define` (already the case) and `instance_url` meta must be injected at build time; otherwise `config.ts` falls back to `window.location`, pointing the frontend at itself.
- Backend's `config.frontendManifestExists`/`frontendEmbedManifestExists` gate Vite-asset mode. In split mode these become irrelevant; don't break monolithic dev.
- `packages/frontend-embed` is a second frontend variant with the same serving pattern; decide whether to split it too (recommend: yes, same treatment, lower priority).
- CORS is `*` already, but if we later restrict it, must allow the frontend origin + credentials handling (tokens are in localStorage, so no cookies needed — keep it simple).

## 5. Recommended first code change

Start with Phase A.1: change `apiUrl`/`wsOrigin` in `packages/frontend-shared/js/config.ts` to use `address.origin` instead of `window.location.origin`. This two-line fix makes the frontend honor `instance_url` for API/WS calls, immediately unblocking cross-origin backends. Then add the Vite proxy (Phase C.1) and build-time meta injection (Phase A.2).
