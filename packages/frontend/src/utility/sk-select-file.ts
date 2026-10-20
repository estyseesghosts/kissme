/*
 * SPDX-FileCopyrightText: hazelnoot and other Sharkey contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

// Sharkey file chooser (coexists with upstream utility/drive.ts selectFile).
// Entries: upload (compressed / original), from Drive (SkDriveSelectDialog), from URL.

import * as Misskey from 'misskey-js';
import * as os from '@/os.js';
import { misskeyApi } from '@/utility/misskey-api.js';
import { useStream } from '@/stream.js';
import { i18n } from '@/i18n.js';
import { skUploadFile } from '@/utility/sk-upload.js';
import { prefer } from '@/preferences.js';
import { genId } from '@/utility/id.js';

export function skChooseFileFromPc(
	multiple: boolean,
	options?: {
		uploadFolder?: string | null;
		keepOriginal?: boolean;
		nameConverter?: (file: File) => string | undefined;
	},
): Promise<Misskey.entities.DriveFile[]> {
	const uploadFolder = options?.uploadFolder ?? prefer.s.uploadFolder;
	const keepOriginal = options?.keepOriginal ?? false;
	const nameConverter = options?.nameConverter ?? (() => undefined);

	return new Promise(res => {
		const input = window.document.createElement('input');
		input.type = 'file';
		input.multiple = multiple;
		input.onchange = () => {
			if (!input.files) return res([]);
			const promises = Array.from(
				input.files,
				file => skUploadFile(file, uploadFolder, nameConverter(file), keepOriginal),
			);

			Promise.all(promises).then(driveFiles => {
				res(driveFiles);
			}).catch(() => {
				// upload errors are already alerted inside skUploadFile
			});

			(window as unknown as Record<string, unknown>).__misskey_input_ref__ = null;
		};

		// iOS Safari needs a live reference to the input
		(window as unknown as Record<string, unknown>).__misskey_input_ref__ = input;

		input.click();
	});
}

export function skSelectDriveFiles(multiple: boolean, initialFolder?: string | null): Promise<Misskey.entities.DriveFile[]> {
	return new Promise((resolve, reject) => {
		let dispose: () => void;
		os.popupAsyncWithDialog(import('@/components/SkDriveSelectDialog.vue').then(x => x.default), {
			type: 'file',
			multiple,
			initialFolder: initialFolder ?? null,
		}, {
			done: r => {
				if (r) resolve(r as Misskey.entities.DriveFile[]);
			},
			closed: () => dispose(),
		}).then(d => dispose = d.dispose, reject);
	});
}

export function skSelectDriveFolders(multiple: boolean, initialFolder?: string | null): Promise<(Misskey.entities.DriveFolder | null)[] | undefined> {
	return new Promise((resolve, reject) => {
		let dispose: () => void;
		os.popupAsyncWithDialog(import('@/components/SkDriveSelectDialog.vue').then(x => x.default), {
			type: 'folder',
			multiple,
			initialFolder: initialFolder ?? null,
		}, {
			done: r => resolve(r as (Misskey.entities.DriveFolder | null)[] | undefined),
			closed: () => dispose(),
		}).then(d => dispose = d.dispose, reject);
	});
}

export function skChooseFileFromUrl(options: { isForImport?: boolean } = {}): Promise<Misskey.entities.DriveFile> {
	return new Promise(res => {
		os.inputText({
			title: i18n.ts.uploadFromUrl,
			type: 'url',
			placeholder: i18n.ts.uploadFromUrlDescription,
		}).then(({ canceled, result: url }) => {
			if (canceled || url == null) return;

			const marker = genId();
			const connection = useStream().useChannel('main');
			connection.on('urlUploadFinished', urlResponse => {
				if (urlResponse.marker === marker) {
					res(urlResponse.file);
					connection.dispose();
				}
			});

			misskeyApi('drive/files/upload-from-url', {
				url,
				folderId: prefer.s.uploadFolder,
				marker,
				// isForImport is Sharkey-only and absent from misskey-js typings
				...(options.isForImport ? { isForImport: true } : {}),
			} as Misskey.entities.DriveFilesUploadFromUrlRequest);

			os.alert({
				title: i18n.ts.uploadFromUrlRequested,
				text: i18n.ts.uploadFromUrlMayTakeTime,
			});
		});
	});
}

function select(src: HTMLElement | EventTarget | null, label: string | null, multiple: boolean, options: { isForImport?: boolean } = {}): Promise<Misskey.entities.DriveFile[]> {
	return new Promise(res => {
		os.popupMenu([label ? {
			text: label,
			type: 'label',
		} : null, {
			text: `${i18n.ts.upload} (${i18n.ts.compress})`,
			icon: 'ti ti-upload',
			action: () => skChooseFileFromPc(multiple, { keepOriginal: false }).then(files => res(files)),
		}, {
			text: i18n.ts.upload,
			icon: 'ti ti-upload',
			action: () => skChooseFileFromPc(multiple, { keepOriginal: true }).then(files => res(files)),
		}, {
			text: i18n.ts.fromDrive,
			icon: 'ti ti-cloud',
			action: () => skSelectDriveFiles(multiple, prefer.s.uploadFolder).then(files => res(files)),
		}, {
			text: i18n.ts.fromUrl,
			icon: 'ti ti-link',
			action: () => skChooseFileFromUrl({ isForImport: options.isForImport }).then(file => res([file])),
		}], src);
	});
}

export function skSelectFile(src: HTMLElement | EventTarget | null, label: string | null = null, options: { isForImport?: boolean } = {}): Promise<Misskey.entities.DriveFile> {
	return select(src, label, false, options).then(files => files[0]);
}

export function skSelectFiles(src: HTMLElement | EventTarget | null, label: string | null = null): Promise<Misskey.entities.DriveFile[]> {
	return select(src, label, true);
}
