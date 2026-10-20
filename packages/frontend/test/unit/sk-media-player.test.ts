/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, test, expect, vi } from 'vitest';
import {
	DEFAULT_VOLUME, PLAYBACK_SPEEDS, bufferedRatio, clampVolume, elapsedRatio,
	formatMediaTime, ratioToSeconds, seekTarget, stepVolume, toggleMuteVolume,
} from '@/utility/sk-media-player.js';

// filters/hms pulls in i18n (and thus window); only the default colon format is used here.
vi.mock('@/i18n.js', () => ({ i18n: { ts: { _time: { hour: 'h', minute: 'm', second: 's' } } } }));

describe('volume', () => {
	test('default is 0.25', () => expect(DEFAULT_VOLUME).toBe(0.25));
	test('clamp', () => {
		expect(clampVolume(-1)).toBe(0);
		expect(clampVolume(2)).toBe(1);
		expect(clampVolume(NaN)).toBe(0);
		expect(clampVolume(0.5)).toBe(0.5);
	});
	test('step clamps and avoids float drift', () => {
		expect(stepVolume(0.25, 1)).toBe(0.35);
		expect(stepVolume(0.2, 1)).toBe(0.3);
		expect(stepVolume(0.95, 1)).toBe(1);
		expect(stepVolume(0.05, -1)).toBe(0);
	});
	test('toggle mute', () => {
		expect(toggleMuteVolume(0)).toBe(0.25);
		expect(toggleMuteVolume(0.7)).toBe(0);
	});
});

describe('seek', () => {
	test('left clamps at 0', () => {
		expect(seekTarget(3, 100, -1)).toBe(0);
		expect(seekTarget(20, 100, -1)).toBe(15);
	});
	test('right clamps at duration', () => {
		expect(seekTarget(98, 100, 1)).toBe(100);
		expect(seekTarget(10, 100, 1)).toBe(15);
	});
	test('unknown duration', () => {
		expect(seekTarget(10, NaN, 1)).toBe(15);
		expect(seekTarget(10, Infinity, 1)).toBe(15);
	});
	test('ratios', () => {
		expect(ratioToSeconds(0.5, 20000)).toBe(10);
		expect(elapsedRatio(5000, 20000)).toBe(0.25);
		expect(elapsedRatio(5000, 0)).toBe(0);
		expect(elapsedRatio(0, NaN)).toBe(0);
		expect(bufferedRatio(5, 10)).toBe(0.5);
		expect(bufferedRatio(5, NaN)).toBe(0);
		expect(bufferedRatio(0, 0)).toBe(0);
	});
});

describe('speeds and time', () => {
	test('speed list', () => {
		expect(PLAYBACK_SPEEDS.map(s => s.value)).toEqual([0.25, 0.5, 0.75, 1, 1.25, 1.5, 2]);
		expect(PLAYBACK_SPEEDS.map(s => s.label)).toEqual(['0.25x', '0.5x', '0.75x', '1.0x', '1.25x', '1.5x', '2.0x']);
	});
	test('format', () => {
		expect(formatMediaTime(65000)).toBe('01:05');
		expect(formatMediaTime(3665000)).toBe('01:01:05');
		expect(formatMediaTime(NaN)).toBe('00:00');
	});
});
