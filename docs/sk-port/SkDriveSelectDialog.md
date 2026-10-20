# SkDriveSelectDialog

Donor: `components/MkDriveSelectDialog.vue` (+ `.stories.impl.ts`), Sharkey develop @ 752a392d3b.
Target: `components/SkDriveSelectDialog.vue`, `components/SkDriveSelectDialog.stories.impl.ts`.

Unified file/folder picker (`type: 'file' | 'folder'`, `multiple`, `initialFolder`). Upstream `MkDriveFileSelectDialog` and `MkDriveFolderSelectDialog` are untouched.

Adapted to upstream `MkDrive`: it listens to `changeSelectedFiles` / `changeSelectedFolders` (the donor used `changeSelection`) and passes `initialFolder`. The donor's `selected` shortcut event is not emitted by upstream `MkDrive` (commented out there), so double-click confirm is unavailable. Folder selection can include `null` (root), as upstream.

Opened by `skSelectDriveFiles` / `skSelectDriveFolders` in `utility/sk-select-file.ts`, reached only when pref `useSharkeyUploader` is on. Single/multi select and folder navigation are inherited from `MkDrive`; not exercised in a browser.
