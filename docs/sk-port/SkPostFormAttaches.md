# SkPostFormAttaches.vue (+ utility/sk-attaches.ts)

- Donor: `Sharkey/packages/frontend/src/components/MkPostFormAttaches.vue`
- Target: `components/SkPostFormAttaches.vue`, `utility/sk-attaches.ts`
- Upstream `MkPostFormAttaches.vue` (with `MkDraggable` and `globalEvents 'driveFilesDeleted'`) is untouched and remains the stock path. `SkPostFormAttaches` is a coexisting file derived from the **upstream** version (so the lightbox preview, `popupAsyncWithDialog`, `isPreviewable` stay) plus the Sharkey deltas below.

## Sharkey deltas
- **Sortable:** `vuedraggable` (`itemKey="id"`, `animation=150`, `delay=100`, `delayOnTouchOnly`), loaded lazily. Dependency added in its own commit.
- **`replaceFile` emit** + crop menu item for images, via upstream's `createCroppedImageDriveFileFromImageDriveFile` (`utility/drive.ts`). The donor's `os.cropImage(DriveFile)` does not exist upstream; this is its equivalent.
- **Delete without the global event:** `detachAndDeleteMedia` detaches, confirms, then `os.apiWithDialog('drive/files/delete')`. It does not emit `driveFilesDeleted`, so open drive views are not told; this is intentional per the slice.
- `detachMediaFn` prop (already in upstream), `copyToClipboard` (devMode "copy file id") kept as upstream.
- The 16-file limit is `MAX_ATTACHED_FILES` in `sk-attaches.ts`.

## Pure helpers and tests
`replaceFileById`, `removeFileById`, `moveItem` in `utility/sk-attaches.ts`; `test/unit/sk-attaches.test.ts`. Reorder itself is done by vuedraggable (the component only re-emits the list), so `moveItem` is the logical equivalent that is unit-tested.

## Not verified
Drag, crop, and delete in a browser; no cross-path event-bus check was run (the two components share no code path, `SkPostFormAttaches` imports no `globalEvents`).
