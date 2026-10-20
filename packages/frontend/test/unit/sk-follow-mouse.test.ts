/*
 * SPDX-FileCopyrightText: leah and other Cutiekey contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, test } from 'vitest';
import { computeFollowMouse, lerp } from '@/utility/sk-follow-mouse.js';

describe('sk-follow-mouse', () => {
	test('lerp interpolates', () => {
		expect(lerp(0, 10, 0)).toBe(0);
		expect(lerp(0, 10, 1)).toBe(10);
		expect(lerp(0, 10, 0.1)).toBeCloseTo(1);
	});

	test('translate only follows enabled axes', () => {
		const state = { lastX: 0, lastY: 0, angle: 0 };
		const r = computeFollowMouse({ x: 5, y: 7, followX: true, followY: false, rotateByVelocity: false }, state);
		expect(r.transform).toBe('translate(calc(5px - 50%), calc(0px - 50%))');
		expect(r.state).toEqual({ lastX: 5, lastY: 7, angle: 0 });
	});

	test('rotation eases toward the movement angle and is carried in state', () => {
		const state = { lastX: 0, lastY: 0, angle: 0 };
		const r = computeFollowMouse({ x: 0, y: 10, followX: true, followY: true, rotateByVelocity: true }, state);
		// moving straight down is 90deg, eased by 0.1
		expect(r.state.angle).toBeCloseTo(9);
		expect(r.transform.endsWith('rotate(9deg)')).toBe(true);
	});
});
