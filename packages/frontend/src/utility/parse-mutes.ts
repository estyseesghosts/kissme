/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as os from '@/os.js';
import { i18n } from '@/i18n.js';
import { parseMuteText } from '@/utility/sk-parse-mutes.js';
import type { MuteEntries } from '@/utility/sk-parse-mutes.js';

export type Mutes = MuteEntries;

/**
 * Dialog-using variant of the donor's parseMutes: parses with the pure `parseMuteText`, and if a
 * regex line is invalid, shows an error dialog and throws so the caller does not save.
 */
export function parseMutes(mutes: string): Mutes {
	const parsed = parseMuteText(mutes);
	if (parsed.invalidLines.length > 0) {
		const lines = mutes.trim().split('\n').map(line => line.trim()).filter(line => line !== '');
		const line = parsed.invalidLines[0];
		const match = lines[line - 1].match(/^\/(.+)\/(.*)$/);
		let error = new Error('Invalid regular expression');
		try {
			new RegExp(match?.[1] ?? '', match?.[2] ?? '');
		} catch (err) {
			if (err instanceof Error) error = err;
		}
		os.alert({
			type: 'error',
			title: i18n.ts.regexpError,
			text: i18n.tsx.regexpErrorDescription({ tab: 'word mute', line }) + '\n' + error.toString(),
		});
		throw error;
	}
	return parsed.mutes;
}
