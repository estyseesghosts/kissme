/*
 * SPDX-FileCopyrightText: puniko and other Sharkey contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, test, expect } from 'vitest';
import {
	formatRowNumber, clampChannels, virtualCanvasWidth, sliceWidthFor, buildRowText,
	columnsFromScroll, channelsInViewFor, formatPlaybackTime,
	CHANNEL_WIDTH, MAX_SLICE_WIDTH, NUMBER_ROW_WIDTH,
} from '@/utility/sk-mod-player.js';

describe('sk-mod-player', () => {
	test('formatRowNumber pads hex', () => {
		expect(formatRowNumber(0)).toBe('00');
		expect(formatRowNumber(10)).toBe('0a');
		expect(formatRowNumber(255)).toBe('ff');
		expect(formatRowNumber(256)).toBe('100');
		expect(formatRowNumber(-3)).toBe('00');
	});

	test('clampChannels', () => {
		expect(clampChannels(8)).toBe(8);
		expect(clampChannels(9999)).toBe(0xFF);
		expect(clampChannels(NaN)).toBe(0);
		expect(clampChannels(-1)).toBe(0);
	});

	test('widths', () => {
		expect(virtualCanvasWidth(0)).toBe(NUMBER_ROW_WIDTH + 2);
		expect(virtualCanvasWidth(2)).toBe(NUMBER_ROW_WIDTH + CHANNEL_WIDTH * 2 + 2);
		expect(sliceWidthFor(10)).toBe(10);
		expect(sliceWidthFor(100000)).toBe(MAX_SLICE_WIDTH);
	});

	test('buildRowText', () => {
		expect(buildRowText([])).toBe('|');
		expect(buildRowText(['C-5', '...'])).toBe('|C-5|...|');
	});

	test('columnsFromScroll clamps to last window', () => {
		expect(columnsFromScroll(0, 32)).toEqual([0, 0]);
		expect(columnsFromScroll(CHANNEL_WIDTH * 30, 32)).toEqual([30, 22]);
	});

	test('channelsInViewFor', () => {
		expect(channelsInViewFor(CHANNEL_WIDTH * 3)).toBe(4);
	});

	test('formatPlaybackTime', () => {
		expect(formatPlaybackTime(0)).toBe('0:00');
		expect(formatPlaybackTime(65.9)).toBe('1:05');
		expect(formatPlaybackTime(NaN)).toBe('0:00');
	});
});
