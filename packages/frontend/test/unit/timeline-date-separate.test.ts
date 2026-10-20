/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, test, expect } from 'vitest';
import { ref } from 'vue';
import { getDateText, isSeparatorNeeded, getSeparatorInfo, makeDateSeparatedTimelineComputedRef } from '@/utility/timeline-date-separate.js';

// Local-time constructors, so results do not depend on the runner's timezone.
const at = (y: number, m: number, d: number, h = 12) => new Date(y, m - 1, d, h).toISOString();

describe('getDateText', () => {
	test('formats month/day without padding', () => {
		expect(getDateText(new Date(2025, 0, 5))).toBe('1/5');
		expect(getDateText(new Date(2025, 11, 31))).toBe('12/31');
	});
});

describe('isSeparatorNeeded / getSeparatorInfo', () => {
	test('same day needs no separator', () => {
		expect(isSeparatorNeeded(at(2025, 3, 4, 1), at(2025, 3, 4, 23))).toBe(false);
	});
	test('different day, month or year needs one', () => {
		expect(isSeparatorNeeded(at(2025, 3, 4), at(2025, 3, 3))).toBe(true);
		expect(isSeparatorNeeded(at(2025, 3, 4), at(2025, 2, 4))).toBe(true);
		expect(isSeparatorNeeded(at(2025, 3, 4), at(2024, 3, 4))).toBe(true);
	});
	test('null on either side means no separator', () => {
		expect(isSeparatorNeeded(null, at(2025, 3, 4))).toBe(false);
		expect(getSeparatorInfo(at(2025, 3, 4), null)).toBeNull();
	});
	test('info carries both labels', () => {
		const info = getSeparatorInfo(at(2025, 3, 4), at(2025, 3, 3));
		expect(info?.prevText).toBe('3/4');
		expect(info?.nextText).toBe('3/3');
	});
});

describe('makeDateSeparatedTimelineComputedRef', () => {
	test('inserts a date entry between items on different days', () => {
		const items = ref([
			{ id: 'a', createdAt: at(2025, 3, 4) },
			{ id: 'b', createdAt: at(2025, 3, 4, 1) },
			{ id: 'c', createdAt: at(2025, 3, 3) },
		]);
		const tl = makeDateSeparatedTimelineComputedRef(items);
		expect(tl.value.map(x => x.type)).toEqual(['item', 'item', 'date', 'item']);
		const date = tl.value[2];
		expect(date.type === 'date' && date.prevText).toBe('3/4');
		expect(date.type === 'date' && date.nextText).toBe('3/3');
	});
	test('no trailing separator and empty input', () => {
		expect(makeDateSeparatedTimelineComputedRef(ref([])).value).toEqual([]);
		const one = ref([{ id: 'a', createdAt: at(2025, 3, 4) }]);
		expect(makeDateSeparatedTimelineComputedRef(one).value).toHaveLength(1);
	});
	test('recomputes when items change', () => {
		const items = ref([{ id: 'a', createdAt: at(2025, 3, 4) }]);
		const tl = makeDateSeparatedTimelineComputedRef(items);
		items.value = [...items.value, { id: 'b', createdAt: at(2025, 3, 1) }];
		expect(tl.value.map(x => x.type)).toEqual(['item', 'date', 'item']);
	});
});
