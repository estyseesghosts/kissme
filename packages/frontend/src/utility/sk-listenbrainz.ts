/*
 * SPDX-FileCopyrightText: amelia and other Sharkey contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type SkListenBrainzData = {
	title: string;
	artist: string;
	coverArt?: string;
	listenbrainzUrl?: string;
	musicbrainzUrl?: string;
};

function optionalString(v: unknown): string | undefined {
	return typeof v === 'string' && v !== '' ? v : undefined;
}

/** Validates an untyped API response; returns undefined when nothing is playing or the shape is wrong. */
export function parseListenBrainz(raw: unknown): SkListenBrainzData | undefined {
	if (typeof raw !== 'object' || raw == null) return undefined;
	const r = raw as Record<string, unknown>;
	const title = optionalString(r.title);
	const artist = optionalString(r.artist);
	if (title == null || artist == null) return undefined;
	return {
		title,
		artist,
		coverArt: optionalString(r.coverArt),
		listenbrainzUrl: optionalString(r.listenbrainzUrl),
		musicbrainzUrl: optionalString(r.musicbrainzUrl),
	};
}

/** Whether a user profile advertises ListenBrainz (Sharkey-only boolean field; false on stock Misskey). */
export function hasListenBrainz(user: object): boolean {
	return (user as { listenbrainz?: unknown }).listenbrainz === true;
}
