/*
 * SPDX-FileCopyrightText: syuilo and other misskey contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, test, expect } from 'vitest';
import type * as Misskey from 'misskey-js';
import { addReplyToList, removeReplyFromList } from '@/utility/sk-reply-list.js';

function note(id: string): Misskey.entities.Note {
	return { id, repliesCount: 0 } as Misskey.entities.Note;
}

describe('addReplyToList', () => {
	test('unshifts the reply and increments repliesCount', () => {
		const replies = [note('a')];
		const holder = { repliesCount: 1 };
		addReplyToList(replies, holder, note('b'));
		expect(replies.map((r) => r.id)).toEqual(['b', 'a']);
		expect(holder.repliesCount).toBe(2);
	});
});

describe('removeReplyFromList', () => {
	test('removes the reply and decrements repliesCount', () => {
		const replies = [note('b'), note('a')];
		const holder = { repliesCount: 2 };
		removeReplyFromList(replies, holder, 'b');
		expect(replies.map((r) => r.id)).toEqual(['a']);
		expect(holder.repliesCount).toBe(1);
	});
	test('is a no-op for unknown ids so a stream echo cannot double-remove', () => {
		const replies = [note('a')];
		const holder = { repliesCount: 1 };
		removeReplyFromList(replies, holder, 'missing');
		expect(replies.map((r) => r.id)).toEqual(['a']);
		expect(holder.repliesCount).toBe(1);
	});
});
