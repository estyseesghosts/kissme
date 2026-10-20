/*
 * SPDX-FileCopyrightText: syuilo and other misskey contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { misskeyApi } from '@/utility/misskey-api.js';
import * as os from '@/os.js';

/**
 * `notes/schedule/create|delete|list` are Sharkey endpoints and are absent from misskey-js
 * (and from a stock Misskey backend). The donor calls them directly, so these wrappers
 * keep the same calls through untyped aliases. Remove the casts once misskey-js exposes them.
 */
type UntypedApi = (endpoint: string, body: object, token?: string | null) => Promise<unknown>;

const api = misskeyApi as unknown as UntypedApi;

// os.apiWithDialog is resolved lazily: this module is imported (through MkPostForm and
// MkSchedulePostListDialog) during os.js initialization, so reading it eagerly throws
// `Cannot access 'apiWithDialog' before initialization` in native-ESM dev (white screen).
function apiWithDialog(endpoint: string, body: object): Promise<unknown> {
	return (os.apiWithDialog as unknown as UntypedApi)(endpoint, body);
}

/** Same body as `notes/create`, plus `scheduleNote: { scheduledAt }`. */
export function createScheduledNote(body: object, token?: string | null): Promise<unknown> {
	return api('notes/schedule/create', body, token);
}

export function deleteScheduledNote(noteId: string): Promise<unknown> {
	return apiWithDialog('notes/schedule/delete', { noteId });
}

export function listScheduledNotes(body: { limit?: number; offset?: number } = {}): Promise<unknown> {
	return api('notes/schedule/list', body);
}

/**
 * `notes/edit` is likewise absent from misskey-js. Used by MkPostForm when `editId` is set.
 */
export function editNote(body: object, token?: string | null): Promise<unknown> {
	return api('notes/edit', body, token);
}
