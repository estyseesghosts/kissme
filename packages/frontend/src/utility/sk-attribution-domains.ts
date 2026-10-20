/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/** One domain per line, trimmed and lower-cased; blank lines dropped. */
export function parseAttributionDomains(text: string): string[] {
	return text
		.trim().split('\n')
		.map(el => el.trim().toLowerCase())
		.filter(el => el);
}

/** Every entry must be a whole line without whitespace. */
export function isValidAttributionDomainList(domains: string[]): boolean {
	return domains.every(d => /^\S+$/.test(d));
}
