/*
 * SPDX-FileCopyrightText: hazelnoot and other Sharkey contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as Misskey from 'misskey-js';
import { describe, test, expect } from 'vitest';
import { containsMutedWord, getMutedWords, expandNote } from '@/utility/sk-check-mute.js';

function note(partial: Partial<Misskey.entities.Note>): Misskey.entities.Note {
	return { id: 'n1', text: null, cw: null, files: [], poll: null, ...partial } as unknown as Misskey.entities.Note;
}

describe('containsMutedWord', () => {
	test('matches a pattern mute only when every word is present', () => {
		expect(containsMutedWord([['foo', 'bar']], ['a foo and bar here'])).toBe(true);
		expect(containsMutedWord([['foo', 'bar']], ['only foo here'])).toBe(false);
	});

	test('matches a regex mute written as /pattern/flags', () => {
		expect(containsMutedWord(['/colou?r/i'], ['Favourite COLOR'])).toBe(true);
		expect(containsMutedWord(['/colou?r/i'], ['nothing here'])).toBe(false);
	});

	test('ignores invalid regex and empty patterns', () => {
		expect(containsMutedWord(['/(/'], ['anything'])).toBe(false);
		expect(containsMutedWord([[]], ['anything'])).toBe(false);
	});
});

describe('getMutedWords', () => {
	test('returns the labels of matched pattern mutes, de-duplicated', () => {
		expect(getMutedWords([['foo', 'bar']], ['foo bar', 'foo bar again'])).toEqual(['foo bar']);
	});

	test('returns regex match text', () => {
		expect(getMutedWords(['/\\d+/'], ['a 12 and 345'])).toEqual(['12', '345']);
	});
});

describe('expandNote', () => {
	test('yields cw, text, file comments and poll choices', () => {
		const n = note({
			cw: 'spoiler',
			text: 'body',
			files: [{ comment: 'file note' }] as unknown as Misskey.entities.DriveFile[],
			poll: { choices: [{ text: 'yes' }, { text: 'no' }] } as unknown as Misskey.entities.Note['poll'],
		});
		expect([...expandNote(n)]).toEqual(['spoiler', 'body', 'file note', 'yes', 'no']);
	});
});
