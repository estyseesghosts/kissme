/*
 * SPDX-FileCopyrightText: marie and other Sharkey contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, test } from 'vitest';
import { buildMfmCheatsheet } from '@/utility/sk-mfm-cheatsheet.js';

describe('sk-mfm-cheatsheet', () => {
	const sections = buildMfmCheatsheet(1_700_000_000_000);

	test('has unique ids and non-empty text', () => {
		expect(new Set(sections.map(s => s.id)).size).toBe(sections.length);
		for (const s of sections) {
			expect(s.title).not.toBe('');
			expect(s.description).not.toBe('');
			expect(s.preview).not.toBe('');
		}
	});

	test('unixtime uses the injected clock in seconds', () => {
		expect(sections.find(s => s.id === 'unixtime')?.preview).toBe('$[unixtime 1700000000]');
	});

	test('animation previews expand to speed, delay and loop variants', () => {
		expect(sections.find(s => s.id === 'jelly')?.preview).toBe('$[jelly 🍮] $[jelly.speed=3s 🍮] $[jelly.delay=3s 🍮] $[jelly.loop=3 🍮]');
	});

	test('only followMouse is flagged uncommon', () => {
		expect(sections.filter(s => s.uncommon).map(s => s.id)).toEqual(['followMouse']);
	});
});
