/*
 * SPDX-FileCopyrightText: kopper and other Sharkey contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, test } from 'vitest';
import { availableIdleAnimations, clampPosition, directionFor, spriteBackgroundPosition } from '@/utility/sk-oneko.js';

describe('sk-oneko', () => {
	test('spriteBackgroundPosition wraps frames', () => {
		expect(spriteBackgroundPosition('idle', 5)).toBe('-96px -96px');
		expect(spriteBackgroundPosition('sleeping', 3)).toBe('-64px -32px');
	});

	test('directionFor picks compass direction', () => {
		// cat is below the pointer (diffY > 0): it should head north
		expect(directionFor(0, 10, 10)).toBe('N');
		expect(directionFor(0, -10, 10)).toBe('S');
		// cat to the right of pointer: head west
		expect(directionFor(10, 0, 10)).toBe('W');
		expect(directionFor(-7, -7, 9.9)).toBe('SE');
	});

	test('availableIdleAnimations adds wall scratches near edges', () => {
		expect(availableIdleAnimations(100, 100, 800, 600)).toEqual(['sleeping', 'scratchSelf']);
		expect(availableIdleAnimations(10, 10, 800, 600)).toEqual(['sleeping', 'scratchSelf', 'scratchWallW', 'scratchWallN']);
		expect(availableIdleAnimations(790, 590, 800, 600)).toEqual(['sleeping', 'scratchSelf', 'scratchWallE', 'scratchWallS']);
	});

	test('clampPosition keeps the cat in view', () => {
		expect(clampPosition(-5, 900, 800, 600)).toEqual({ x: 16, y: 584 });
		expect(clampPosition(400, 300, 800, 600)).toEqual({ x: 400, y: 300 });
	});
});
