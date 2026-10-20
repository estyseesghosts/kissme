/*
 * SPDX-FileCopyrightText: hazelnoot and other Sharkey contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, test, expect } from 'vitest';
import { selectCompressionConfig } from '@/utility/upload/compress-config.js';

describe('selectCompressionConfig', () => {
	test('webp supported: jpeg/png/webp/svg convert to webp', () => {
		for (const t of ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']) {
			expect(selectCompressionConfig(t, true, false)?.mimeType).toBe('image/webp');
		}
	});
	test('webp supported: quality per type', () => {
		expect(selectCompressionConfig('image/jpeg', true, false)?.quality).toBe(0.90);
		expect(selectCompressionConfig('image/png', true, false)?.quality).toBe(1);
	});
	test('fallback map without webp', () => {
		expect(selectCompressionConfig('image/jpeg', false, false)).toMatchObject({ mimeType: 'image/jpeg', quality: 0.85 });
		expect(selectCompressionConfig('image/png', false, false)).toMatchObject({ mimeType: 'image/png', quality: 1 });
		expect(selectCompressionConfig('image/webp', false, false)).toMatchObject({ mimeType: 'image/jpeg', quality: 0.85 });
		expect(selectCompressionConfig('image/svg+xml', false, false)).toMatchObject({ mimeType: 'image/png' });
	});
	test('animated images are never compressed', () => {
		expect(selectCompressionConfig('image/png', true, true)).toBeUndefined();
		expect(selectCompressionConfig('image/webp', false, true)).toBeUndefined();
	});
	test('unsupported types return undefined', () => {
		expect(selectCompressionConfig('image/gif', true, false)).toBeUndefined();
		expect(selectCompressionConfig('video/mp4', false, false)).toBeUndefined();
		expect(selectCompressionConfig('', true, false)).toBeUndefined();
	});
	test('resize bounds are 2048', () => {
		const c = selectCompressionConfig('image/png', true, false);
		expect(c?.maxWidth).toBe(2048);
		expect(c?.maxHeight).toBe(2048);
	});
});
