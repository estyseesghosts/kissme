/*
 * SPDX-FileCopyrightText: syuilo and other misskey contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';

const misskeyApi = vi.fn(async (..._args: unknown[]) => ({}));
const alert = vi.fn(async () => undefined);
const emit = vi.fn();
vi.mock('@/utility/misskey-api.js', () => ({ misskeyApi }));
vi.mock('@/os.js', () => ({ alert }));
vi.mock('@/composables/use-note-capture.js', () => ({ noteEvents: { emit } }));
vi.mock('@/i.js', () => ({ $i: { id: 'me' } }));

const { likeNote, likeNoteWithFeedback } = await import('@/utility/sk-like.js');

beforeEach(() => {
	misskeyApi.mockClear();
	alert.mockClear();
	emit.mockClear();
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
	test('syncs the resolved reaction and favorited flag on liked', async () => {
		misskeyApi.mockResolvedValueOnce({}).mockResolvedValueOnce({ myReaction: '❤', isFavorited: false });
		const note: { id: string; isFavorited?: boolean } = { id: 'n1' };
		await likeNoteWithFeedback(note, null, () => null);
		expect(note.isFavorited).toBe(false);
		expect(misskeyApi).toHaveBeenNthCalledWith(2, 'notes/show', { noteId: 'n1' });
		expect(emit).toHaveBeenCalledWith('reacted:n1', { userId: 'me', reaction: '❤' });
		expect(alert).not.toHaveBeenCalled();
	});
	test('emits unreacted with the execution-time key when the like toggled one off', async () => {
		misskeyApi.mockResolvedValueOnce({}).mockResolvedValueOnce({ myReaction: null, isFavorited: false });
		const note: { id: string; isFavorited?: boolean } = { id: 'n1', isFavorited: true };
		await likeNoteWithFeedback(note, null, () => '❤');
		expect(note.isFavorited).toBe(false);
		expect(emit).toHaveBeenCalledWith('unreacted:n1', { userId: 'me', reaction: '❤' });
	});
	test('marks favorited without emitting on a pure-favorite backend', async () => {
		misskeyApi.mockResolvedValueOnce({}).mockResolvedValueOnce({ myReaction: null, isFavorited: true });
		const note: { id: string; isFavorited?: boolean } = { id: 'n1' };
		await likeNoteWithFeedback(note, null, () => null);
		expect(note.isFavorited).toBe(true);
		expect(emit).not.toHaveBeenCalled();
	});
	test('leaves state alone when the refresh fails', async () => {
		misskeyApi.mockResolvedValueOnce({}).mockRejectedValueOnce(new Error('gone'));
		const note: { id: string; isFavorited?: boolean } = { id: 'n1' };
		await likeNoteWithFeedback(note, null, () => null);
		expect(note.isFavorited).toBe(true);
		expect(emit).not.toHaveBeenCalled();
	});
	test('alerts without marking or refetching on unsupported', async () => {
		misskeyApi.mockRejectedValueOnce({ code: 'UNKNOWN_API_ENDPOINT' });
		const note: { id: string; isFavorited?: boolean } = { id: 'n1' };
		await likeNoteWithFeedback(note, null, () => null);
		expect(note.isFavorited).toBeUndefined();
		expect(misskeyApi).toHaveBeenCalledTimes(1);
		expect(alert).toHaveBeenCalledTimes(1);
	});
	test('serializes rapid presses on the same note in call order', async () => {
		misskeyApi
			.mockResolvedValueOnce({})
			.mockResolvedValueOnce({ myReaction: '❤', isFavorited: false })
			.mockResolvedValueOnce({})
			.mockResolvedValueOnce({ myReaction: null, isFavorited: false });
		let local: string | null = null;
		emit.mockImplementation((event: string, ctx: { reaction: string }) => {
			local = event.startsWith('reacted:') ? ctx.reaction : null;
		});
		const note: { id: string; isFavorited?: boolean } = { id: 'n1' };
		await Promise.all([
			likeNoteWithFeedback(note, null, () => local),
			likeNoteWithFeedback(note, null, () => local),
		]);
		expect(misskeyApi.mock.calls.map(c => c[0])).toEqual([
			'notes/like', 'notes/show', 'notes/like', 'notes/show',
		]);
		expect(emit).toHaveBeenNthCalledWith(1, 'reacted:n1', { userId: 'me', reaction: '❤' });
		expect(emit).toHaveBeenNthCalledWith(2, 'unreacted:n1', { userId: 'me', reaction: '❤' });
		expect(local).toBeNull();
	});
});
