/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * Parses a one-entry-per-line textarea into a list: trims each line, drops empty lines and duplicates (first one wins).
 */
export function parseSkPrefLines(text: string): string[] {
	const seen = new Set<string>();
	const result: string[] = [];
	for (const line of text.split(/\r?\n/)) {
		const v = line.trim();
		if (v === '' || seen.has(v)) continue;
		seen.add(v);
		result.push(v);
	}
	return result;
}
