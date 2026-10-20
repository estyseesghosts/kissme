# Sharkey upload pipeline (slice 6.1)

Donor: `utility/select-file.ts`, `utility/upload.ts`, `utility/upload/compress-config.ts`, `utility/upload/isWebpSupported.ts` (Sharkey develop @ 752a392d3b).
Target: `utility/sk-select-file.ts`, `utility/sk-upload.ts`, `utility/upload/compress-config.ts`, `test/unit/sk-compress-config.test.ts`.

## Coexistence
Upstream `utility/drive.ts` (`uploadFile`, `selectFile`, `chooseDriveFile`) and `composables/use-uploader.ts` are untouched. Upstream `utility/isWebpSupported.ts` already exists and is reused (same code as the donor). The Sharkey chooser/uploader are separate `sk*`-named exports.

## Gate
Pref `useSharkeyUploader` (default `false`, no settings UI yet; Phase 10). Only call site: the attach button in `MkPostForm` (`chooseFileFrom`), which uses `skSelectFiles` when the pref is on and upstream `selectFile` otherwise.

## Behavior
- `skSelectFile(s)`: popup menu: upload (compressed), upload (original), from Drive (`SkDriveSelectDialog`, starting in `prefer.s.uploadFolder`), from URL.
- `skChooseFileFromPc`: uploads into `prefer.s.uploadFolder` unless overridden; `keepOriginal` skips compression.
- `skUploadFile`: queue state `skUploads` (reactive list of name, progress, preview URL), size-limit pre-check, optional compression, multipart `POST /drive/files/create` (`i`, `force`, `file`, `name`, `folderId`), error alerts matching upstream, emits `driveFileCreated`.
- `selectCompressionConfig(mime, webp, animated)` is the pure selection (unit-tested); `getCompressionConfig(file)` adds the browser probes.

## Changes vs donor
- ids use `genId()` (no `uuid` dependency); object URLs are revoked on finish; `onerror` clears the queue entry; JSON error parsing is guarded; the resized blob renames the file only when it is actually used; also handles the unallowed-file-type error id.
- `isForImport` on URL upload is passed through an untyped cast (absent from misskey-js).
- Compress menu label uses existing `i18n.ts.compress`.

## Not verified
No backend or browser run. The multipart upload, Drive picker and compression are untested live; only the config selection is unit-tested.
