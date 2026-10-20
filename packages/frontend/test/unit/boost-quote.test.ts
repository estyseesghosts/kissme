/*
 * SPDX-FileCopyrightText: dakkar and other misskey contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, test, expect } from 'vitest';
import { smallerVisibility, visibilityIsAtLeast } from '@/utility/boost-quote.js';

describe('smallerVisibility', () => {
	test('picks the most restrictive visibility', () => {
		expect(smallerVisibility('public', 'home')).toBe('home');
		expect(smallerVisibility('home', 'followers')).toBe('followers');
		expect(smallerVisibility('followers', 'specified')).toBe('specified');
		expect(smallerVisibility('public', 'public')).toBe('public');
	});

	test('is symmetric', () => {
		expect(smallerVisibility('home', 'public')).toBe(smallerVisibility('public', 'home'));
	});
});

describe('visibilityIsAtLeast', () => {
	// visibilityIsAtLeast(noteVisibility, optionVisibility): true when the boost option is at least as restrictive as the note.
	test('allows boost options at least as restrictive as the note', () => {
		expect(visibilityIsAtLeast('public', 'public')).toBe(true);
		expect(visibilityIsAtLeast('public', 'home')).toBe(true);
		expect(visibilityIsAtLeast('home', 'home')).toBe(true);
		expect(visibilityIsAtLeast('home', 'followers')).toBe(true);
	});

	test('blocks boost options wider than the note', () => {
		expect(visibilityIsAtLeast('home', 'public')).toBe(false);
		expect(visibilityIsAtLeast('followers', 'home')).toBe(false);
	});
});
