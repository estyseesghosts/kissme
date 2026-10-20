/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, test, expect } from 'vitest';
import { addMentionToText, getMissingMentions, isSelfMention, reactionAcceptanceHeaderIcon } from '@/utility/sk-post-form.js';

describe('getMissingMentions', () => {
	test('reports mentions with no matching visible user', () => {
		const missing = getMissingMentions('hi @alice @bob@example.com', [{ username: 'alice', host: null }]);
		expect(missing.map(m => `${m.username}@${m.host}`)).toEqual(['bob@example.com']);
	});
	test('username compare is case-insensitive; host is punycode-normalised', () => {
		expect(getMissingMentions('@Alice', [{ username: 'alice', host: null }])).toEqual([]);
		expect(getMissingMentions('@a@xn--r8jz45g.jp', [{ username: 'a', host: '例え.jp' }])).toEqual([]);
	});
	test('no mentions, nothing missing', () => {
		expect(getMissingMentions('plain text', [])).toEqual([]);
	});
});

describe('addMentionToText', () => {
	test('appends at the end with spacing', () => {
		expect(addMentionToText('hello', 'a', 'end')).toBe('hello @a ');
		expect(addMentionToText('hello ', 'a', 'end')).toBe('hello @a ');
		expect(addMentionToText('', 'a', 'end')).toBe(' @a ');
	});
	test('prepends at the start with spacing', () => {
		expect(addMentionToText('hello', 'a', 'start')).toBe('@a hello');
		expect(addMentionToText(' hello', 'a', 'start')).toBe('@a hello');
	});
	test('does not duplicate an existing mention', () => {
		expect(addMentionToText('hey @A you', 'a', 'end')).toBe('hey @A you');
		expect(addMentionToText('hey @a', 'a', 'start')).toBe('hey @a');
	});
});

describe('isSelfMention', () => {
	const me = { id: 'me', username: 'Me' };
	test('by id or by local username', () => {
		expect(isSelfMention({ id: 'me', username: 'x', host: 'h' }, me)).toBe(true);
		expect(isSelfMention({ username: 'me', host: null }, me)).toBe(true);
		expect(isSelfMention({ username: 'me', host: 'remote.example' }, me)).toBe(false);
		expect(isSelfMention({ id: 'u2', username: 'you', host: null }, me)).toBe(false);
	});
});

describe('reactionAcceptanceHeaderIcon', () => {
	test('maps each acceptance to an icon', () => {
		expect(reactionAcceptanceHeaderIcon('likeOnly')).toBe('ti ti-heart');
		expect(reactionAcceptanceHeaderIcon('likeOnlyForRemote')).toBe('ti ti-heart-plus');
		expect(reactionAcceptanceHeaderIcon(null)).toBe('ti ti-mood-smile');
		expect(reactionAcceptanceHeaderIcon('nonSensitiveOnly')).toBe('ti ti-mood-smile');
	});
});
