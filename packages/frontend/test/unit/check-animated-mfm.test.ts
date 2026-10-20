/*
 * SPDX-FileCopyrightText: marie and other Sharkey contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as mfm from 'mfm-js';
import { describe, test, expect } from 'vitest';
import { checkAnimationFromMfm } from '@/utility/check-animated-mfm.js';

describe('checkAnimationFromMfm', () => {
	test('detects each animated MFM function', () => {
		for (const name of ['tada', 'jelly', 'twitch', 'shake', 'spin', 'jump', 'bounce', 'rainbow', 'sparkle', 'fade', 'followmouse']) {
			expect(checkAnimationFromMfm(mfm.parse(`$[${name} hi]`)), name).toBe(true);
		}
	});

	test('detects an animated function nested inside another', () => {
		expect(checkAnimationFromMfm(mfm.parse('$[x2 $[spin hi]]'))).toBe(true);
	});

	test('ignores static MFM functions', () => {
		expect(checkAnimationFromMfm(mfm.parse('$[flip hi] $[x2 hi] $[fg hi]'))).toBe(false);
	});

	test('ignores plain text and empty input', () => {
		expect(checkAnimationFromMfm(mfm.parse('hello'))).toBe(false);
		expect(checkAnimationFromMfm([])).toBe(false);
	});
});
