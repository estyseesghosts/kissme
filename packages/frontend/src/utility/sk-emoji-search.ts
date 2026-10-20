/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

// Pure search/normalisation helpers for SkEmojiPicker (Sharkey emoji picker improvements).

export type SkCustomEmojiLike = { name: string; aliases: string[] };
export type SkUnicodeEmojiLike = { name: string; char: string };
export type SkEmojiFolderTree = { value: string; category: string; children: SkEmojiFolderTree[] };

export const SK_EMOJI_SEARCH_MAX = 100;

/** Trim, strip colons, NFC-normalise and lowercase a raw search query. */
export function normalizeEmojiQuery(raw: string): string {
	return raw.trim().replace(/:/g, '').normalize('NFC').toLowerCase();
}

/** Drop null/undefined entries (recent/pinned entries whose definition could not be resolved). */
export function compactDefs<T>(list: readonly (T | null | undefined)[]): T[] {
	return list.filter((x): x is T => x != null);
}

/**
 * Build the category folder tree. Every node's `category` is its full path ("a/b"),
 * not the leaf input. An empty-category node ('') is always added for uncategorised emojis.
 */
export function buildEmojiFolderTree(categories: readonly (string | null | undefined)[]): SkEmojiFolderTree {
	const root: SkEmojiFolderTree = { value: '', category: '', children: [] };

	const add = (category: string) => {
		let node = root;
		const path: string[] = [];
		for (const part of category.split('/').map(p => p.trim())) {
			path.push(part);
			let next = node.children.find(c => c.value === part);
			if (!next) {
				next = { value: part, category: path.join('/'), children: [] };
				node.children.push(next);
			}
			node = next;
		}
	};

	for (const c of categories) {
		if (c != null) add(c);
	}
	add('');

	return root;
}

function collect<T>(matches: Set<T>, items: readonly T[], pred: (x: T) => boolean, max: number): boolean {
	for (const item of items) {
		if (pred(item)) {
			matches.add(item);
			if (matches.size >= max) return true;
		}
	}
	return false;
}

/** Search custom emojis. `query` must already be normalised. Ranked: exact name, exact alias, name prefix, alias prefix, name substring, alias substring. */
export function searchCustomEmojis<T extends SkCustomEmojiLike>(emojis: readonly T[], query: string, max = SK_EMOJI_SEARCH_MAX): T[] {
	const matches = new Set<T>();
	if (query === '') return [];

	const exact = emojis.find(e => e.name.toLowerCase() === query);
	if (exact) matches.add(exact);

	if (query.includes(' ')) {
		const keywords = query.split(' ').filter(k => k !== '');
		if (collect(matches, emojis, e => keywords.every(k => e.name.toLowerCase().includes(k)), max)) return [...matches];
		collect(matches, emojis, e => keywords.every(k => e.name.toLowerCase().includes(k) || e.aliases.some(a => a.toLowerCase().includes(k))), max);
		return [...matches];
	}

	const steps: ((e: T) => boolean)[] = [
		e => e.aliases.some(a => a.toLowerCase() === query),
		e => e.name.toLowerCase().startsWith(query),
		e => e.aliases.some(a => a.toLowerCase().startsWith(query)),
		e => e.name.toLowerCase().includes(query),
		e => e.aliases.some(a => a.toLowerCase().includes(query)),
	];
	for (const step of steps) {
		if (collect(matches, emojis, step, max)) break;
	}
	return [...matches];
}

/** Search unicode emojis. `indexes` are the user's additional keyword indexes (char -> keywords). */
export function searchUnicodeEmojis<T extends SkUnicodeEmojiLike>(emojis: readonly T[], query: string, indexes: readonly Record<string, string[]>[] = [], max = SK_EMOJI_SEARCH_MAX): T[] {
	const matches = new Set<T>();
	if (query === '') return [];

	const exact = emojis.find(e => e.name === query);
	if (exact) matches.add(exact);

	const viaIndex = (pred: (keywords: string[]) => boolean) => {
		for (const index of indexes) {
			if (collect(matches, emojis, e => { const k = index[e.char]; return k != null && pred(k); }, max)) return true;
		}
		return false;
	};

	if (query.includes(' ')) {
		const keywords = query.split(' ').filter(k => k !== '');
		if (collect(matches, emojis, e => keywords.every(k => e.name.includes(k)), max)) return [...matches];
		viaIndex(ks => keywords.every(k => ks.some(x => x.includes(k))));
		return [...matches];
	}

	if (collect(matches, emojis, e => e.name.startsWith(query), max)) return [...matches];
	if (viaIndex(ks => ks.some(x => x.startsWith(query)))) return [...matches];
	if (collect(matches, emojis, e => e.name.includes(query), max)) return [...matches];
	viaIndex(ks => ks.some(x => x.includes(query)));
	return [...matches];
}
