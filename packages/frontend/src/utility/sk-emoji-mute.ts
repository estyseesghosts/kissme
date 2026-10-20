/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { prefer } from '@/preferences.js';
import { toggleMutedEmoji } from '@/utility/sk-reaction-rules.js';

/** Handler for SkReactionsViewer's toggleEmojiMute event: persists to the mutedEmojis pref. */
export function onToggleEmojiMute(reaction: string): void {
	prefer.commit('mutedEmojis', toggleMutedEmoji(prefer.s.mutedEmojis, reaction));
}
