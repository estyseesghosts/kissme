/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

// Pure logic for the Sharkey video/audio players (SkMediaVideo / SkMediaAudio),
// extracted from the donor's MkMediaVideo / MkMediaAudio keymap and controls.

import { hms } from '@/filters/hms.js';

export const DEFAULT_VOLUME = 0.25;
export const VOLUME_STEP = 0.1;
export const SEEK_STEP_SECONDS = 5;

/** Playback rates in the shape expected by upstream's `radio` menu item. */
export const PLAYBACK_SPEEDS: { label: string; value: number }[] = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2].map(value => ({
	label: `${Number.isInteger(value) ? value.toFixed(1) : value}x`,
	value,
}));

export function clampVolume(v: number): number {
	if (Number.isNaN(v)) return 0;
	return Math.min(Math.max(v, 0), 1);
}

/** Step the volume up (+1) or down (-1) by VOLUME_STEP, clamped to [0, 1]. */
export function stepVolume(current: number, direction: 1 | -1): number {
	// round to avoid float drift such as 0.30000000000000004
	return clampVolume(Math.round((current + direction * VOLUME_STEP) * 100) / 100);
}

/** Mute button behaviour: muted -> default volume, otherwise -> muted. */
export function toggleMuteVolume(current: number): number {
	return current === 0 ? DEFAULT_VOLUME : 0;
}

/** New currentTime (seconds) after pressing left (-1) / right (+1). */
export function seekTarget(currentTime: number, duration: number, direction: 1 | -1): number {
	const next = currentTime + direction * SEEK_STEP_SECONDS;
	if (direction < 0) return Math.max(next, 0);
	// duration may be NaN/Infinity before metadata loads (or for streams)
	return Number.isFinite(duration) ? Math.min(next, duration) : next;
}

/** Seekbar ratio (0..1) -> currentTime seconds. */
export function ratioToSeconds(ratio: number, durationMs: number): number {
	return ratio * durationMs / 1000;
}

/** Elapsed / duration as a 0..1 ratio, 0 when unknown. */
export function elapsedRatio(elapsedMs: number, durationMs: number): number {
	const r = elapsedMs / durationMs;
	return Number.isFinite(r) ? r : 0;
}

/** Buffered ratio, 0 when the duration is unknown. */
export function bufferedRatio(bufferedEndSec: number, durationSec: number): number {
	const r = bufferedEndSec / durationSec;
	return Number.isFinite(r) ? r : 0;
}

/** Format a position in ms as h:mm:ss / mm:ss (wrapper around filters/hms). */
export function formatMediaTime(ms: number): string {
	return hms(Number.isFinite(ms) ? ms : 0);
}
