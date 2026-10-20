/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, test } from 'vitest';
import { classifySkMedia, isFlashContent, isSkBrowserSafe, isSkPreviewable, isTrackerModule } from '@/utility/sk-media-types.js';
import { isPreviewable } from '@/utility/lightbox.js';

describe('sk-media-types', () => {
	test('tracker by mime or extension', () => {
		expect(isTrackerModule({ type: 'audio/xm', name: 'a.bin' })).toBe(true);
		expect(isTrackerModule({ type: 'application/octet-stream', name: 'Song.MOD' })).toBe(true);
		expect(isTrackerModule({ type: 'application/octet-stream', name: 'song.it.unknown' })).toBe(true);
		expect(isTrackerModule({ type: 'audio/mpeg', name: 'song.mp3' })).toBe(false);
		expect(isTrackerModule({ type: 'audio/mpeg', name: 'mod' })).toBe(false);
	});

	test('flash by mime or extension', () => {
		expect(isFlashContent({ type: 'application/x-shockwave-flash', name: 'a' })).toBe(true);
		expect(isFlashContent({ type: 'application/octet-stream', name: 'game.SWF' })).toBe(true);
		expect(isFlashContent({ type: 'application/pdf', name: 'a.pdf' })).toBe(false);
	});

	test('browser safe adds jxl and mkv only for sharkey', () => {
		expect(isSkBrowserSafe('image/jxl')).toBe(true);
		expect(isSkBrowserSafe('video/x-matroska')).toBe(true);
		expect(isSkBrowserSafe('image/png; charset=x')).toBe(true);
		expect(isSkBrowserSafe('image/svg+xml')).toBe(true);
		expect(isSkBrowserSafe('application/pdf')).toBe(false);
		// the stock lightbox classification must not change
		expect(isPreviewable('image/jxl')).toBe(false);
		expect(isPreviewable('video/x-matroska')).toBe(false);
	});

	test('classify', () => {
		expect(classifySkMedia({ type: 'image/jpeg', name: 'a.jpg' })).toBe('image');
		expect(classifySkMedia({ type: 'video/mp4', name: 'a.mp4' })).toBe('video');
		expect(classifySkMedia({ type: 'audio/mpeg', name: 'a.mp3' })).toBe('audio');
		expect(classifySkMedia({ type: 'audio/mpeg', name: 'a.xm' })).toBe('tracker');
		expect(classifySkMedia({ type: 'application/octet-stream', name: 'a.swf' })).toBe('flash');
		expect(classifySkMedia({ type: 'application/zip', name: 'a.zip' })).toBe('other');
		expect(classifySkMedia({ type: 'image/x-weird', name: 'a.weird' })).toBe('other');
	});

	test('previewable grid vs banner', () => {
		expect(isSkPreviewable({ type: 'image/png', name: 'a.png' })).toBe(true);
		expect(isSkPreviewable({ type: 'audio/mpeg', name: 'a.mp3' })).toBe(false);
		expect(isSkPreviewable({ type: 'audio/xm', name: 'a.xm' })).toBe(true);
		expect(isSkPreviewable({ type: 'application/x-shockwave-flash', name: 'a.swf' })).toBe(true);
		expect(isSkPreviewable({ type: 'application/zip', name: 'a.zip' })).toBe(false);
	});
});
