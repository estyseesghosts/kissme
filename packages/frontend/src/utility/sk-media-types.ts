/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

// Sharkey media classification: decides which Sharkey player a drive file gets.
// Extracted from the donor's MkMediaList (isModule/isFlash) so it can be unit tested.

import {
	FILE_TYPE_BROWSERSAFE,
	FILE_TYPE_BROWSERSAFE_SHARKEY,
	FILE_TYPE_TRACKER_MODULES,
	FILE_EXT_TRACKER_MODULES,
	FILE_TYPE_FLASH_CONTENT,
	FILE_EXT_FLASH_CONTENT,
} from '@@/js/const.js';

export type SkMediaFileLike = { type: string; name: string };

export type SkMediaKind = 'image' | 'video' | 'audio' | 'tracker' | 'flash' | 'other';

function stripMime(mime: string): string {
	return mime.split(';')[0].trim().toLowerCase();
}

function hasExt(name: string, exts: readonly string[]): boolean {
	const lower = name.toLowerCase();
	// drive renames unknown extensions to "<name>.<ext>.unknown" on some instances
	return exts.some(ext => lower.endsWith('.' + ext) || lower.endsWith('.' + ext + '.unknown'));
}

export function isTrackerModule(file: SkMediaFileLike): boolean {
	return FILE_TYPE_TRACKER_MODULES.includes(stripMime(file.type)) || hasExt(file.name, FILE_EXT_TRACKER_MODULES);
}

export function isFlashContent(file: SkMediaFileLike): boolean {
	return FILE_TYPE_FLASH_CONTENT.includes(stripMime(file.type)) || hasExt(file.name, FILE_EXT_FLASH_CONTENT);
}

/** Browser-displayable image/video/audio. Superset of upstream isPreviewable (adds jxl / mkv). */
export function isSkBrowserSafe(mime: string): boolean {
	const m = stripMime(mime);
	if (m === 'image/svg+xml') return true; // webpublic/thumbnail of svg is png
	if (!(m.startsWith('image') || m.startsWith('video') || m.startsWith('audio'))) return false;
	return FILE_TYPE_BROWSERSAFE.includes(m) || FILE_TYPE_BROWSERSAFE_SHARKEY.includes(m);
}

/**
 * Which Sharkey component should render this file. 'other' (and anything unsupported) goes to the
 * banner fallback. Tracker/flash win over the MIME-based kinds because those files are often
 * served as application/octet-stream or audio/*.
 */
export function classifySkMedia(file: SkMediaFileLike): SkMediaKind {
	if (isTrackerModule(file)) return 'tracker';
	if (isFlashContent(file)) return 'flash';
	if (!isSkBrowserSafe(file.type)) return 'other';
	const m = stripMime(file.type);
	if (m.startsWith('video')) return 'video';
	if (m.startsWith('audio')) return 'audio';
	return 'image';
}

/** Files shown in the inline grid (images/video/tracker/flash); everything else is a banner. */
export function isSkPreviewable(file: SkMediaFileLike): boolean {
	const kind = classifySkMedia(file);
	return kind === 'image' || kind === 'video' || kind === 'tracker' || kind === 'flash';
}
