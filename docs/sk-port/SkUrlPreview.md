> Note: Sharkey UI strings formerly lived in `packages/frontend/src/utility/sk-strings.ts` (deleted after the migration). All ported strings now live in `locales/en-US.yml` / `locales/ja-JP.yml` and are read via `i18n.ts` / `i18n.tsx` (see `MISSING-STRINGS.md`). `skStrings` tables below describe the pre-migration wording.

# SkUrlPreview

- Donor: `/Users/terezi/Local Documents/fedifedifedi/Sharkey/packages/frontend/src/components/MkUrlPreview.vue`
- Target: `/Users/terezi/Local Documents/misskey/packages/frontend/src/components/SkUrlPreview.vue` (new file)
- Target `components/MkUrlPreview.vue` is untouched (upstream wins).

## Ported as-is
- Template (player iframe, tweet embed, link card, quote note, attribution line, action buttons), script logic (`refresh`, `fetchNote`, `fetchAttribution`, tweet height messaging, `openPlayer`, `onDeactivated` reset), props, emits, and the scoped styles.
- SPDX header kept from the donor.
- Props: `url`, `detail`, `compact`, `showAsQuote`, `showActions`, `skipNoteIds`, `previewHint`, `noteHint`, `attributionHint`. Emit: `expandMute(note)`.

## Deviations
- `DynamicNoteSimple` replaced by `SkNoteSimple` (`@/components/SkNoteSimple.vue`). The target has no `DynamicNoteSimple.vue`. `SkNoteSimple` takes the same `note` prop and emits `expandMute`.
- `transformPlayerUrl` imported from `@/utility/url-preview.js` (the target's location), not `@/utility/player-url-transform.js`.
- `prefer.s.dataSaver.urlPreview` renamed to `prefer.s.dataSaver.urlPreviewThumbnail`, the key the target's `preferences/def.ts` defines. Preferences were not edited.
- `openPlayer()` passes `{ urlOrSummalyResult: url }` instead of `{ url }`. The target's `MkYouTubePlayer.vue` takes `urlOrSummalyResult: string | SummalyResult`.
- `SummalyResult` comes from `@misskey-dev/summaly` (5.5.1). The donor's exported `SummalyResult` type (with `haveNoteLocally` and `linkAttribution`) is replaced by a local `SkSummalyFields` type and `SkSummaly = SummalyResult & SkSummalyFields`, as in `SkUrlPreviewGroup.vue`. The file no longer exports a type.
- The `<script lang="ts">` block with the exported type is folded into the setup script.
- `ParameterizedString` is imported from `i18n` for the local strings.
- `$i` imported from `@/i` (unchanged from donor; the target's `i.ts` exports it).

## i18n
Keys now live in `locales/en-US.yml` / `locales/ja-JP.yml` and are read via `i18n.ts` (migration complete; `sk-strings.ts` deleted).

| Donor key | Target handling | English text |
|---|---|---|
| `writtenBy` | `i18n.ts.writtenBy` | `Written by {user}` |
| `fetchLinkedNote` | `i18n.ts.fetchLinkedNote` | `Fetch linked note` |

Both keys exist in the donor's `sharkey-locales/en-US.yml` and now in the target's `locales/en-US.yml` / `locales/ja-JP.yml`.

Keys that exist in the target's `en-US.yml` and are used as-is: `failedToPreviewUrl`, `expandTweet`, `enablePlayer`, `disablePlayer`, `openInWindow`, `close`.

`MISSING-STRINGS.md` should list `writtenBy` and `fetchLinkedNote` under "Used now" (not edited here).

## Prefs
- Reads `prefer.s.dataSaver.urlPreviewThumbnail`. Target key exists; no new prefs.

## Endpoints
- `ap/show` via `misskeyApi`: in misskey-js.
- `users/show` via `misskeyApi`: in misskey-js.
- `GET /url?url=...&lang=...&fetch=...` via `window.fetch` (optionally with `Authorization: Bearer` when signed in): raw HTTP route, NOT in misskey-js. Backend not tested.

## Not ported / open
- Nothing in the donor component is dropped.
- Global components used without import (as in the target's `MkUrlPreview.vue`): `MkEllipsis`, `MkA`, `MkAvatar`, `MkUserName`, `I18n`, and the `v-user-preview` directive.
- Target's `components/MkUrlPreview.vue` is still upstream and does not accept the Sk props. Only `SkUrlPreviewGroup.vue` renders `SkUrlPreview`.

## Typecheck
- `npx -y pnpm@11.25.0 --filter frontend typecheck`: no errors in `SkUrlPreview.vue` or `SkUrlPreviewGroup.vue`. Remaining errors are in `SkNote.vue` (not owned here).
