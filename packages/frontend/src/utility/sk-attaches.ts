/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type * as Misskey from 'misskey-js';

// Pure list helpers for SkPostFormAttaches / MkPostForm (Sharkey attachment handling).

type DriveFile = Misskey.entities.DriveFile;

/** Attachment count shown as the "n/16" counter; the form flags anything above it. */
export const MAX_ATTACHED_FILES = 16;

/** Replace the file with id `oldId` by `newFile`, keeping its position. Unknown ids return the list unchanged. */
export function replaceFileById(files: DriveFile[], oldId: string, newFile: DriveFile): DriveFile[] {
	const i = files.findIndex(x => x.id === oldId);
	if (i < 0) return files;
	return files.map((x, j) => j === i ? newFile : x);
}

/** Detach (without deleting from the drive) the file with the given id. */
export function removeFileById(files: DriveFile[], id: string): DriveFile[] {
	return files.filter(x => x.id !== id);
}

/** Move the item at `from` to `to` (what a drag-and-drop reorder does). Out-of-range indices return the list unchanged. */
export function moveItem<T>(items: T[], from: number, to: number): T[] {
	if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) return items;
	const next = items.slice();
	const [moved] = next.splice(from, 1);
	next.splice(to, 0, moved);
	return next;
}
