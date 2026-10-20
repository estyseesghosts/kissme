/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, test, expect, vi } from 'vitest';
import { transformPlayerUrl } from '@/utility/player-url-transform.js';

vi.mock('@@/js/config.js', () => ({ hostname: 'example.test' }));

describe('transformPlayerUrl', () => {
	test('adds autoplay params', () => {
		const u = new URL(transformPlayerUrl('https://player.example/embed?x=1'));
		expect(u.searchParams.get('x')).toBe('1');
		expect(u.searchParams.get('autoplay')).toBe('1');
		expect(u.searchParams.get('auto_play')).toBe('1');
	});

	test('twitch gets parent and fullscreen', () => {
		const u = new URL(transformPlayerUrl('https://player.twitch.tv/?video=1'));
		expect(u.searchParams.get('parent')).toBe('example.test');
		expect(u.searchParams.get('autoplay')).toBe('true');
		expect(u.searchParams.has('allowfullscreen')).toBe(true);
	});

	test('rejects non-http protocols', () => {
		expect(() => transformPlayerUrl('javascript:alert(1)')).toThrow();
		expect(() => transformPlayerUrl('ftp://x.test/')).toThrow('Invalid protocol');
	});
});
