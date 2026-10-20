/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, test, expect, vi } from 'vitest';
import { collectPageVars } from '@/utility/collect-page-vars.js';
import { handleKeyEvent } from '@/utility/key-event.js';
import { searchEngineMap } from '@/utility/search-engine-map.js';
import sanitizeHtml from '@/utility/sanitize-html.js';

vi.mock('@@/js/config.js', () => ({ hostname: 'example.test' }));

describe('collectPageVars', () => {
	test('collects defaults and recurses into children', () => {
		expect(collectPageVars([
			{ type: 'textInput', name: 'a', default: 'x' },
			{ type: 'numberInput', name: 'b' },
			{ type: 'switch', name: 'c', default: true },
			{ type: 'counter', name: 'd' },
			{ type: 'container', children: [{ type: 'radioButton', name: 'e' }] },
		])).toEqual([
			{ name: 'a', type: 'string', value: 'x' },
			{ name: 'b', type: 'number', value: 0 },
			{ name: 'c', type: 'boolean', value: true },
			{ name: 'd', type: 'number', value: 0 },
			{ name: 'e', type: 'string', value: '' },
		]);
	});
});

describe('handleKeyEvent', () => {
	const ev = (code: string, mods: string[] = []) => ({
		code,
		getModifierState: (m: string) => mods.includes(m),
	}) as unknown as KeyboardEvent;

	test('runs the matching handler only', () => {
		const a = vi.fn();
		const any = vi.fn();
		handleKeyEvent(ev('Enter'), [{ code: 'Enter', handler: a }, { code: 'any', handler: any }]);
		expect(a).toHaveBeenCalledOnce();
		expect(any).not.toHaveBeenCalled();
	});

	test('requires modifiers, otherwise falls back to any', () => {
		const a = vi.fn();
		const any = vi.fn();
		const handlers = [{ code: 'Enter' as const, modifiers: ['Control' as const], handler: a }, { code: 'any' as const, handler: any }];
		handleKeyEvent(ev('Enter'), handlers);
		expect(a).not.toHaveBeenCalled();
		expect(any).toHaveBeenCalledOnce();
		handleKeyEvent(ev('Enter', ['Control']), handlers);
		expect(a).toHaveBeenCalledOnce();
	});
});

describe('searchEngineMap', () => {
	test('every URL has a {query} placeholder', () => {
		for (const url of Object.keys(searchEngineMap)) expect(url).toContain('{query}');
	});
});

describe('sanitizeHtml', () => {
	test('passes null through and strips scripts', () => {
		expect(sanitizeHtml(null)).toBeNull();
		expect(sanitizeHtml('<p>hi</p><script>alert(1)</script>')).toBe('<p>hi</p>');
	});

	test('keeps extra tags and the style attribute, and extra schemes', () => {
		expect(sanitizeHtml('<center style="color:red">x</center>')).toBe('<center style="color:red">x</center>');
		expect(sanitizeHtml('<a href="matrix:r/x">m</a>')).toContain('href="matrix:r/x"');
		expect(sanitizeHtml('<a href="javascript:alert(1)">m</a>')).not.toContain('javascript');
	});
});
