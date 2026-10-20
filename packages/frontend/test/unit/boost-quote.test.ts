/*
 * SPDX-FileCopyrightText: dakkar and other misskey contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, test, expect, vi } from 'vitest';
import { computed } from 'vue';
import type * as Misskey from 'misskey-js';
import { smallerVisibility, visibilityIsAtLeast } from '@/utility/boost-quote.js';

vi.mock('@/i.js', () => ({ $i: { id: 'me' } }));
vi.mock('@/utility/misskey-api.js', () => ({
	misskeyApi: vi.fn(async () => ({})),
	misskeyApiGet: vi.fn(async () => ({})),
}));

const { computeRenoteTooltip } = await import('@/utility/boost-quote.js');
const { i18n } = await import('@/i18n.js');
const { prefer } = await import('@/preferences.js');

describe('smallerVisibility', () => {
	test('picks the most restrictive visibility', () => {
		expect(smallerVisibility('public', 'home')).toBe('home');
		expect(smallerVisibility('home', 'followers')).toBe('followers');
		expect(smallerVisibility('followers', 'specified')).toBe('specified');
		expect(smallerVisibility('public', 'public')).toBe('public');
	});

	test('is symmetric', () => {
		expect(smallerVisibility('home', 'public')).toBe(smallerVisibility('public', 'home'));
	});
});

describe('visibilityIsAtLeast', () => {
	// visibilityIsAtLeast(noteVisibility, optionVisibility): true when the boost option is at least as restrictive as the note.
	test('allows boost options at least as restrictive as the note', () => {
		expect(visibilityIsAtLeast('public', 'public')).toBe(true);
		expect(visibilityIsAtLeast('public', 'home')).toBe(true);
		expect(visibilityIsAtLeast('home', 'home')).toBe(true);
		expect(visibilityIsAtLeast('home', 'followers')).toBe(true);
	});

	test('blocks boost options wider than the note', () => {
		expect(visibilityIsAtLeast('home', 'public')).toBe(false);
		expect(visibilityIsAtLeast('followers', 'home')).toBe(false);
	});
});

type RenotableNote = Misskey.entities.Note & { isRenoted?: boolean };

function tooltipFor(note: RenotableNote): string {
	return computeRenoteTooltip(computed(() => note)).value;
}

describe('computeRenoteTooltip', () => {
	test('unrenote when the note is already renoted', () => {
		expect(tooltipFor({ isRenoted: true } as RenotableNote)).toBe(i18n.ts.unrenote);
	});
	test('renote when the visibility selector is enabled', () => {
		prefer.s.showVisibilitySelectorOnBoost = true;
		expect(tooltipFor({} as RenotableNote)).toBe(i18n.ts.renote);
	});
	test('renoteShift hint when the visibility selector is disabled', () => {
		prefer.s.showVisibilitySelectorOnBoost = false;
		try {
			expect(tooltipFor({} as RenotableNote)).toBe(i18n.ts.renoteShift);
		} finally {
			prefer.s.showVisibilitySelectorOnBoost = true;
		}
	});
});
