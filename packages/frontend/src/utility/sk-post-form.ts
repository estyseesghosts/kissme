/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as mfm from 'mfm-js';
import { toASCII } from 'punycode.js';
import { extractMentions } from '@/utility/extract-mentions.js';

// Pure helpers for the Sharkey options of MkPostForm (mention handling, reaction-acceptance header).

type Mentionable = { id?: string; username: string; host: string | null };

/** Mentions in `text` that no user in `visibleUsers` matches (case-insensitive username, punycode-normalised host). */
export function getMissingMentions(text: string, visibleUsers: { username: string; host: string | null }[]): mfm.MfmMention['props'][] {
	const mentions = extractMentions(mfm.parse(text));

	return mentions.filter(mu => {
		const mUsername = mu.username.toLowerCase();
		const mHost = mu.host;

		// Only a mention that matches no visible user is "missing".
		return !visibleUsers.some(vu => {
			const vUsername = vu.username.toLowerCase();
			const vHost = vu.host ? toASCII(vu.host).toLowerCase() : null;
			return mUsername === vUsername && mHost === vHost;
		});
	});
}

/**
 * Returns `text` with `@acct ` added at the start or end, unless it is already mentioned.
 * Mirrors the non-cursor branches of Sharkey's `pushMention`; the cursor branch needs the textarea
 * and stays in the component. `acct` is `username` or `username@host`, without the leading `@`.
 */
export function addMentionToText(text: string, acct: string, at: 'start' | 'end'): string {
	const mention = `@${acct}`;
	const mentionLower = mention.toLowerCase();
	const textLower = text.toLowerCase();

	if (textLower.includes(mentionLower + ' ') || textLower.endsWith(mentionLower)) return text;

	if (at === 'start') {
		return /^\s/.test(text) ? `${mention}${text}` : `${mention} ${text}`;
	}
	return /\s$/.test(text) ? `${text}${mention} ` : `${text} ${mention} `;
}

/** True when `user` is the signed-in user, which Sharkey never mentions in its own post. */
export function isSelfMention(user: Mentionable, me: { id: string; username: string }): boolean {
	if (user.id === me.id) return true;
	return user.host === null && user.username.toLowerCase() === me.username.toLowerCase();
}

export type ReactionAcceptance = 'likeOnly' | 'likeOnlyForRemote' | 'nonSensitiveOnly' | 'nonSensitiveOnlyForLocalLikeOnlyForRemote' | null;

/** Tabler icon for the header reaction-acceptance button (Sharkey's Phosphor smiley -> ti-mood-smile). */
export function reactionAcceptanceHeaderIcon(value: ReactionAcceptance): string {
	if (value === 'likeOnly') return 'ti ti-heart';
	if (value === 'likeOnlyForRemote') return 'ti ti-heart-plus';
	return 'ti ti-mood-smile';
}
