/*
 * SPDX-FileCopyrightText: syuilo and other misskey contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, test, expect } from 'vitest';
import { defaultScheduleParts, joinScheduledAt, splitScheduledAt } from '@/utility/sk-schedule.js';

describe('defaultScheduleParts', () => {
	test('is tomorrow at midnight, local', () => {
		expect(defaultScheduleParts(new Date(2025, 2, 4, 15, 30))).toEqual({ date: '2025-03-05', time: '00:00' });
	});
	test('rolls over month and year ends', () => {
		expect(defaultScheduleParts(new Date(2025, 11, 31, 23, 59)).date).toBe('2026-01-01');
		expect(defaultScheduleParts(new Date(2024, 1, 28)).date).toBe('2024-02-29');
	});
});

describe('joinScheduledAt / splitScheduledAt', () => {
	test('join builds local time', () => {
		expect(joinScheduledAt('2025-03-05', '07:09')).toBe(new Date(2025, 2, 5, 7, 9).getTime());
	});
	test('split inverts join', () => {
		const ms = new Date(2025, 10, 9, 21, 5).getTime();
		expect(splitScheduledAt(ms)).toEqual({ date: '2025-11-09', time: '21:05' });
		expect(joinScheduledAt('2025-11-09', '21:05')).toBe(ms);
	});
	test('rejects empty, malformed and impossible input', () => {
		expect(joinScheduledAt('', '10:00')).toBeNull();
		expect(joinScheduledAt('2025-03-05', '')).toBeNull();
		expect(joinScheduledAt('2025-02-31', '10:00')).toBeNull();
		expect(joinScheduledAt('2025-03-05', '24:00')).toBeNull();
		expect(joinScheduledAt('2025-03-05', '10:60')).toBeNull();
		expect(joinScheduledAt('3/5/2025', '10:00')).toBeNull();
	});
});
