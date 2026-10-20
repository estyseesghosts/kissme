# Sharkey frontend port — state log

## Pins

- Base: misskey `split-project` @ `b8f3eb20d8` (working directly on this branch; no worktrees or port branch)
- Donor: Sharkey `develop` @ `752a392d3b` (read-only; no changes made to Sharkey)
- Tooling: pnpm 11.25.0 (via `npx -y pnpm@11.25.0`; not on PATH), node v26.8.1

## Phase 0

### 0.1 Pin and index — DONE
- Index: `docs/shark-port-diff-index.md` (Sharkey-only 95, Misskey-only 93, Differ 606 in `packages/frontend/src`).
- Dependency deltas (`packages/frontend/package.json`) are recorded in the index. Sharkey-only deps: @discordapp/twemoji, @github/webauthn-json, @phosphor-icons/web, @ruffle-rs/ruffle, chromatic, katex, locales (workspace), photoswipe, promise-limit, strict-event-emitter-types, uuid, vuedraggable. Misskey-only deps: @analytics/google-analytics, @mcaptcha/core-glue, @misskey-dev/emoji-data, @misskey-dev/tagcanvas-es, @simplewebauthn/browser, @syuilo/aiscript-0-19-0, analytics, ios-haptics, i18n, icons-subsetter, mediabunny, qr-code-styling, qr-scanner, seedrandom. Version-only differences also exist (e.g. vue 3.5.42 vs 3.5.21, mfm-js vs @transfem-org/sfm-js).

### 0.2 Baseline — RED (stopped per plan)
| Check | Result | Log |
|---|---|---|
| `pnpm --filter frontend typecheck` | PASS (exit 0) | `baseline-typecheck.log` |
| `pnpm --filter frontend test` | FAIL: 4 failed / 148 passed (152); 1 failed file | `baseline-test.log` |
| `pnpm --filter frontend build` | PASS (exit 0), postbuild ok | `baseline-build.log` |
| `node scripts/check-spdx.mjs` | SPDX: OK | — |

Failing: `test/unit/is-birthday.test.ts` (4 of 5 tests). It is timezone-dependent and pre-existing on split-project: the test builds `new Date('2024-05-15')` (UTC midnight) and expects local-date matching. On this machine (EDT, UTC-4) it fails. With `TZ=UTC` all 5 pass. Fixed nothing, per plan. Phase 1 is blocked until a decision is made on this (e.g. run tests with `TZ=UTC` in CI/harness, or fix the test/util in a separate, approved change).

### 0.3 Coexistence decision — recorded
Adopted verbatim from the plan; no code changes:
- Both note designs coexist via `DynamicNote*` + `prefer.s.noteDesign` (default `misskey`). `MkNote.vue` is not replaced.
- Both lightbox systems coexist (Sharkey lightbox alongside `MkImgPreviewDialog`/`MkLightbox*`).
- Both timeline/list models coexist (`MkNotesTimeline/Streaming*` alongside `MkNotes/MkTimeline`).
- Both pagination models coexist; rename on collision (decided in slice 2.4).
- Drafts and schedule coexist; both APIs exposed in UI.

## Phase 1 — NOT STARTED
Blocked by the Phase 0.2 red baseline. Slices 1.1–1.4 not begun. No subagents were spawned for Phase 1 for this reason.

## Exit criteria
- Phase 0: **not met** (baseline test red; index, pins, deps, and coexistence decision are done).
- Phase 1: **not met** (not started).
