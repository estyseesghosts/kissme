/*
 * SPDX-FileCopyrightText: hazelnoot and other Sharkey contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, test, vi } from 'vitest';
import { ref, shallowRef } from 'vue';
import type { FollowingFeedState } from '@/types/following-feed.js';

vi.mock('@/i18n.js', () => ({
	i18n: { ts: { following: 'Following', followers: 'Followers', mutuals: 'Mutuals', options: 'Options', showNonPublicNotes: 'Show non-public', showQuotes: 'Show quotes', showBots: 'Show bots in timeline', showReplies: 'Show replies', fileAttachedOnly: 'Only notes with files' } },
}));
vi.mock('@/os.js', () => ({ popupMenu: vi.fn() }));
vi.mock('@/preferences.js', () => ({ prefer: { r: {}, s: {}, commit: vi.fn() } }));

import { createModel, createOptionsMenu, followingTabIcon, followingTabName } from '@/utility/following-feed-utils.js';
import { defaultFollowingFeedState, followersTab, followingFeedTabs, followingTab, mutualsTab } from '@/types/following-feed.js';

function makeStorage(initial: Partial<FollowingFeedState> = {}) {
	const state = ref<Partial<FollowingFeedState>>(initial);
	const save = vi.fn((updated: Partial<FollowingFeedState>) => {
		state.value = updated;
	});
	return { storage: shallowRef({ state, save }), state, save };
}

describe('following feed tabs', () => {
	test('names', () => {
		expect(followingTabName(followingTab)).toBe('Following');
		expect(followingTabName(followersTab)).toBe('Followers');
		expect(followingTabName(mutualsTab)).toBe('Mutuals');
		expect(followingTabName(null)).toBeNull();
		expect(followingTabName(undefined)).toBeNull();
	});

	test('icons are distinct per tab and default to following', () => {
		const icons = followingFeedTabs.map(t => followingTabIcon(t));
		expect(new Set(icons).size).toBe(3);
		expect(followingTabIcon(null)).toBe(followingTabIcon(followingTab));
	});
});

describe('createModel', () => {
	test('empty storage yields defaults', () => {
		const { storage } = makeStorage();
		const m = createModel(storage);
		expect(m.userList.value).toBe(defaultFollowingFeedState.userList);
		expect(m.withBots.value).toBe(true);
		expect(m.withReplies.value).toBe(false);
		expect(m.remoteWarningDismissed.value).toBe(false);
	});

	test('setting a value saves the full merged state', () => {
		const { storage, save } = makeStorage({ withQuotes: true });
		const m = createModel(storage);
		m.onlyFiles.value = true;
		expect(save).toHaveBeenCalledTimes(1);
		expect(save.mock.calls[0][0]).toEqual({ ...defaultFollowingFeedState, withQuotes: true, onlyFiles: true });
		expect(m.onlyFiles.value).toBe(true);
		expect(m.withQuotes.value).toBe(true);
	});

	test('withNonPublic reads false on the followers tab regardless of stored value', () => {
		const { storage } = makeStorage({ withNonPublic: true, userList: followersTab });
		const m = createModel(storage);
		expect(m.withNonPublic.value).toBe(false);
		m.userList.value = followingTab;
		expect(m.withNonPublic.value).toBe(true);
	});
});

describe('createOptionsMenu', () => {
	test('replies and files-only disable each other; non-public disabled on followers', () => {
		const { storage } = makeStorage({ userList: followersTab, withReplies: true });
		const menu = createOptionsMenu(storage) as { type: string; text?: string; disabled?: { value: boolean } }[];
		const switches = menu.filter(i => i.type === 'switch');
		expect(switches).toHaveLength(5);
		expect(switches[0].disabled?.value).toBe(true); // non-public
		expect(switches[3].disabled?.value).toBe(false); // replies, files-only off
		expect(switches[4].disabled?.value).toBe(true); // files-only, replies on
		expect(menu.filter(i => i.type === 'divider')).toHaveLength(1);
	});
});
