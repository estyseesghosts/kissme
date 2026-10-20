/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, test, expect } from 'vitest';
import { buildTimelineChannel, buildTimelineQuery } from '@/utility/sk-timeline-query.js';
import type { SkTimelineSrc } from '@/utility/sk-timeline-query.js';

const base = { withRenotes: true, withReplies: false, withBots: true, onlyFiles: false };

describe('buildTimelineQuery', () => {
	test.each([
		['home', 'notes/timeline', { withRenotes: true, withFiles: undefined, withBots: true }],
		['local', 'notes/local-timeline', { withRenotes: true, withReplies: false, withFiles: undefined, withBots: true }],
		['social', 'notes/hybrid-timeline', { withRenotes: true, withReplies: false, withFiles: undefined, withBots: true }],
		['bubble', 'notes/bubble-timeline', { withRenotes: true, withFiles: undefined, withBots: true }],
		['global', 'notes/global-timeline', { withRenotes: true, withFiles: undefined, withBots: true }],
		['mentions', 'notes/mentions', {}],
		['directs', 'notes/mentions', { visibility: 'specified' }],
		['list', 'notes/user-list-timeline', { withRenotes: true, withFiles: undefined, listId: 'L' }],
		['antenna', 'antennas/notes', { antennaId: 'A' }],
		['channel', 'channels/timeline', { withRenotes: true, withFiles: undefined, channelId: 'C' }],
		['role', 'roles/notes', { roleId: 'R' }],
	] as [SkTimelineSrc, string, object][])('%s', (src, endpoint, params) => {
		expect(buildTimelineQuery(src, { ...base, list: 'L', antenna: 'A', channel: 'C', role: 'R' })).toEqual({ endpoint, params });
	});

	test('onlyFiles sets withFiles', () => {
		expect(buildTimelineQuery('home', { ...base, onlyFiles: true })?.params.withFiles).toBe(true);
	});
	test('unknown src builds nothing', () => {
		expect(buildTimelineQuery('nope' as SkTimelineSrc, base)).toBeNull();
	});
});

describe('buildTimelineChannel', () => {
	test.each([
		['home', 'homeTimeline'],
		['local', 'localTimeline'],
		['social', 'hybridTimeline'],
		['bubble', 'bubbleTimeline'],
		['global', 'globalTimeline'],
		['mentions', 'main'],
		['directs', 'main'],
		['list', 'userList'],
		['antenna', 'antenna'],
		['channel', 'channel'],
		['role', 'roleTimeline'],
	] as [SkTimelineSrc, string][])('%s', (src, channel) => {
		expect(buildTimelineChannel(src, { ...base, list: 'L', antenna: 'A', channel: 'C', role: 'R' })?.channel).toBe(channel);
	});

	test('home also opens the main channel; directs filters mention events', () => {
		expect(buildTimelineChannel('home', base)?.extraMain).toBe(true);
		expect(buildTimelineChannel('directs', base)?.mentionEvent).toBe('directs');
		expect(buildTimelineChannel('mentions', base)?.mentionEvent).toBe('mention');
	});
	test('id-based sources need their id', () => {
		for (const src of ['list', 'antenna', 'channel', 'role'] as SkTimelineSrc[]) {
			expect(buildTimelineChannel(src, base)).toBeNull();
		}
	});
});
