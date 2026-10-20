/*
 * SPDX-FileCopyrightText: syuilo and other misskey contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type * as Misskey from 'misskey-js';
import { misskeyApi } from '@/utility/misskey-api.js';
import * as os from '@/os.js';
import { skStrings } from '@/utility/sk-strings.js';

/**
 * `notes/like` is a Sharkey-only endpoint, absent from misskey-js (and from
 * backends without it, e.g. Pinetree and stock Misskey). Keep the donor-shaped
 * call first. When the backend answers UNKNOWN_API_ENDPOINT the like is not
 * faked (no reaction, no favorite): the caller is told it is unsupported.
 * Other errors propagate to the caller.
 */
type UntypedApi = (endpoint: string, body: object, token?: string | null) => Promise<unknown>;

const api = misskeyApi as unknown as UntypedApi;

export type LikeOutcome = 'liked' | 'unsupported';

export async function likeNote(noteId: string, override: string | null, token?: string | null): Promise<LikeOutcome> {
	try {
		await api('notes/like', { noteId, override }, token);
		return 'liked';
	} catch (err) {
		if ((err as { code?: string } | null)?.code !== 'UNKNOWN_API_ENDPOINT') throw err;
		return 'unsupported';
	}
}

export function alertLikeUnsupported(): Promise<void> {
	return os.alert({
		type: 'info',
		text: skStrings.likeNotSupported,
	});
}

/**
 * Shared footer handler for the Sk* note components: real like where the
 * backend has it (marking local favorited state), honest dialog where it
 * does not. Never fabricates a reaction or favorite.
 */
export async function likeNoteWithFeedback(note: Pick<Misskey.entities.Note, 'id'> & { isFavorited?: boolean }, override: string | null): Promise<void> {
	const outcome = await likeNote(note.id, override);
	if (outcome === 'liked') {
		note.isFavorited = true;
	} else {
		await alertLikeUnsupported();
	}
}
