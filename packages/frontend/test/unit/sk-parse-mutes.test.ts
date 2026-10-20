/*
 * SPDX-FileCopyrightText: syuilo and other misskey contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, test, expect } from 'vitest';
import { parseMuteText, testMutePatterns } from '@/utility/sk-parse-mutes.js';

describe('parseMuteText', () => {
	test('splits plain lines into AND patterns and keeps regex lines as strings', () => {
		expect(parseMuteText('foo bar\n/b+/i\n\n  baz  ').mutes).toEqual([['foo', 'bar'], '/b+/i', ['baz']]);
	});

	test('reports invalid regex lines (1-based, empty lines not counted) and omits them', () => {
		const r = parseMuteText('ok\n/(/\nfine');
		expect(r.invalidLines).toEqual([2]);
		expect(r.mutes).toEqual([['ok'], ['fine']]);
	});
});

describe('testMutePatterns', () => {
	test('flags matches per mute set', () => {
		expect(testMutePatterns('foo bar\n/\\d+/', 'foo and bar\nroom 42').matches).toEqual(['foo bar', '42']);
	});

	test('tests each sample line separately for AND patterns', () => {
		expect(testMutePatterns('foo bar', 'foo\nbar').matches).toEqual([]);
	});

	test('returns nothing for empty mutes', () => {
		expect(testMutePatterns('', 'anything').matches).toEqual([]);
	});
});
