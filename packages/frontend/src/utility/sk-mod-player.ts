/*
 * SPDX-FileCopyrightText: puniko and other Sharkey contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

// Pure layout/format helpers extracted from the donor's SkModPlayer.vue so they can be unit tested
// without touching canvas or audio APIs.

export const CHAR_WIDTH = 6;
export const CHAR_HEIGHT = 12;
export const CHANNEL_WIDTH = CHAR_WIDTH * 14;
export const MAX_ROW_NUMBERS = 0x100;
export const MAX_CHANNEL_LIMIT = 0xFF;
export const MAX_SLICE_CHANNELS = 10;
export const MAX_SLICE_WIDTH = CHANNEL_WIDTH * MAX_SLICE_CHANNELS + 1;
export const NUMBER_ROW_WIDTH = 2 * CHAR_WIDTH + 1;

/** Row index as two-digit lowercase hex, as drawn in the row-number gutter. */
export function formatRowNumber(i: number): string {
	const text = Math.max(0, Math.trunc(i)).toString(16);
	return text.length === 1 ? '0' + text : text;
}

/** Channel count is capped so a hostile module cannot allocate absurd canvases. */
export function clampChannels(nbChannels: number): number {
	if (!Number.isFinite(nbChannels) || nbChannels < 0) return 0;
	return Math.min(Math.trunc(nbChannels), MAX_CHANNEL_LIMIT);
}

/** Total virtual pattern width in px for the given channel count. */
export function virtualCanvasWidth(nbChannels: number): number {
	return NUMBER_ROW_WIDTH + CHANNEL_WIDTH * clampChannels(nbChannels) + 2;
}

/** Width of one drawn slice canvas (never wider than MAX_SLICE_WIDTH). */
export function sliceWidthFor(virtualWidth: number): number {
	return Math.min(MAX_SLICE_WIDTH, virtualWidth);
}

/** One pattern row as text: a leading pipe, then each visible channel cell followed by a pipe. */
export function buildRowText(cells: readonly string[]): string {
	return '|' + cells.map(c => c + '|').join('');
}

/** Returns [realColumn, clampedColumn] for a horizontal scroll offset. */
export function columnsFromScroll(scrollLeft: number, nbChannels: number): [number, number] {
	const real = Math.trunc(scrollLeft / CHANNEL_WIDTH);
	const max = nbChannels - MAX_SLICE_CHANNELS;
	return [real, real > max ? max : real];
}

/** Number of channel columns that fit in a view of the given pixel width (plus one for overlap). */
export function channelsInViewFor(width: number): number {
	return Math.ceil(width / CHANNEL_WIDTH) + 1;
}

/** mm:ss formatting for a playback position in seconds. Invalid input gives 0:00. */
export function formatPlaybackTime(seconds: number): string {
	if (!Number.isFinite(seconds) || seconds < 0) seconds = 0;
	const s = Math.floor(seconds);
	return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
