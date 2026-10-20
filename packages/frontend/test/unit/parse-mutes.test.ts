/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, test, expect, vi } from 'vitest';
import { parseMutes } from '@/utility/parse-mutes.js';

const alert = vi.hoisted(() => vi.fn());
vi.mock('@/utility/sk-check-mute.js', () => ({ getMutedWords: () => [] }));
vi.mock('@/os.js', () => ({ alert }));
vi.mock('@/i18n.js', () => ({
	i18n: { ts: { regexpError: 'err' }, tsx: { regexpErrorDescription: (p: { tab: string; line: number }) => `${p.tab}:${p.line}` } },
}));

describe('parseMutes', () => {
	test('parses valid input without a dialog', () => {
		expect(parseMutes('a b\n/x/i')).toEqual([['a', 'b'], '/x/i']);
		expect(alert).not.toHaveBeenCalled();
	});

	test('alerts and throws on an invalid regex', () => {
		expect(() => parseMutes('ok\n/(/')).toThrow();
		expect(alert).toHaveBeenCalledOnce();
		expect(alert.mock.calls[0][0].text).toContain('word mute:2');
	});
});
