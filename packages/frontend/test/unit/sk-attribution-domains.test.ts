/*
 * SPDX-FileCopyrightText: syuilo and other misskey contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, test, expect } from 'vitest';
import { parseAttributionDomains, isValidAttributionDomainList } from '@/utility/sk-attribution-domains.js';

describe('attribution domains', () => {
	test('trims, lower-cases and drops blank lines', () => {
		expect(parseAttributionDomains('  Example.COM \n\nfoo.bar\n')).toEqual(['example.com', 'foo.bar']);
		expect(parseAttributionDomains('')).toEqual([]);
	});

	test('rejects entries containing whitespace', () => {
		expect(isValidAttributionDomainList(['example.com'])).toBe(true);
		expect(isValidAttributionDomainList(['a b.com'])).toBe(false);
		expect(isValidAttributionDomainList([])).toBe(true);
	});
});
