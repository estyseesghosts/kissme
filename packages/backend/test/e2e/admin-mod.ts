/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

process.env.NODE_ENV = 'test';

import { describe, beforeAll, test } from 'vitest';
import * as assert from 'node:assert';
import { api, initTestDb, post, signup } from '../utils.js';
import type * as misskey from 'misskey-js';

describe('admin-mod', () => {
	let root: misskey.entities.SignupResponse;
	let alice: misskey.entities.SignupResponse;

	beforeAll(async () => {
		// The first signup becomes root (rootUserId), satisfying requireModerator/requireAdmin.
		root = await signup({ username: 'root' });
		alice = await signup({ username: 'alice' });
	}, 1000 * 60 * 2);

	describe('admin/cw-user', () => {
		test('set and unset roundtrip', async () => {
			const set = await api('admin/cw-user', { userId: alice.id, cw: 'sensitive' }, root);
			assert.ok(set.status === 200 || set.status === 204, `unexpected status ${set.status}`);

			// Idempotent re-set is a no-op success.
			const setAgain = await api('admin/cw-user', { userId: alice.id, cw: 'sensitive' }, root);
			assert.ok(setAgain.status === 200 || setAgain.status === 204, `unexpected status ${setAgain.status}`);

			const unset = await api('admin/cw-user', { userId: alice.id, cw: null }, root);
			assert.ok(unset.status === 200 || unset.status === 204, `unexpected status ${unset.status}`);
		});

		test('non-moderator cannot use it', async () => {
			const res = await api('admin/cw-user', { userId: alice.id, cw: 'x' }, alice);
			assert.strictEqual(res.status, 403);
		});
	});

	describe('admin/cw-note', () => {
		test('set and unset roundtrip', async () => {
			const note = await post(alice, { text: 'hello' });

			const set = await api('admin/cw-note', { noteId: note.id, cw: 'spoiler' }, root);
			assert.ok(set.status === 200 || set.status === 204, `unexpected status ${set.status}`);

			const unset = await api('admin/cw-note', { noteId: note.id, cw: null }, root);
			assert.ok(unset.status === 200 || unset.status === 204, `unexpected status ${unset.status}`);
		});
	});

	describe('admin/silence-user', () => {
		test('silence and unsilence roundtrip', async () => {
			const silence = await api('admin/silence-user', { userId: alice.id }, root);
			assert.ok(silence.status === 200 || silence.status === 204, `unexpected status ${silence.status}`);

			// Idempotent re-silence is a no-op success.
			const silenceAgain = await api('admin/silence-user', { userId: alice.id }, root);
			assert.ok(silenceAgain.status === 200 || silenceAgain.status === 204, `unexpected status ${silenceAgain.status}`);

			const logs = await api('admin/show-moderation-logs', { type: 'silenceUser', limit: 10 }, root);
			assert.strictEqual(logs.status, 200);
			assert.ok(Array.isArray(logs.body), 'expected moderation log array');
			assert.ok((logs.body as unknown[]).length >= 1, 'expected at least one silenceUser log');

			const unsilence = await api('admin/unsilence-user', { userId: alice.id }, root);
			assert.ok(unsilence.status === 200 || unsilence.status === 204, `unexpected status ${unsilence.status}`);

			// Idempotent re-unsilence is a no-op success.
			const unsilenceAgain = await api('admin/unsilence-user', { userId: alice.id }, root);
			assert.ok(unsilenceAgain.status === 200 || unsilenceAgain.status === 204, `unexpected status ${unsilenceAgain.status}`);
		});
	});

	describe('admin/approve-user and admin/decline-user', () => {
		test('approve rejects an already-approved user', async () => {
			const res = await api('admin/approve-user', { userId: alice.id }, root);
			assert.strictEqual(res.status, 400);
			assert.strictEqual((res.body as { error: { code: string } }).error.code, 'USER_IS_APPROVED');
		});

		test('approve succeeds on an unapproved user', async () => {
			const bob = await signup({ username: 'bob' });
			const db = await initTestDb(true);
			try {
				await db.query('UPDATE "user" SET approved = false WHERE id = $1', [bob.id]);
			} finally {
				await db.destroy();
			}

			const res = await api('admin/approve-user', { userId: bob.id }, root);
			assert.ok(res.status === 200 || res.status === 204, `unexpected status ${res.status}`);

			const again = await api('admin/approve-user', { userId: bob.id }, root);
			assert.strictEqual(again.status, 400);
			assert.strictEqual((again.body as { error: { code: string } }).error.code, 'USER_IS_APPROVED');
		});

		test('decline rejects an already-approved user', async () => {
			const res = await api('admin/decline-user', { userId: alice.id }, root);
			assert.strictEqual(res.status, 400);
			assert.strictEqual((res.body as { error: { code: string } }).error.code, 'USER_IS_APPROVED');
		});

		test('decline deletes an unapproved user', async () => {
			const carol = await signup({ username: 'carol' });
			const db = await initTestDb(true);
			try {
				await db.query('UPDATE "user" SET approved = false WHERE id = $1', [carol.id]);
			} finally {
				await db.destroy();
			}

			const res = await api('admin/decline-user', { userId: carol.id }, root);
			assert.ok(res.status === 200 || res.status === 204, `unexpected status ${res.status}`);

			// The account is now marked deleted: declining again reports no such user.
			const gone = await api('admin/decline-user', { userId: carol.id }, root);
			assert.strictEqual(gone.status, 400);
			assert.strictEqual((gone.body as { error: { code: string } }).error.code, 'NO_SUCH_USER');
		});
	});
});
