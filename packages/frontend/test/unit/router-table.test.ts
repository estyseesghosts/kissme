/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, test, vi } from 'vitest';
import type { Component } from 'vue';
import { ROUTE_DEF } from '@/router.definition.js';
import { Nirax } from '@/lib/nirax.js';

// The statically imported timeline page drags in half the app (and a module-level useRouter() call that is circular
// with router.definition.ts). The table test only needs the paths, so stub it.
vi.mock('@/pages/timeline.vue', () => ({ default: { name: 'timeline-stub' } }));
vi.mock('@/i.js', () => ({ $i: { policies: { chatAvailability: 'available' } }, iAmModerator: true }));
vi.mock('@/pages/_error_.vue', () => ({ default: { name: 'error-stub' } }));
vi.mock('@/pages/_loading_.vue', () => ({ default: { name: 'loading-stub' } }));

const notFound = { name: 'not-found' } as Component;

function resolve(path: string, loggedIn = true) {
	const res = new Nirax(ROUTE_DEF, '/', loggedIn, notFound).resolve(path);
	if (res == null) return null;
	// Report the innermost matched route so nested entries (settings, admin) can be asserted.
	let leaf = res;
	while (leaf.child != null) leaf = leaf.child;
	return leaf;
}

describe('route table (Phase 10.3)', () => {
	test('top-level paths are unique', () => {
		const paths = ROUTE_DEF.map(r => r.path);
		const dupes = paths.filter((p, i) => paths.indexOf(p) !== i);
		expect(dupes).toEqual([]);
	});

	test.each([
		['/following-feed', '/following-feed'],
		['/following-feed/abc123', '/following-feed/:userId'],
		['/unsubscribe/user1/tok', '/unsubscribe/:user/:token'],
		['/about-sharkey', '/about-sharkey'],
		['/about-misskey', '/about-misskey'],
		['/verify-email/code1', '/verify-email/:code'],
		['/qr', '/qr'],
		['/settings/sharkey', '/sharkey'],
		['/admin/approvals', '/approvals'],
	])('%s resolves to %s', (path, routePath) => {
		const res = resolve(path);
		expect(res).not.toBeNull();
		expect(res?.route.path).toBe(routePath);
	});

	test('unknown paths hit the catch-all (not-found) route', () => {
		expect(resolve('/definitely/not/a/route')?.route.path).toBe('/:(*)');
		expect(resolve('/following-feed/a/b')?.route.path).toBe('/:(*)');
		expect(resolve('/unsubscribe/only-one')?.route.path).toBe('/:(*)');
	});
});
