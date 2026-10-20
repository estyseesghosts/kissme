/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { getMutedWords } from '@/utility/sk-check-mute.js';

export type MuteEntries = (string | string[])[];

export interface ParsedMutes {
	mutes: MuteEntries;
	/** 1-based line numbers of regex mutes that do not compile. */
	invalidLines: number[];
}

/**
 * Parses word-mute textarea contents the way the mute settings page saves them: one mute per
 * line, `/regex/flags` kept as a string, anything else split on spaces into an AND pattern.
 * Pure (no dialogs), unlike the donor's parse-mutes.ts, so it can drive live testing.
 * Invalid regexes are reported in `invalidLines` and left out of `mutes`.
 */
export function parseMuteText(text: string): ParsedMutes {
	const mutes: MuteEntries = [];
	const invalidLines: number[] = [];
	const lines = text.trim().split('\n').map(l => l.trim()).filter(l => l !== '');

	lines.forEach((line, i) => {
		const regexp = line.match(/^\/(.+)\/(.*)$/);
		if (regexp) {
			try {
				new RegExp(regexp[1], regexp[2]);
				mutes.push(line);
			} catch {
				invalidLines.push(i + 1);
			}
		} else {
			mutes.push(line.split(' ').filter(w => w !== ''));
		}
	});

	return { mutes, invalidLines };
}

export interface PatternTestResult {
	matches: string[];
	invalidLines: number[];
}

/** Tests each non-empty line of `sample` against the mutes in `muteText`; returns de-duplicated matches. */
export function testMutePatterns(muteText: string, sample: string): PatternTestResult {
	const { mutes, invalidLines } = parseMuteText(muteText);
	const inputs = sample.split('\n').filter(l => l.trim() !== '');
	return { matches: getMutedWords(mutes, inputs), invalidLines };
}
