# Misskey Split: Finish Guide

This guide is for the implementer who picks up after the first pass (Phases A–D). Each task is self-contained with exact file paths, code, and a "Done means" checklist. Do them in order — later tasks depend on earlier ones.

**Do not skip the "Done means" verification. Do not "come back to it later." If a task says run a command, run it and paste the output.**

---

## Prerequisites

You are on branch `split-project` at tag `2026.10.0`. Run this first:

```bash
git status
git log --oneline -5
```

If you are not on the right branch or have uncommitted work, stop and sort that out first.

---

## Task 1: Fix `VITE_BACKEND_URL` dual mechanism

**Problem:** `VITE_BACKEND_URL` is injected two different ways — `%VITE_BACKEND_URL%` in HTML and `import.meta.env.VITE_BACKEND_URL` in JS. This is redundant and confusing.

**Decision:** Remove the JS-side check. Keep only the HTML meta tag. The meta tag is what the backend already uses (`instance_url`), so it's the canonical source.

### Step 1: Edit `packages/frontend-shared/js/config.ts`

**Current code (lines 7–10):**
```typescript
const backendUrlOverride = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_BACKEND_URL)
	|| new URLSearchParams(window.location.search).get('backend')
	|| window.document.querySelector<HTMLMetaElement>('meta[property="instance_url"]')?.content
	|| window.location.href;
```

**Replace with:**
```typescript
const backendUrlOverride = new URLSearchParams(window.location.search).get('backend')
	|| window.document.querySelector<HTMLMetaElement>('meta[property="instance_url"]')?.content
	|| window.location.href;
```

Also remove the `eslint-disable` comment on line 6 if it's no longer needed (it was for the `??` coalescing; the new code still uses `||` so check whether the rule still fires — if not, remove the comment).

### Step 2: Ensure the HTML meta tag always has a value

**Current code in `packages/frontend/index.html` (line 9):**
```html
<meta property="instance_url" content="%VITE_BACKEND_URL%" />
```

**Replace with:**
```html
<meta property="instance_url" content="%VITE_BACKEND_URL%" />
```

Wait — that's the same. The issue is that when `VITE_BACKEND_URL` is unset, Vite replaces `%VITE_BACKEND_URL%` with an empty string, which is falsy and falls through to `window.location.href`. That's actually fine. **No change needed here.**

### Step 3: Update `packages/frontend/vite.config.ts`

Add `VITE_BACKEND_URL` to the `define` block so it's available in the HTML replacement. Actually — Vite already handles `%ENV_VAR%` replacement for any `VITE_`-prefixed env var automatically. **No change needed.**

### Step 4: Update `scripts/dev.mjs`

The dev script already passes `VITE_BACKEND_URL` to the frontend watch process (lines 234–236, 245–247). **No change needed.**

### Done means
- [ ] `packages/frontend-shared/js/config.ts` no longer references `import.meta.env`
- [ ] `grep -r "import.meta.env.*VITE_BACKEND_URL" packages/frontend-shared/` returns nothing
- [ ] `pnpm --filter frontend build` succeeds without errors
- [ ] In the built `built/_frontend_vite_/index.html`, the `instance_url` meta tag is present

---

## Task 2: Create post-build `index.html` generator (P0 — CRITICAL)

**Problem:** When building the frontend standalone, the bootloader JS/CSS are not inlined into `index.html`. The backend's `HtmlTemplateService` normally does this at render time, but a standalone build has no backend.

**Solution:** Create a script that runs after `vite build` and rewrites `built/_frontend_vite_/index.html` with the bootloader inlined.

### Context: what the backend currently injects

The backend's `base.tsx` view (lines 56–90) injects:
1. **Entry JS** — `<script type="module" src="/vite/scripts/hash-entry.js">` (from `frontendViteFiles.entryJs`)
2. **CSS files** — `<link rel="stylesheet" href="/vite/assets/hash.css">` for each entry CSS
3. **Module preloads** — `<link rel="modulepreload" href="/vite/scripts/hash-chunk.js">` for each import
4. **Bootloader CSS** — inline `<style>` with `frontendBootloaderCss` content, OR `<link rel="stylesheet" href="/vite/loader/style.css">`
5. **Bootloader JS** — inline `<script>` with `frontendBootloaderJs` content, OR `<script src="/vite/loader/boot.js">`
6. **Client entry data** — `<script>window.__CLIENT_ENTRY__ = "/vite/scripts/hash-entry.js"</script>`

The Vite build already handles #1, #2, and #3 (it rewrites `index.html` with the built assets). You only need to handle #4 and #5 (bootloader inlining) and #6 (client entry global).

### Step 1: Create `packages/frontend/scripts/postbuild.mjs`

Create the directory if needed. The script should:

```javascript
#!/usr/bin/env node
/**
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputDir = resolve(__dirname, '../../built/_frontend_vite_');

const indexPath = resolve(outputDir, 'index.html');
let html = readFileSync(indexPath, 'utf-8');

// Read bootloader files
const bootloaderJsPath = resolve(outputDir, 'loader/boot.js');
const bootloaderCssPath = resolve(outputDir, 'loader/style.css');

const bootloaderJs = existsSync(bootloaderJsPath) ? readFileSync(bootloaderJsPath, 'utf-8') : null;
const bootloaderCss = existsSync(bootloaderCssPath) ? readFileSync(bootloaderCssPath, 'utf-8') : null;

// Find the entry JS from the script tag Vite already injected
const entryMatch = html.match(/<script type="module" src="([^"]+)"/);
const entryJs = entryMatch ? entryMatch[1] : null;

// Inject bootloader CSS (inline if available, otherwise leave the link tag)
if (bootloaderCss) {
	const existingLink = html.match(/<link rel="stylesheet" href="[^"]*loader\/style\.css"[^>]*\/>/);
	if (existingLink) {
		html = html.replace(existingLink[0], `<style>\n${bootloaderCss}\n</style>`);
	} else {
		// No link tag found; inject before </head>
		html = html.replace('</head>', `<style>\n${bootloaderCss}\n</style>\n</head>`);
	}
}

// Inject bootloader JS (inline if available, otherwise leave the script tag)
if (bootloaderJs) {
	const existingScript = html.match(/<script src="[^"]*loader\/boot\.js"[^>]*><\/script>/);
	if (existingScript) {
		html = html.replace(existingScript[0], `<script>\n${bootloaderJs}\n</script>`);
	} else {
		// No script tag found; inject before the entry module script
		if (entryJs) {
			html = html.replace(entryJs, `<script>\n${bootloaderJs}\n</script>\n\t<script type="module" src="${entryJs}"`);
		} else {
			html = html.replace('</body>', `<script>\n${bootloaderJs}\n</script>\n</body>`);
		}
	}
}

// Inject client entry global
if (entryJs) {
	const clientEntryScript = `<script>window.__CLIENT_ENTRY__ = "${entryJs}";</script>`;
	// Inject right before the entry module script
	html = html.replace(`<script type="module" src="${entryJs}"`, `${clientEntryScript}\n\t<script type="module" src="${entryJs}"`);
}

writeFileSync(indexPath, html, 'utf-8');
console.log('[postbuild] index.html updated with bootloader and client entry.');
```

### Step 2: Wire it into the build

**Edit `packages/frontend/build.ts`:**

Add a call to the postbuild script at the end of the `build()` function:

**Current code (lines 55–60):**
```typescript
async function build() {
	await fs.rm(outputDir, { recursive: true, force: true });
	await viteBuild();
	await buildAllLocale();
	await copyServiceWorker();
}
```

**Replace with:**
```typescript
async function build() {
	await fs.rm(outputDir, { recursive: true, force: true });
	await viteBuild();
	await buildAllLocale();
	await copyServiceWorker();
	await runPostbuild();
}

async function runPostbuild() {
	const { execa } = await import('execa');
	await execa('node', [__dirname + '/scripts/postbuild.mjs'], {
		cwd: __dirname,
		stdout: process.stdout,
		stderr: process.stderr,
	});
}
```

### Step 3: Test it

```bash
pnpm --filter frontend build
```

Then inspect the output:

```bash
cat built/_frontend_vite_/index.html
```

### Done means
- [ ] `packages/frontend/scripts/postbuild.mjs` exists
- [ ] `packages/frontend/build.ts` calls `runPostbuild()` after `copyServiceWorker()`
- [ ] `pnpm --filter frontend build` succeeds
- [ ] `built/_frontend_vite_/index.html` contains `<style>` with bootloader CSS inlined (not a `<link>` tag)
- [ ] `built/_frontend_vite_/index.html` contains `<script>` with bootloader JS inlined (not a `<script src>` tag)
- [ ] `built/_frontend_vite_/index.html` contains `window.__CLIENT_ENTRY__`
- [ ] `built/_frontend_vite_/index.html` still has the Vite entry `<script type="module">` tag

---

## Task 3: Update embed frontend `vite.config.ts`

**Problem:** The embed frontend has no proxy and its `allowedHosts` only allows the backend hostname. It needs the same treatment as the main frontend.

### Step 1: Edit `packages/frontend-embed/vite.config.ts`

**Current code (lines 14–15):**
```typescript
const url = process.env.NODE_ENV === 'development' ? (loadYaml(await fsp.readFile('../../.config/default.yml', 'utf-8')) as any).url : null;
const host = url ? (new URL(url)).hostname : undefined;
```

**Keep these lines.** They parse the backend URL from config.

**Current code (lines 76–88):**
```typescript
server: {
	host: '0.0.0.0',
	allowedHosts: host ? [host] : undefined,
	port: 5174,
	strictPort: true,
	hmr: {
		clientPort: 5174,
	},
},
```

**Replace with:**
```typescript
server: {
	host: '0.0.0.0',
	allowedHosts: true,
	port: 5174,
	strictPort: true,
	proxy: url ? {
		'/api': {
			target: url,
			changeOrigin: true,
		},
		'/streaming': {
			target: url.replace(/^http/, 'ws'),
			ws: true,
			changeOrigin: true,
		},
	} : undefined,
	hmr: {
		clientPort: 5174,
	},
},
```

### Done means
- [ ] `packages/frontend-embed/vite.config.ts` has a `proxy` block identical in structure to the main frontend's
- [ ] `packages/frontend-embed/vite.config.ts` has `allowedHosts: true`
- [ ] `grep -A5 "proxy:" packages/frontend-embed/vite.config.ts` shows both `/api` and `/streaming` entries

---

## Task 4: Tighten `allowedHosts` on main frontend

**Problem:** `allowedHosts: true` allows any hostname, making the dev server vulnerable to DNS rebinding. Use specific hosts instead.

### Step 1: Edit `packages/frontend/vite.config.ts`

**Current code (line 130):**
```typescript
allowedHosts: true,
```

**Replace with:**
```typescript
allowedHosts: host ? [host] : undefined,
```

This restores the original behavior — only the backend hostname is allowed. If you need the frontend dev server accessible from other hosts during testing, add them explicitly:

```typescript
allowedHosts: host ? [host, 'localhost', '127.0.0.1'] : undefined,
```

### Step 2: Apply the same to embed frontend

In `packages/frontend-embed/vite.config.ts`, change `allowedHosts: true` (from Task 3) to:

```typescript
allowedHosts: host ? [host, 'localhost', '127.0.0.1'] : undefined,
```

### Done means
- [ ] `grep "allowedHosts" packages/frontend/vite.config.ts` shows `allowedHosts: host ? [host, 'localhost', '127.0.0.1'] : undefined`
- [ ] `grep "allowedHosts" packages/frontend-embed/vite.config.ts` shows the same
- [ ] No `allowedHosts: true` remains in either file

---

## Task 5: Add `VITE_BASE` split-mode documentation and defaults

**Problem:** The plan says `VITE_BASE` should default to `/vite/` for monolithic and `/` for split. Currently it always defaults to `/vite/`. There's no documentation for what env vars to set.

### Step 1: Create `packages/frontend/SPLIT_BUILD.md`

Create this file:

```markdown
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
```

### Done means
- [ ] `packages/frontend/SPLIT_BUILD.md` exists
- [ ] It documents all three build modes (monolithic, split, dev-remote)
- [ ] It documents what the static host must serve
- [ ] It documents the backend config flag

---

## Task 6: Verify end-to-end split mode

**Problem:** There's no evidence the split mode actually works. You need to test it.

### Step 1: Build the frontend in split mode

```bash
VITE_BACKEND_URL=https://api.example.com VITE_BASE=/ pnpm --filter frontend build
```

### Step 2: Verify the build output

```bash
ls built/_frontend_vite_/
cat built/_frontend_vite_/index.html | head -30
```

Check:
- [ ] `index.html` exists
- [ ] `index.html` has `<meta property="instance_url" content="https://api.example.com" />`
- [ ] `index.html` has `window.__CLIENT_ENTRY__`
- [ ] `index.html` has inlined bootloader `<style>` and `<script>` (not external links)
- [ ] `sw.js` exists in the output dir

### Step 3: Start the backend in split mode

```bash
# In .config/default.yml, set:
# serveFrontend: false
pnpm --filter backend dev
```

### Step 4: Start a static file server for the frontend

```bash
npx serve built/_frontend_vite_ -l 5173
```

Or any static server. The point is to serve the frontend from a different origin than the backend.

### Step 5: Test

Open `http://localhost:5173` in a browser. Check:
- [ ] The page loads (Vue app mounts)
- [ ] API calls go to `https://api.example.com/api` (check Network tab)
- [ ] WebSocket connects to `wss://api.example.com/streaming` (check Network tab)
- [ ] No CORS errors in console
- [ ] The loading screen appears briefly (bootloader works)

### Done means
- [ ] All checkboxes above are checked
- [ ] If any fail, debug and fix before proceeding

---

## Task 7: Clean up and document

### Step 1: Update `SPLIT_EVALUATION.md`

Add a section at the top:

```markdown
## Implementation status

| Phase | Status | Notes |
|-------|--------|-------|
| A | Complete | `config.ts` uses `address.origin`; `VITE_BACKEND_URL` injected via meta tag |
| B | Complete | Post-build script inlines bootloader; `VITE_BASE` configurable |
| C | Complete | Proxy in both frontends; `allowedHosts` tightened |
| D | Complete | `serveFrontend` flag gates SPA shell only |

See `SPLIT_FINISH_GUIDE.md` for implementation details.
```

### Step 2: Run lint and build checks

```bash
pnpm lint
pnpm build
```

Fix any errors. Do not commit with failing lint/build.

### Done means
- [ ] `pnpm lint` passes
- [ ] `pnpm build` passes
- [ ] `SPLIT_EVALUATION.md` has an implementation status section

---

## Summary: file checklist

| File | Action |
|------|--------|
| `packages/frontend-shared/js/config.ts` | Remove `import.meta.env` check |
| `packages/frontend/scripts/postbuild.mjs` | **Create** — post-build index.html generator |
| `packages/frontend/build.ts` | Add `runPostbuild()` call |
| `packages/frontend-embed/vite.config.ts` | Add proxy + fix `allowedHosts` |
| `packages/frontend/vite.config.ts` | Fix `allowedHosts` |
| `packages/frontend/SPLIT_BUILD.md` | **Create** — split build documentation |
| `SPLIT_EVALUATION.md` | Add implementation status |

---

## What NOT to do

- **Do not** skip Task 2 (postbuild). Without it, standalone builds are broken.
- **Do not** use `allowedHosts: true` in commit. Use specific hosts.
- **Do not** add `VITE_BACKEND_URL` to `define` in vite.config.ts — Vite handles it automatically.
- **Do not** modify `HtmlTemplateService` or `ClientServerService` — they're correct as-is.
- **Do not** touch `locales/ja-JP.yml` or any non-ja-JP locale file.
- **Do not** edit merged migration files.
- **Do not** force-push to `main`/`develop`/`master`.
