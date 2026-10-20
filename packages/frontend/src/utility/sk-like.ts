/*
 * SPDX-FileCopyrightText: syuilo and other misskey contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type * as Misskey from 'misskey-js';
import { misskeyApi } from '@/utility/misskey-api.js';
import * as os from '@/os.js';
import { noteEvents } from '@/composables/use-note-capture.js';
import { $i } from '@/i.js';
import { skStrings } from '@/utility/sk-strings.js';

/**
 * `notes/like` is a Sharkey-only endpoint, absent from misskey-js (and from
 * backends without it, e.g. stock Misskey). Keep the donor-shaped call first.
 * When the backend answers UNKNOWN_API_ENDPOINT the like is not faked (no
 * reaction, no favorite): the caller is told it is unsupported. Other errors
 * propagate to the caller.
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
 * Shared footer handler for the Sk* note components. Sharkey's notes/like is
 * a reaction create that toggles off on re-press, so after success the note
 * is re-read and the local reaction state is synced to the truth (both
 * directions); the stream echo of the same change is deduped downstream.
 * Backends without the endpoint get an honest dialog instead of a fake.
 */
// Rapid like/unlike presses on the same note must not interleave: each press
// re-reads the note, so overlapping runs can sync from stale state and emit
// out of order. Chain per-note so every press fully settles before the next.
const pendingLikes = new Map<string, Promise<void>>();

export function likeNoteWithFeedback(note: Pick<Misskey.entities.Note, 'id'> & { isFavorited?: boolean }, override: string | null, getLocalReaction: () => string | null | undefined): Promise<void> {
	const prev = pendingLikes.get(note.id) ?? Promise.resolve();
	const task = prev.catch(() => undefined).then(() => runLike(note, override, getLocalReaction));
	pendingLikes.set(note.id, task);
	const release = () => {
		if (pendingLikes.get(note.id) === task) pendingLikes.delete(note.id);
	};
	task.then(release, release);
	return task;
}

async function runLike(note: Pick<Misskey.entities.Note, 'id'> & { isFavorited?: boolean }, override: string | null, getLocalReaction: () => string | null | undefined): Promise<void> {
	const outcome = await likeNote(note.id, override);
	if (outcome !== 'liked') {
		await alertLikeUnsupported();
		return;
	}
	// Re-read: the like may have set a reaction, toggled one off, or (on a
	// pure-favorite backend) set no reaction at all. The local reaction is
	// read at execution time so a queued press sees the previous press's
	// settled state.
	try {
		const fresh = await api('notes/show', { noteId: note.id }) as { myReaction?: string | null; isFavorited?: boolean };
		note.isFavorited = fresh.isFavorited ?? true;
		if (!$i) return;
		if (fresh.myReaction) {
			noteEvents.emit(`reacted:${note.id}`, { userId: $i.id, reaction: fresh.myReaction });
		} else {
			const localMyReaction = getLocalReaction();
			if (localMyReaction) {
				noteEvents.emit(`unreacted:${note.id}`, { userId: $i.id, reaction: localMyReaction });
			}
		}
	} catch {
		// The like itself succeeded; a failed refresh must not break the flow.
		note.isFavorited = true;
	}
}
