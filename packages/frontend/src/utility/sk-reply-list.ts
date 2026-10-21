/*
 * SPDX-FileCopyrightText: syuilo and other misskey contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type * as Misskey from 'misskey-js';

// Live-reply list helpers shared by SkNoteSub and SkNoteDetailed. They mirror the
// donor Sharkey addReplyTo/removeReply functions: new replies unshift onto the list
// and repliesCount follows the list. removeReplyFromList is a no-op for unknown ids,
// so a stream delete echo after a global-event delete cannot double-decrement.
export function addReplyToList(
	replies: Misskey.entities.Note[],
	holder: Pick<Misskey.entities.Note, 'repliesCount'>,
	reply: Misskey.entities.Note,
): void {
	replies.unshift(reply);
	holder.repliesCount += 1;
}

export function removeReplyFromList(
	replies: Misskey.entities.Note[],
	holder: Pick<Misskey.entities.Note, 'repliesCount'>,
	id: Misskey.entities.Note['id'],
): void {
	const replyIdx = replies.findIndex((reply) => reply.id === id);
	if (replyIdx >= 0) {
		replies.splice(replyIdx, 1);
		holder.repliesCount -= 1;
	}
}
