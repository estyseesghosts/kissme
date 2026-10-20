/*
 * SPDX-FileCopyrightText: syuilo and other misskey contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * Pure helpers for the Sharkey static pages (about-sharkey, unsubscribe, welcome.entrance.a).
 */

export type EntranceStyle = 'classic' | 'simple' | 'a';

/** Value of the `welcomeEntranceStyle` pref. 'server' defers to the server's `entrancePageStyle`. */
export type EntrancePref = 'server' | 'a';

/**
 * Picks the entrance variant. Only an explicit opt-in to 'a' changes anything, so the stock
 * behavior (server setting, falling back to 'classic') holds while the pref is 'server'.
 */
export function resolveEntranceStyle(serverStyle: string | null | undefined, pref: EntrancePref): EntranceStyle {
	if (pref === 'a') return 'a';
	return serverStyle === 'simple' ? 'simple' : 'classic';
}

/** Endpoint path for the unsubscribe call; segments are URL-encoded so a token cannot alter the path. */
export function buildUnsubscribeEndpoint(user: string, token: string): string {
	return `unsubscribe/${encodeURIComponent(user)}/${encodeURIComponent(token)}`;
}

/**
 * Fisher-Yates shuffle (copy; the input is not modified). `random` is injectable for tests.
 * https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
 */
export function shuffled<T>(array: readonly T[], random: () => number = Math.random): T[] {
	const result = [...array];
	for (let i = result.length - 1; i > 0; i--) {
		const j = Math.floor(random() * (i + 1));
		[result[i], result[j]] = [result[j], result[i]];
	}
	return result;
}

export type SponsorData = {
	name: string;
	image?: string | null;
	website?: string | null;
	profile?: string | null;
};

export type SponsorPerson = {
	handle: string;
	avatar: string;
	link?: string;
};

/** Maps the `sponsors` endpoint payload to display rows, with the donor's avatar fallback. */
export function sponsorsToPeople(sponsors: readonly SponsorData[]): SponsorPerson[] {
	return sponsors.map(s => ({
		handle: s.name,
		avatar: s.image || `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${encodeURIComponent(s.name)}`,
		link: s.website || s.profile || undefined,
	}));
}
