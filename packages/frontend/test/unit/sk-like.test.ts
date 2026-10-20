/*
 * SPDX-FileCopyrightText: syuilo and other misskey contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';

const misskeyApi = vi.fn(async () => ({}));
const alert = vi.fn(async () => undefined);
vi.mock('@/utility/misskey-api.js', () => ({ misskeyApi }));
vi.mock('@/os.js', () => ({ alert }));

const { likeNote, likeNoteWithFeedback } = await import('@/utility/sk-like.js');

beforeEach(() => {
	misskeyApi.mockClear();
	alert.mockClear();
});

describe('likeNote', () => {
	test('calls notes/like with the donor shape and reports liked', async () => {
		await expect(likeNote('n1', null)).resolves.toBe('liked');
		expect(misskeyApi).toHaveBeenCalledWith('notes/like', { noteId: 'n1', override: null }, undefined);
		expect(misskeyApi).toHaveBeenCalledTimes(1);
	});
	test('reports unsupported on UNKNOWN_API_ENDPOINT without touching anything else', async () => {
		misskeyApi.mockRejectedValueOnce({ code: 'UNKNOWN_API_ENDPOINT' });
		await expect(likeNote('n1', '❤')).resolves.toBe('unsupported');
		expect(misskeyApi).toHaveBeenCalledTimes(1);
	});
	test('rethrows other errors', async () => {
		misskeyApi.mockRejectedValueOnce({ code: 'SOME_OTHER_ERROR' });
		await expect(likeNote('n1', null)).rejects.toEqual({ code: 'SOME_OTHER_ERROR' });
		expect(misskeyApi).toHaveBeenCalledTimes(1);
	});
});

describe('likeNoteWithFeedback', () => {
	test('marks favorited on liked', async () => {
		const note: { id: string; isFavorited?: boolean } = { id: 'n1' };
		await likeNoteWithFeedback(note, null);
		expect(note.isFavorited).toBe(true);
		expect(alert).not.toHaveBeenCalled();
	});
	test('alerts without marking on unsupported', async () => {
		misskeyApi.mockRejectedValueOnce({ code: 'UNKNOWN_API_ENDPOINT' });
		const note: { id: string; isFavorited?: boolean } = { id: 'n1' };
		await likeNoteWithFeedback(note, null);
		expect(note.isFavorited).toBeUndefined();
		expect(alert).toHaveBeenCalledTimes(1);
	});
});
