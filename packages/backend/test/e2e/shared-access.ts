/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

process.env.NODE_ENV = 'test';

import * as assert from 'assert';
import { describe, beforeAll, test } from 'vitest';
import { api, castAsError, initTestDb, signup } from '../utils.js';
import type * as misskey from 'misskey-js';
import { MiAccessToken } from '@/models/_.js';

describe('Shared access', () => {
	let alice: misskey.entities.SignupResponse;
	let bob: misskey.entities.SignupResponse;
	let carol: misskey.entities.SignupResponse;
	let grantId: string;

	beforeAll(async () => {
		alice = await signup({ username: 'alice' });
		bob = await signup({ username: 'bob' });
		carol = await signup({ username: 'carol' });

		const connection = await initTestDb(true);
		const accessTokens = connection.getRepository(MiAccessToken);

		grantId = 'sharedaccess0001';
		await accessTokens.insert({
			id: grantId,
			lastUsedAt: new Date(),
			token: 'shared-access-token-secret',
			hash: 'shared-access-token-secret',
			session: null,
			userId: alice.id,
			appId: null,
			name: 'shared',
			description: null,
			iconUrl: null,
			permission: ['read:account'],
			fetched: false,
			rank: null,
			granteeIds: [bob.id],
		});
	}, 1000 * 60 * 2);

	test('grantee can list shared accesses', async () => {
		const res = await api('i/shared-access/list', {}, bob);
		assert.strictEqual(res.status, 200);
		assert.strictEqual(Array.isArray(res.body), true);
		assert.strictEqual(res.body.length, 1);
		assert.strictEqual(res.body[0].id, grantId);
		assert.deepStrictEqual(res.body[0].permissions, ['read:account']);
		assert.strictEqual(res.body[0].user.id, alice.id);
		assert.strictEqual(res.body[0].rank, null);
	});

	test('user with no grants gets an empty list', async () => {
		const res = await api('i/shared-access/list', {}, carol);
		assert.strictEqual(res.status, 200);
		assert.deepStrictEqual(res.body, []);
	});

	test('grantee can log in with a grant', async () => {
		const res = await api('i/shared-access/login', { grantId }, bob);
		assert.strictEqual(res.status, 200);
		assert.strictEqual(res.body.token, 'shared-access-token-secret');
		assert.strictEqual(res.body.userId, alice.id);
	});

	test('non-grantee cannot log in with a grant', async () => {
		const res = await api('i/shared-access/login', { grantId }, carol);
		assert.strictEqual(res.status, 403);
		assert.strictEqual(castAsError(res.body as any).error.code, 'NO_SUCH_ACCESS');
	});

	test('unknown grant id is rejected', async () => {
		const res = await api('i/shared-access/login', { grantId: 'nosuchgrant00000' }, bob);
		assert.strictEqual(res.status, 403);
		assert.strictEqual(castAsError(res.body as any).error.code, 'NO_SUCH_ACCESS');
	});
});
