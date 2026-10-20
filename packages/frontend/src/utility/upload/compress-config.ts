/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import isAnimated from 'is-file-animated';
import { isWebpSupported } from '../isWebpSupported.js';
import type { BrowserImageResizerConfigWithConvertedOutput } from '@misskey-dev/browser-image-resizer';

const compressTypeMap = {
	'image/jpeg': { quality: 0.90, mimeType: 'image/webp' },
	'image/png': { quality: 1, mimeType: 'image/webp' },
	'image/webp': { quality: 0.90, mimeType: 'image/webp' },
	'image/svg+xml': { quality: 1, mimeType: 'image/webp' },
} as const;

const compressTypeMapFallback = {
	'image/jpeg': { quality: 0.85, mimeType: 'image/jpeg' },
	'image/png': { quality: 1, mimeType: 'image/png' },
	'image/webp': { quality: 0.85, mimeType: 'image/jpeg' },
	'image/svg+xml': { quality: 1, mimeType: 'image/png' },
} as const;

type CompressEntry = { quality: number; mimeType: 'image/webp' | 'image/jpeg' | 'image/png' };

/**
 * Pure selection of the compression target for a MIME type.
 * Returns undefined for unsupported types and for animated images (compressing would flatten them).
 */
export function selectCompressionConfig(
	mimeType: string,
	webpSupported: boolean,
	animated: boolean,
): Partial<BrowserImageResizerConfigWithConvertedOutput> | undefined {
	if (animated) return undefined;
	const map: Record<string, CompressEntry | undefined> = webpSupported ? compressTypeMap : compressTypeMapFallback;
	const imgConfig = map[mimeType];
	if (!imgConfig) return undefined;

	return {
		maxWidth: 2048,
		maxHeight: 2048,
		debug: false,
		...imgConfig,
	};
}

export async function getCompressionConfig(file: File): Promise<Partial<BrowserImageResizerConfigWithConvertedOutput> | undefined> {
	const webp = isWebpSupported();
	// Cheap check first: only sniff animation for types we would compress.
	if (selectCompressionConfig(file.type, webp, false) == null) return undefined;
	return selectCompressionConfig(file.type, webp, await isAnimated(file));
}
