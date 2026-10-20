# MkImgPreviewDialog

- Donor: `/Users/terezi/Local Documents/fedifedifedi/Sharkey/packages/frontend/src/components/MkImgPreviewDialog.vue` (+ `MkImgPreviewDialog.stories.impl.ts`)
- Target: `/Users/terezi/Local Documents/misskey/packages/frontend/src/components/MkImgPreviewDialog.vue` (+ `.stories.impl.ts`)

## Ported as-is
Modal window (`MkModalWindow`, 1800x900) showing one `DriveFile` image (`file` prop) on the checker background; click or esc closes. Donor SPDX headers kept. Upstream removed this component (replaced by `MkLightbox`); this is a coexisting re-add and no lightbox files are touched.

## Stories
`MkImgPreviewDialog.stories.impl.ts` is copied unchanged and follows the other `*.stories.impl.ts` pattern. The `*.stories.ts` files are generated and gitignored (`/packages/frontend/src/**/*.stories.ts`), so nothing is registered by hand.

## How the Sharkey image path opens it
Donor-style: `os.popup(defineAsyncComponent(() => import('@/components/MkImgPreviewDialog.vue')), { file }, { closed: () => dispose() })` with `file` a `Misskey.entities.DriveFile`. The lead will wire this only into `SkPostFormAttaches` (previewing an attached image) behind pref `useSharkeyPostForm`; stock paths keep using `MkLightbox`. `SkMediaList` does not use it.

## Prefs read
None.

## Known gaps
No emitted event beyond modal `closed`; not browser-tested.

## Change vs donor
Stories file: `import type { StoryObj }` (verbatimModuleSyntax).
