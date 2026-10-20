/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, test } from 'vitest';
import { char2fluentEmojiFilePath, char2tossfaceFilePath, char2twemojiFilePath } from '@@/js/emoji-base.js';

describe('char2tossfaceFilePath', () => {
	test('zero-pads code points and drops fe0f', () => {
		expect(char2tossfaceFilePath('©️')).toBe('/tossface/00a9.svg');
	});

	test('joins ZWJ sequences with dashes', () => {
		expect(char2tossfaceFilePath('\u{1f468}‍\u{1f469}')).toBe('/tossface/1f468-200d-1f469.svg');
	});

	test('falls back to twemoji for the shibuya 50 range', () => {
		const char = String.fromCodePoint(0xe50a);
		expect(char2tossfaceFilePath(char)).toBe(char2twemojiFilePath(char));
	});
});

describe('char2fluentEmojiFilePath', () => {
	test('zero-pads code points', () => {
		expect(char2fluentEmojiFilePath('©')).toBe('/fluent-emoji/00a9.png');
	});

	test('flags fall back to twemoji', () => {
		expect(char2fluentEmojiFilePath('\u{1f1ef}\u{1f1f5}')).toBe('/twemoji/1f1ef-1f1f5.svg');
	});
});
