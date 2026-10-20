/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

process.env.NODE_ENV = 'test';

import * as assert from 'assert';
import { beforeAll, describe, test } from 'vitest';
import { api, connectStream, post, signup } from '../utils.js';
import type * as misskey from 'misskey-js';

describe('Note thread mute', () => {
	let alice: misskey.entities.SignupResponse;
	let bob: misskey.entities.SignupResponse;
	let carol: misskey.entities.SignupResponse;

	beforeAll(async () => {
		alice = await signup({ username: 'alice' });
		bob = await signup({ username: 'bob' });
		carol = await signup({ username: 'carol' });
	}, 1000 * 60 * 2);

	test('notes/mentions にミュートしているスレッドの投稿が含まれない', async () => {
		const bobNote = await post(bob, { text: '@alice @carol root note' });
		const aliceReply = await post(alice, { replyId: bobNote.id, text: '@bob @carol child note' });

		await api('notes/thread-muting/create', { noteId: bobNote.id }, alice);

		const carolReply = await post(carol, { replyId: bobNote.id, text: '@bob @alice child note' });
		const carolReplyWithoutMention = await post(carol, { replyId: aliceReply.id, text: 'child note' });

		const res = await api('notes/mentions', {}, alice);

		assert.strictEqual(res.status, 200);
		assert.strictEqual(Array.isArray(res.body), true);
		assert.strictEqual(res.body.some(note => note.id === bobNote.id), false);
		assert.strictEqual(res.body.some(note => note.id === carolReply.id), false);
		assert.strictEqual(res.body.some(note => note.id === carolReplyWithoutMention.id), false);
	});

	test('i/notifications にミュートしているスレッドの通知が含まれない', async () => {
		const bobNote = await post(bob, { text: '@alice @carol root note' });
		const aliceReply = await post(alice, { replyId: bobNote.id, text: '@bob @carol child note' });

		await api('notes/thread-muting/create', { noteId: bobNote.id }, alice);

		const carolReply = await post(carol, { replyId: bobNote.id, text: '@bob @alice child note' });
		const carolReplyWithoutMention = await post(carol, { replyId: aliceReply.id, text: 'child note' });

		const res = await api('i/notifications', {}, alice);

		assert.strictEqual(res.status, 200);
		assert.strictEqual(Array.isArray(res.body), true);
		assert.strictEqual(res.body.some(notification => 'note' in notification && notification.note.id === carolReply.id), false);
		assert.strictEqual(res.body.some(notification => 'note' in notification && notification.note.id === carolReplyWithoutMention.id), false);

		// NOTE: bobの投稿はスレッドミュート前に行われたため通知に含まれていてもよい
	});

	test('noteOnly=true/false の create/delete が往復できる', async () => {
		const bobNote = await post(bob, { text: 'thread mute roundtrip root' });
		const aliceReply = await post(alice, { replyId: bobNote.id, text: 'thread mute roundtrip reply' });

		// thread mute (noteOnly omitted => false)
		const createThread = await api('notes/thread-muting/create', { noteId: aliceReply.id }, alice);
		assert.strictEqual(createThread.status, 204);

		// note-only mute on the same note coexists (unique index covers isPostMute)
		const createNote = await api('notes/thread-muting/create', { noteId: aliceReply.id, noteOnly: true }, alice);
		assert.strictEqual(createNote.status, 204);

		// deleting the note-only mute leaves the thread mute behind: replies stay hidden
		const deleteNote = await api('notes/thread-muting/delete', { noteId: aliceReply.id, noteOnly: true }, alice);
		assert.strictEqual(deleteNote.status, 204);

		const carolReply = await post(carol, { replyId: bobNote.id, text: '@alice still muted' });
		const mentions = await api('notes/mentions', {}, alice);
		assert.strictEqual(mentions.status, 200);
		assert.strictEqual((mentions.body as unknown[]).some((note: any) => note.id === carolReply.id), false);

		const deleteThread = await api('notes/thread-muting/delete', { noteId: aliceReply.id }, alice);
		assert.strictEqual(deleteThread.status, 204);
	});

	test('noteOnly=true の create/delete が往復できる', async () => {
		const bobNote = await post(bob, { text: 'note mute roundtrip root' });

		const create = await api('notes/thread-muting/create', { noteId: bobNote.id, noteOnly: true }, alice);
		assert.strictEqual(create.status, 204);

		const del = await api('notes/thread-muting/delete', { noteId: bobNote.id, noteOnly: true }, alice);
		assert.strictEqual(del.status, 204);
	});
});
