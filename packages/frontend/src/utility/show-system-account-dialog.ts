/*
 * SPDX-FileCopyrightText: hazelnoot and other Sharkey contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as os from '@/os.js';
import { skStrings } from '@/utility/sk-strings.js';

export function showSystemAccountDialog(): Promise<void> {
	return os.alert({
		type: 'error',
		title: skStrings.systemAccountTitle,
		text: skStrings.systemAccountDescription,
	});
}
