/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, test, expect } from 'vitest';
import type * as Misskey from 'misskey-js';
import { moveItem, removeFileById, replaceFileById } from '@/utility/sk-attaches.js';

const f = (id: string) => ({ id, name: `${id}.png` }) as Misskey.entities.DriveFile;

describe('replaceFileById', () => {
	test('replaces in place, keeping order', () => {
		const list = [f('a'), f('b'), f('c')];
		const out = replaceFileById(list, 'b', f('b2'));
		expect(out.map(x => x.id)).toEqual(['a', 'b2', 'c']);
		expect(list.map(x => x.id)).toEqual(['a', 'b', 'c']);
	});
	test('unknown id leaves the list as is', () => {
		const list = [f('a')];
		expect(replaceFileById(list, 'zzz', f('x'))).toBe(list);
	});
});

describe('removeFileById', () => {
	test('detaches only the matching file', () => {
		expect(removeFileById([f('a'), f('b')], 'a').map(x => x.id)).toEqual(['b']);
		expect(removeFileById([f('a')], 'nope').map(x => x.id)).toEqual(['a']);
	});
});

describe('moveItem', () => {
	test('moves forward and backward', () => {
		expect(moveItem([1, 2, 3, 4], 0, 2)).toEqual([2, 3, 1, 4]);
		expect(moveItem([1, 2, 3, 4], 3, 1)).toEqual([1, 4, 2, 3]);
	});
	test('no-ops return the same list', () => {
		const l = [1, 2, 3];
		expect(moveItem(l, 1, 1)).toBe(l);
		expect(moveItem(l, -1, 2)).toBe(l);
		expect(moveItem(l, 0, 3)).toBe(l);
	});
});
