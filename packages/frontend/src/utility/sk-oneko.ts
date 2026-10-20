/*
 * SPDX-FileCopyrightText: kopper and other Sharkey contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

// oneko.js: https://github.com/adryd325/oneko.js
// Pure helpers for SkOneko.vue.

export type SpriteName =
	| 'idle' | 'alert' | 'scratchSelf' | 'scratchWallN' | 'scratchWallS' | 'scratchWallE' | 'scratchWallW'
	| 'tired' | 'sleeping' | 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';

export type SpriteFrame = readonly [number, number];

export const nekoSpeed = 10;

export const spriteSets: Record<SpriteName, readonly SpriteFrame[]> = {
	idle: [[-3, -3]],
	alert: [[-7, -3]],
	scratchSelf: [[-5, 0], [-6, 0], [-7, 0]],
	scratchWallN: [[0, 0], [0, -1]],
	scratchWallS: [[-7, -1], [-6, -2]],
	scratchWallE: [[-2, -2], [-2, -3]],
	scratchWallW: [[-4, 0], [-4, -1]],
	tired: [[-3, -2]],
	sleeping: [[-2, 0], [-2, -1]],
	N: [[-1, -2], [-1, -3]],
	NE: [[0, -2], [0, -3]],
	E: [[-3, 0], [-3, -1]],
	SE: [[-5, -1], [-5, -2]],
	S: [[-6, -3], [-7, -2]],
	SW: [[-5, -3], [-6, -1]],
	W: [[-4, -2], [-4, -3]],
	NW: [[-1, 0], [-1, -1]],
};

/** CSS background-position for a sprite frame (32px cells). */
export function spriteBackgroundPosition(name: SpriteName, frame: number): string {
	const set = spriteSets[name];
	const sprite = set[frame % set.length];
	return `${sprite[0] * 32}px ${sprite[1] * 32}px`;
}

/**
 * Compass direction the cat should face, given its offset from the pointer
 * (cat minus pointer) and the distance. Mirrors the donor's axis convention.
 */
export function directionFor(diffX: number, diffY: number, distance: number): SpriteName {
	let direction = diffY / distance > 0.5 ? 'N' : '';
	direction += diffY / distance < -0.5 ? 'S' : '';
	direction += diffX / distance > 0.5 ? 'W' : '';
	direction += diffX / distance < -0.5 ? 'E' : '';
	return direction as SpriteName;
}

export type IdleAnimation = 'sleeping' | 'scratchSelf' | 'scratchWallN' | 'scratchWallS' | 'scratchWallE' | 'scratchWallW';

/** Idle animations available at the given position inside a viewport. */
export function availableIdleAnimations(x: number, y: number, width: number, height: number): IdleAnimation[] {
	const list: IdleAnimation[] = ['sleeping', 'scratchSelf'];
	if (x < 32) list.push('scratchWallW');
	if (y < 32) list.push('scratchWallN');
	if (x > width - 32) list.push('scratchWallE');
	if (y > height - 32) list.push('scratchWallS');
	return list;
}

/** Keeps the cat's centre fully inside the viewport. */
export function clampPosition(x: number, y: number, width: number, height: number): { x: number; y: number } {
	return {
		x: Math.min(Math.max(16, x), width - 16),
		y: Math.min(Math.max(16, y), height - 16),
	};
}
