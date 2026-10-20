/*
 * SPDX-FileCopyrightText: syuilo and other misskey contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, test } from 'vitest';
import { buildUnsubscribeEndpoint, resolveEntranceStyle, shuffled, sponsorsToPeople } from '@/utility/sk-static-pages.js';

describe('resolveEntranceStyle', () => {
	test('server pref keeps stock behavior', () => {
		expect(resolveEntranceStyle(undefined, 'server')).toBe('classic');
		expect(resolveEntranceStyle(null, 'server')).toBe('classic');
		expect(resolveEntranceStyle('classic', 'server')).toBe('classic');
		expect(resolveEntranceStyle('simple', 'server')).toBe('simple');
	});
	test('pref a overrides the server style', () => {
		expect(resolveEntranceStyle('simple', 'a')).toBe('a');
		expect(resolveEntranceStyle(undefined, 'a')).toBe('a');
	});
});

describe('buildUnsubscribeEndpoint', () => {
	test('plain values', () => {
		expect(buildUnsubscribeEndpoint('abc', 'tok')).toBe('unsubscribe/abc/tok');
	});
	test('encodes separators', () => {
		expect(buildUnsubscribeEndpoint('a/b', '../x?y')).toBe('unsubscribe/a%2Fb/..%2Fx%3Fy');
	});
});

describe('shuffled', () => {
	test('is a permutation and does not mutate input', () => {
		const input = [1, 2, 3, 4, 5];
		const out = shuffled(input);
		expect(input).toEqual([1, 2, 3, 4, 5]);
		expect([...out].sort()).toEqual(input);
	});
	test('deterministic with injected rng', () => {
		expect(shuffled([1, 2, 3], () => 0)).toEqual([2, 3, 1]);
	});
});

describe('sponsorsToPeople', () => {
	test('uses image/website, falls back to avatar service and profile', () => {
		const [a, b] = sponsorsToPeople([
			{ name: 'A', image: 'https://i/a.png', website: 'https://w/a', profile: 'https://p/a' },
			{ name: 'B C', image: null, website: null, profile: 'https://p/b' },
		]);
		expect(a).toEqual({ handle: 'A', avatar: 'https://i/a.png', link: 'https://w/a' });
		expect(b.avatar).toContain('name=B%20C');
		expect(b.link).toBe('https://p/b');
	});
});
