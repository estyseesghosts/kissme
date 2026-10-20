/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

// Pure source -> endpoint/params and source -> stream channel mapping for MkTimeline.
// Extracted from Sharkey's MkTimeline.vue so it can be unit-tested.

export type SkTimelineSrc = 'home' | 'local' | 'social' | 'bubble' | 'global' | 'mentions' | 'directs' | 'list' | 'antenna' | 'channel' | 'role';

export type SkTimelineOptions = {
	list?: string;
	antenna?: string;
	channel?: string;
	role?: string;
	withRenotes?: boolean;
	withReplies?: boolean;
	withBots?: boolean;
	onlyFiles?: boolean;
};

export type SkTimelineQuery = {
	// 'notes/bubble-timeline' is absent from misskey-js, so this is a plain string.
	endpoint: string;
	params: Record<string, unknown>;
};

export function buildTimelineQuery(src: SkTimelineSrc, o: SkTimelineOptions): SkTimelineQuery | null {
	const withFiles = o.onlyFiles ? true : undefined;
	switch (src) {
		case 'antenna':
			return { endpoint: 'antennas/notes', params: { antennaId: o.antenna } };
		case 'home':
			return { endpoint: 'notes/timeline', params: { withRenotes: o.withRenotes, withFiles, withBots: o.withBots } };
		case 'local':
			return { endpoint: 'notes/local-timeline', params: { withRenotes: o.withRenotes, withReplies: o.withReplies, withFiles, withBots: o.withBots } };
		case 'social':
			return { endpoint: 'notes/hybrid-timeline', params: { withRenotes: o.withRenotes, withReplies: o.withReplies, withFiles, withBots: o.withBots } };
		case 'bubble':
			return { endpoint: 'notes/bubble-timeline', params: { withRenotes: o.withRenotes, withFiles, withBots: o.withBots } };
		case 'global':
			return { endpoint: 'notes/global-timeline', params: { withRenotes: o.withRenotes, withFiles, withBots: o.withBots } };
		case 'mentions':
			// Deviation: the donor sets query = null here, so its `endpoint && query` check never builds
			// a pagination for mentions. An empty params object loads them.
			return { endpoint: 'notes/mentions', params: {} };
		case 'directs':
			return { endpoint: 'notes/mentions', params: { visibility: 'specified' } };
		case 'list':
			return { endpoint: 'notes/user-list-timeline', params: { withRenotes: o.withRenotes, withFiles, listId: o.list } };
		case 'channel':
			return { endpoint: 'channels/timeline', params: { withRenotes: o.withRenotes, withFiles, channelId: o.channel } };
		case 'role':
			return { endpoint: 'roles/notes', params: { roleId: o.role } };
		default:
			return null;
	}
}

export type SkTimelineChannel = {
	channel: string;
	params?: Record<string, unknown>;
	// 'main' is also opened for home; mentions/directs listen to the main channel's 'mention' event instead of 'note'.
	extraMain?: boolean;
	mentionEvent?: 'mention' | 'directs';
};

export function buildTimelineChannel(src: SkTimelineSrc, o: SkTimelineOptions): SkTimelineChannel | null {
	const withFiles = o.onlyFiles ? true : undefined;
	switch (src) {
		case 'antenna':
			return o.antenna == null ? null : { channel: 'antenna', params: { antennaId: o.antenna } };
		case 'home':
			return { channel: 'homeTimeline', params: { withRenotes: o.withRenotes, withFiles }, extraMain: true };
		case 'local':
			return { channel: 'localTimeline', params: { withRenotes: o.withRenotes, withReplies: o.withReplies, withFiles, withBots: o.withBots } };
		case 'social':
			return { channel: 'hybridTimeline', params: { withRenotes: o.withRenotes, withReplies: o.withReplies, withFiles, withBots: o.withBots } };
		case 'bubble':
			return { channel: 'bubbleTimeline', params: { withRenotes: o.withRenotes, withFiles, withBots: o.withBots } };
		case 'global':
			return { channel: 'globalTimeline', params: { withRenotes: o.withRenotes, withFiles, withBots: o.withBots } };
		case 'mentions':
			return { channel: 'main', mentionEvent: 'mention' };
		case 'directs':
			return { channel: 'main', mentionEvent: 'directs' };
		case 'list':
			return o.list == null ? null : { channel: 'userList', params: { withRenotes: o.withRenotes, withFiles, listId: o.list } };
		case 'channel':
			return o.channel == null ? null : { channel: 'channel', params: { withRenotes: o.withRenotes, withFiles, channelId: o.channel } };
		case 'role':
			return o.role == null ? null : { channel: 'roleTimeline', params: { roleId: o.role } };
		default:
			return null;
	}
}
