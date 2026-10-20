/*
 * SPDX-FileCopyrightText: amelia and other Sharkey contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, test } from 'vitest';
import { hasListenBrainz, parseListenBrainz } from '@/utility/sk-listenbrainz.js';

describe('sk-listenbrainz', () => {
	test('parse accepts a full response', () => {
		expect(parseListenBrainz({ title: 'T', artist: 'A', coverArt: 'c', listenbrainzUrl: 'l', musicbrainzUrl: 'm' }))
			.toEqual({ title: 'T', artist: 'A', coverArt: 'c', listenbrainzUrl: 'l', musicbrainzUrl: 'm' });
	});

	test('parse drops empty optional fields', () => {
		expect(parseListenBrainz({ title: 'T', artist: 'A', coverArt: '' })?.coverArt).toBeUndefined();
	});

	test('parse rejects nothing-playing or malformed responses', () => {
		expect(parseListenBrainz(null)).toBeUndefined();
		expect(parseListenBrainz({})).toBeUndefined();
		expect(parseListenBrainz({ title: 'T' })).toBeUndefined();
		expect(parseListenBrainz('x')).toBeUndefined();
	});

	test('hasListenBrainz is strict', () => {
		expect(hasListenBrainz({ listenbrainz: true })).toBe(true);
		expect(hasListenBrainz({ listenbrainz: 'yes' })).toBe(false);
		expect(hasListenBrainz({})).toBe(false);
	});
});
