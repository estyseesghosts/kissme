/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

// Sharkey upload pipeline (coexists with upstream utility/drive.ts uploadFile + useUploader).
// Differences: Sharkey queue state (skUploads), optional client-side compression, keepOriginalFilename.

import { reactive, ref } from 'vue';
import * as Misskey from 'misskey-js';
import { readAndCompressImage } from '@misskey-dev/browser-image-resizer';
import { apiUrl } from '@@/js/config.js';
import { getCompressionConfig } from './upload/compress-config.js';
import { $i } from '@/i.js';
import { alert } from '@/os.js';
import { i18n } from '@/i18n.js';
import { instance } from '@/instance.js';
import { prefer } from '@/preferences.js';
import { genId } from '@/utility/id.js';
import { globalEvents } from '@/events.js';

export type SkUploading = {
	id: string;
	name: string;
	progressMax: number | undefined;
	progressValue: number | undefined;
	img: string;
};
export const skUploads = ref<SkUploading[]>([]);

const mimeTypeMap = {
	'image/webp': 'webp',
	'image/jpeg': 'jpg',
	'image/png': 'png',
} as const;

export function skUploadFile(
	file: File,
	folder?: string | Misskey.entities.DriveFolder | null,
	name?: string,
	keepOriginal = false,
): Promise<Misskey.entities.DriveFile> {
	if ($i == null) throw new Error('Not logged in');

	const _folder = typeof folder === 'string' ? folder : folder?.id;

	if ((file.size > instance.maxFileSize) || (file.size > ($i.policies.maxFileSizeMb * 1024 * 1024))) {
		alert({
			type: 'error',
			title: i18n.ts.failedToUpload,
			text: i18n.ts.cannotUploadBecauseExceedsFileSizeLimit,
		});
		return Promise.reject();
	}

	return new Promise((resolve, reject) => {
		const id = genId();
		const filename = name ?? file.name ?? 'untitled';
		const extension = filename.split('.').length > 1 ? '.' + filename.split('.').pop() : '';

		const ctx = reactive<SkUploading>({
			id,
			name: prefer.s.keepOriginalFilename ? filename : id + extension,
			progressMax: undefined,
			progressValue: undefined,
			img: window.URL.createObjectURL(file),
		});
		skUploads.value.push(ctx);

		const finish = () => {
			window.URL.revokeObjectURL(ctx.img);
			skUploads.value = skUploads.value.filter(x => x.id !== id);
		};

		(async () => {
			const config = !keepOriginal ? await getCompressionConfig(file) : undefined;
			let resizedImage: Blob | undefined;
			if (config) {
				try {
					const resized = await readAndCompressImage(file, config);
					// The compression may not always reduce the file size (and WebP is not browser safe yet)
					if (resized.size < file.size || file.type === 'image/webp') {
						resizedImage = resized;
						if (file.type !== config.mimeType) ctx.name = `${ctx.name}.${mimeTypeMap[config.mimeType as keyof typeof mimeTypeMap] ?? 'bin'}`;
					}
				} catch (err) {
					console.error('Failed to resize image', err);
				}
			}

			const formData = new FormData();
			formData.append('i', $i!.token);
			formData.append('force', 'true');
			formData.append('file', resizedImage ?? file);
			formData.append('name', ctx.name);
			if (_folder) formData.append('folderId', _folder);

			const xhr = new XMLHttpRequest();
			xhr.open('POST', apiUrl + '/drive/files/create', true);
			xhr.onload = () => {
				if (xhr.status !== 200 || xhr.response == null) {
					finish();
					if (xhr.status === 413) {
						alert({ type: 'error', title: i18n.ts.failedToUpload, text: i18n.ts.cannotUploadBecauseExceedsFileSizeLimit });
					} else if (xhr.response) {
						let res: { error?: { id?: string; message?: string; code?: string } } | undefined;
						try {
							res = JSON.parse(xhr.response);
						} catch {
							res = undefined;
						}
						if (res?.error?.id === 'bec5bd69-fba3-43c9-b4fb-2894b66ad5d2') {
							alert({ type: 'error', title: i18n.ts.failedToUpload, text: i18n.ts.cannotUploadBecauseInappropriate });
						} else if (res?.error?.id === 'd08dbc37-a6a9-463a-8c47-96c32ab5f064') {
							alert({ type: 'error', title: i18n.ts.failedToUpload, text: i18n.ts.cannotUploadBecauseNoFreeSpace });
						} else if (res?.error?.id === '4becd248-7f2c-48c4-a9f0-75edc4f9a1ea') {
							alert({ type: 'error', title: i18n.ts.failedToUpload, text: i18n.ts.cannotUploadBecauseUnallowedFileType });
						} else {
							alert({ type: 'error', title: i18n.ts.failedToUpload, text: `${res?.error?.message}\n${res?.error?.code}\n${res?.error?.id}` });
						}
					} else {
						alert({ type: 'error', title: 'Failed to upload', text: `${xhr.status}` });
					}
					reject();
					return;
				}

				const driveFile = JSON.parse(xhr.response) as Misskey.entities.DriveFile;
				globalEvents.emit('driveFileCreated', driveFile);
				finish();
				resolve(driveFile);
			};
			xhr.onerror = () => {
				finish();
				reject();
			};
			xhr.upload.onprogress = ev => {
				if (ev.lengthComputable) {
					ctx.progressMax = ev.total;
					ctx.progressValue = ev.loaded;
				}
			};
			xhr.send(formData);
		})().catch(err => {
			finish();
			reject(err);
		});
	});
}
