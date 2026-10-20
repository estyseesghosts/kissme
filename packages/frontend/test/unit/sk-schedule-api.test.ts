/*
 * SPDX-FileCopyrightText: syuilo and other misskey contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';

const misskeyApi = vi.fn(async () => ({}));
const apiWithDialog = vi.fn(async () => ({}));
vi.mock('@/utility/misskey-api.js', () => ({ misskeyApi }));
vi.mock('@/os.js', () => ({ apiWithDialog }));

const { createScheduledNote, deleteScheduledNote, listScheduledNotes } = await import('@/utility/sk-schedule-api.js');

beforeEach(() => {
	misskeyApi.mockClear();
	apiWithDialog.mockClear();
});

describe('sk-schedule-api', () => {
	test('create posts the note body, with the token, to notes/schedule/create', async () => {
		const body = { text: 'hi', scheduleNote: { scheduledAt: 1234 } };
		await createScheduledNote(body, 'tok');
		expect(misskeyApi).toHaveBeenCalledWith('notes/schedule/create', body, 'tok');
	});
	test('delete goes through the dialog helper with { noteId }', async () => {
		await deleteScheduledNote('n1');
		expect(apiWithDialog).toHaveBeenCalledWith('notes/schedule/delete', { noteId: 'n1' });
	});
	test('list defaults to an empty body', async () => {
		await listScheduledNotes();
		expect(misskeyApi).toHaveBeenCalledWith('notes/schedule/list', {});
	});
});
