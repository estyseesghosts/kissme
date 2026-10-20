/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, test } from 'vitest';
import { parseSkPrefLines } from '@/utility/sk-pref-lines.js';

describe('parseSkPrefLines', () => {
	test('trims, drops blanks and duplicates, keeps order', () => {
		expect(parseSkPrefLines(' a \r\n\n:b:\na\n  \nc')).toEqual(['a', ':b:', 'c']);
	});
	test('empty input', () => {
		expect(parseSkPrefLines('')).toEqual([]);
	});
});
