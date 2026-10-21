/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

// `filetype` fragment for `notes/search` params (Sharkey donor extension).
// `misskey-js` has no `filetype` in its `notes/search` request type and the
// stock backend rejects the unknown field, so callers merge this fragment into
// the paginator params via an untyped cast and let the paginator surface the
// backend error state instead of filtering client-side (never fake results).

export type NoteSearchFileType = 'image' | 'video' | 'audio' | 'module' | 'flash';

export const NOTE_SEARCH_FILE_TYPES: readonly NoteSearchFileType[] = [
	'image',
	'video',
	'audio',
	'module',
	'flash',
];

/** `null` means "no filter" and is omitted so no `filetype` key is sent. */
export function buildFiletypeParams(filetype: NoteSearchFileType | null): { filetype?: NoteSearchFileType } {
	return filetype == null ? {} : { filetype };
}
