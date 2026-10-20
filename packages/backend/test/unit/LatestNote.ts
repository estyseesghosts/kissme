/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, test } from 'vitest';
import { SkLatestNote } from '@/models/LatestNote.js';

const base = {
	id: 'some-note-id',
	visibility: 'public',
	userId: 'some-user-id',
	replyId: null,
	renoteId: null,
	text: null,
	cw: null,
	hasPoll: false,
	fileIds: [] as string[],
} as const;

describe('SkLatestNote.keyFor', () => {
	test('public non-reply non-quote note', () => {
		expect(SkLatestNote.keyFor({ ...base })).toEqual({
			userId: 'some-user-id',
			isPublic: true,
			isReply: false,
			isQuote: false,
		});
	});

	test('home note is not public', () => {
		expect(SkLatestNote.keyFor({ ...base, visibility: 'home' }).isPublic).toBe(false);
	});

	test('reply note', () => {
		expect(SkLatestNote.keyFor({ ...base, replyId: 'some-reply-id' }).isReply).toBe(true);
	});

	test('pure renote is not a quote', () => {
		expect(SkLatestNote.keyFor({ ...base, renoteId: 'some-renote-id' }).isQuote).toBe(false);
	});

	test('quote renote (with text) is a quote', () => {
		expect(SkLatestNote.keyFor({ ...base, renoteId: 'some-renote-id', text: 'some-text' }).isQuote).toBe(true);
	});
});

describe('SkLatestNote.areEquivalent', () => {
	test('same keys are equivalent', () => {
		expect(SkLatestNote.areEquivalent({ ...base }, { ...base, id: 'other-note-id' })).toBe(true);
	});

	test('reply vs non-reply are not equivalent', () => {
		expect(SkLatestNote.areEquivalent({ ...base }, { ...base, replyId: 'some-reply-id' })).toBe(false);
	});

	test('pure renote vs quote are not equivalent', () => {
		expect(SkLatestNote.areEquivalent(
			{ ...base, renoteId: 'some-renote-id' },
			{ ...base, renoteId: 'some-renote-id', text: 'some-text' },
		)).toBe(false);
	});
});
