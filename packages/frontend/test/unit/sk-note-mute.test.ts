/*
 * SPDX-FileCopyrightText: syuilo and other misskey contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';
import type * as Misskey from 'misskey-js';
import type { MenuItem } from '@/types/menu.js';

const misskeyApi = vi.fn(async () => ({ isFavorited: false, isMutedThread: false }));
const apiWithDialog = vi.fn(async () => ({}));
vi.mock('@/utility/misskey-api.js', () => ({ misskeyApi }));
vi.mock('@/os.js', () => ({
	apiWithDialog,
	confirm: vi.fn(async () => ({ canceled: true })),
	alert: vi.fn(async () => undefined),
	toast: vi.fn(),
}));
vi.mock('@/i.js', () => ({
	$i: { id: 'me', pinnedNoteIds: [], isModerator: false, isAdmin: false, policies: { canUseTranslator: false } },
}));
vi.mock('@/i18n.js', () => ({
	i18n: {
		ts: new Proxy({}, { get: (_t, p) => p }),
		tsx: new Proxy({}, { get: (_t, p) => () => p }),
	},
}));
vi.mock('@/instance.js', () => ({ instance: { translatorAvailable: false } }));
vi.mock('@/preferences.js', () => ({ prefer: { s: { devMode: false } } }));
vi.mock('@/plugin.js', () => ({ getPluginHandlers: () => [] }));
vi.mock('@/utility/achievements.js', () => ({ claimAchievement: () => {} }));
vi.mock('@/cache.js', () => ({
	clipsCache: { fetch: async () => [] },
	favoritedChannelsCache: { fetch: async () => [] },
}));
vi.mock('@/utility/get-user-menu.js', () => ({
	getUserMenu: () => ({ menu: [], cleanup: () => {} }),
}));
vi.mock('@/store.js', () => ({ store: { s: {} } }));
vi.mock('@/local-storage.js', () => ({ miLocalStorage: { getItem: () => null } }));

const { getNoteMenu } = await import('@/utility/get-note-menu.js');

function note(partial: Record<string, unknown> = {}): Misskey.entities.Note {
	return {
		id: 'n1',
		createdAt: new Date().toISOString(),
		userId: 'someone-else',
		user: { id: 'someone-else', name: 'Someone', username: 'someone', host: null },
		text: 'hello',
		cw: null,
		visibility: 'public',
		renoteCount: 0,
		repliesCount: 0,
		reactionAcceptance: null,
		...partial,
	} as unknown as Misskey.entities.Note;
}

async function menuItemsFor(n: Misskey.entities.Note): Promise<MenuItem[]> {
	const { menu } = getNoteMenu({ note: n, translation: ref(null), translating: ref(false) });
	return (await Promise.all(menu.map((m) => m))) as MenuItem[];
}

function actionOf(items: MenuItem[], text: string): () => void {
	const item = items.find((m) => (m as { text?: unknown }).text === text);
	expect(item, `menu item ${text}`).toBeDefined();
	const action = (item as { action?: unknown }).action;
	expect(typeof action).toBe('function');
	return action as () => void;
}

beforeEach(() => {
	misskeyApi.mockClear();
	apiWithDialog.mockClear();
});

describe('getNoteMenu single-note mute', () => {
	test('offers muteNote with noteOnly:true when the backend exposes no isMutingNote', async () => {
		const items = await menuItemsFor(note());
		actionOf(items, 'muteNote')();
		expect(apiWithDialog).toHaveBeenCalledWith('notes/thread-muting/create', { noteId: 'n1', noteOnly: true });
		expect(apiWithDialog).toHaveBeenCalledTimes(1);
	});

	test('offers unmuteNote when isMutingNote is true', async () => {
		const items = await menuItemsFor(note({ isMutingNote: true }));
		actionOf(items, 'unmuteNote')();
		expect(apiWithDialog).toHaveBeenCalledWith('notes/thread-muting/delete', { noteId: 'n1', noteOnly: true });
		expect(apiWithDialog).toHaveBeenCalledTimes(1);
	});

	test('keeps the thread-mute items on the typed {noteId}-only shape', async () => {
		const items = await menuItemsFor(note());
		actionOf(items, 'muteThread')();
		expect(apiWithDialog).toHaveBeenCalledWith('notes/thread-muting/create', { noteId: 'n1' });
		expect(apiWithDialog).toHaveBeenCalledTimes(1);
	});
});
