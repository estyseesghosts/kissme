/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, test, expect } from 'vitest';
import { normalizeEmojiQuery, compactDefs, buildEmojiFolderTree, searchCustomEmojis, searchUnicodeEmojis } from '@/utility/sk-emoji-search.js';

const e = (name: string, aliases: string[] = []) => ({ name, aliases });

describe('normalizeEmojiQuery', () => {
	test('trims, strips colons, lowercases, NFC', () => {
		expect(normalizeEmojiQuery('  :Blob_Cat: ')).toBe('blob_cat');
		expect(normalizeEmojiQuery('é')).toBe('é');
	});
});

describe('compactDefs', () => {
	test('removes null and undefined', () => {
		expect(compactDefs(['a', null, 'b', undefined])).toEqual(['a', 'b']);
	});
});

describe('buildEmojiFolderTree', () => {
	test('uses full paths and adds root-level empty category', () => {
		const t = buildEmojiFolderTree(['a/b', 'a/c', null, 'd']);
		expect(t.children.map(c => c.value)).toEqual(['a', 'd', '']);
		const a = t.children[0];
		expect(a.category).toBe('a');
		expect(a.children.map(c => c.category)).toEqual(['a/b', 'a/c']);
	});
});

describe('searchCustomEmojis', () => {
	const list = [e('cat_blob', ['neko']), e('catface'), e('dog', ['inu', 'catlike']), e('Bird')];
	test('alias prefix search works', () => {
		expect(searchCustomEmojis(list, 'nek').map(x => x.name)).toEqual(['cat_blob']);
	});
	test('ranks name prefix before alias prefix before substring', () => {
		expect(searchCustomEmojis(list, 'cat').map(x => x.name)).toEqual(['cat_blob', 'catface', 'dog']);
	});
	test('exact alias first, case-insensitive on stored names', () => {
		expect(searchCustomEmojis(list, 'inu')[0].name).toBe('dog');
		expect(searchCustomEmojis(list, 'bird').map(x => x.name)).toEqual(['Bird']);
	});
	test('AND search and max', () => {
		expect(searchCustomEmojis(list, 'cat face').map(x => x.name)).toEqual(['catface']);
		expect(searchCustomEmojis(list, 'cat', 1)).toHaveLength(1);
	});
});

describe('searchUnicodeEmojis', () => {
	const list = [{ name: 'grinning', char: 'A' }, { name: 'smile', char: 'B' }];
	test('name prefix, then additional index', () => {
		expect(searchUnicodeEmojis(list, 'gri').map(x => x.char)).toEqual(['A']);
		expect(searchUnicodeEmojis(list, 'wara', [{ B: ['warai'] }]).map(x => x.char)).toEqual(['B']);
	});
});
