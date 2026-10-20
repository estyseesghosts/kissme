/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, test, expect } from 'vitest';
import { canGetEmojiInfo, canReactWith, isReactionMuted, partitionMutedReactions, reactionEmojiName } from '@/utility/sk-reaction-rules.js';
import type { SkReactionContext } from '@/utility/sk-reaction-rules.js';

const ctx = (o: Partial<SkReactionContext> = {}): SkReactionContext => ({ meHost: null, meRoleIds: [], noteHost: null, acceptance: null, ...o });

describe('canReactWith', () => {
	test('unicode always allowed unless likeOnly', () => {
		expect(canReactWith(ctx(), '👍', { unicode: true })).toBe(true);
		expect(canReactWith(ctx({ acceptance: 'likeOnly' }), '👍', { unicode: true })).toBe(false);
	});
	test('unknown emoji and remote-custom reactions are blocked', () => {
		expect(canReactWith(ctx(), ':x:', null)).toBe(false);
		expect(canReactWith(ctx(), ':x@example.com:', {})).toBe(false);
	});
	test('sensitive emoji blocked in both nonSensitive modes only', () => {
		const e = { isSensitive: true };
		expect(canReactWith(ctx({ acceptance: 'nonSensitiveOnly' }), ':x:', e)).toBe(false);
		expect(canReactWith(ctx({ acceptance: 'nonSensitiveOnlyForLocalLikeOnlyForRemote' }), ':x:', e)).toBe(false);
		expect(canReactWith(ctx({ acceptance: 'likeOnlyForRemote' }), ':x:', e)).toBe(true);
		expect(canReactWith(ctx(), ':x:', e)).toBe(true);
	});
	test('localOnly emoji need a note from the same host', () => {
		expect(canReactWith(ctx({ noteHost: 'a.example' }), ':x:', { localOnly: true })).toBe(false);
		expect(canReactWith(ctx(), ':x:', { localOnly: true })).toBe(true);
	});
	test('role-restricted emoji', () => {
		const e = { roleIdsThatCanBeUsedThisEmojiAsReaction: ['r1'] };
		expect(canReactWith(ctx({ meRoleIds: ['r2'] }), ':x:', e)).toBe(false);
		expect(canReactWith(ctx({ meRoleIds: ['r1'] }), ':x:', e)).toBe(true);
	});
});

describe('info / mute helpers', () => {
	test('canGetEmojiInfo', () => {
		expect(canGetEmojiInfo(':a@.:')).toBe(true);
		expect(canGetEmojiInfo(':a@b.c:')).toBe(false);
		expect(canGetEmojiInfo('👍')).toBe(false);
	});
	test('names and muting', () => {
		expect(reactionEmojiName(':a@.:')).toBe('a');
		expect(isReactionMuted(':a@.:', ['a'])).toBe(true);
		expect(isReactionMuted('👍', ['a'])).toBe(false);
	});
	test('partition keeps my reaction visible', () => {
		const r = partitionMutedReactions([[':a:', 2], [':b:', 1], ['👍', 3]], ['a', 'b'], ':b:');
		expect(r.hidden.map(x => x[0])).toEqual([':a:']);
		expect(r.visible.map(x => x[0])).toEqual([':b:', '👍']);
	});
});

describe('toggleMutedEmoji', () => {
	test('adds the bare emoji name, then removes it again', async () => {
		const { toggleMutedEmoji } = await import('@/utility/sk-reaction-rules.js');
		const added = toggleMutedEmoji([], ':blobcat@.:');
		expect(added).toEqual(['blobcat']);
		expect(toggleMutedEmoji(added, ':blobcat@.:')).toEqual([]);
	});
});
