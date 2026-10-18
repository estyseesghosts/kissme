# Split build guide

## Environment variables

| Variable | Monolithic (default) | Split |
|----------|---------------------|-------|
| `VITE_BACKEND_URL` | _(unset)_ | `https://backend.example.com` |
| `VITE_BASE` | _(unset, defaults to `/vite/`)_ | `/` |

## Build commands

### Monolithic (default)

```bash
pnpm --filter frontend build
```

No env vars needed. Backend renders HTML with `instance_url` meta tag.

### Split (standalone)

```bash
VITE_BACKEND_URL=https://backend.example.com VITE_BASE=/ pnpm --filter frontend build
```

### Dev against remote backend

```bash
VITE_BACKEND_URL=https://api.example.com pnpm --filter frontend watch
```

The Vite dev server will proxy `/api` and `/streaming` to the backend.

## Output

Built frontend goes to `built/_frontend_vite_/`. Deploy this directory to any static file server (nginx, S3, CDN, etc.).

## What the static host needs to serve

| Path | Source |
|------|--------|
| `/` | `built/_frontend_vite_/index.html` |
| `/scripts/*`, `/assets/*` | `built/_frontend_vite_*` (Vite output) |
| `/sw.js` | `built/_frontend_vite_/sw.js` (copied by build) |
| `/static-assets/*` | Backend (cross-origin) |
| `/fluent-emoji/*`, `/twemoji/*` | Backend (cross-origin) |

## Backend config for split mode

Set `serveFrontend: false` in `.config/default.yml`:

```yaml
serveFrontend: false
```

The backend will still serve `/static-assets/`, emoji, OG pages, and all API endpoints. It just won't serve the SPA shell or Vite assets.
