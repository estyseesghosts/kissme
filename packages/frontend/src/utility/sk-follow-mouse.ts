/*
 * SPDX-FileCopyrightText: leah and other Cutiekey contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * Pure math behind CkFollowMouse.vue (the `$[followmouse]` MFM function).
 */

export function lerp(a: number, b: number, alpha: number): number {
	return a + alpha * (b - a);
}

export type FollowMouseState = {
	lastX: number;
	lastY: number;
	angle: number;
};

export type FollowMouseInput = {
	/** Pointer position relative to the container's top-left corner. */
	x: number;
	y: number;
	followX: boolean;
	followY: boolean;
	rotateByVelocity: boolean;
};

/**
 * Computes the CSS transform for the next pointer position.
 * Returns the transform string and the state to carry into the next call.
 */
export function computeFollowMouse(input: FollowMouseInput, state: FollowMouseState): { transform: string; state: FollowMouseState } {
	let transform = `translate(calc(${input.followX ? input.x : 0}px - 50%), calc(${input.followY ? input.y : 0}px - 50%))`;
	let angle = state.angle;
	if (input.rotateByVelocity) {
		const deltaX = input.x - state.lastX;
		const deltaY = input.y - state.lastY;
		angle = lerp(state.angle, Math.atan2(deltaY, deltaX) * (180 / Math.PI), 0.1);
		transform += ` rotate(${angle}deg)`;
	}
	return { transform, state: { lastX: input.x, lastY: input.y, angle } };
}
