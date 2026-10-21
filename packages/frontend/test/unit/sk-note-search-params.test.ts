/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, test } from 'vitest';
import { buildFiletypeParams, NOTE_SEARCH_FILE_TYPES } from '@/utility/sk-note-search-params.js';

describe('buildFiletypeParams', () => {
	test('null omits the key', () => {
		expect(buildFiletypeParams(null)).toEqual({});
		expect('filetype' in buildFiletypeParams(null)).toBe(false);
	});

	test('each supported type passes through', () => {
		expect(NOTE_SEARCH_FILE_TYPES).toEqual(['image', 'video', 'audio', 'module', 'flash']);
		for (const filetype of NOTE_SEARCH_FILE_TYPES) {
			expect(buildFiletypeParams(filetype)).toEqual({ filetype });
		}
	});
});
