/*
 * SPDX-FileCopyrightText: syuilo and other misskey contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { apiUrl } from '@@/js/config.js';
import { $i } from '@/i.js';
import { misskeyApi } from '@/utility/misskey-api.js';

/**
 * `admin/approve-user` and `admin/decline-user` are Sharkey endpoints, absent from misskey-js
 * and from a stock Misskey backend. Calls go through an untyped alias; remove once typed.
 */
type UntypedApi = (endpoint: string, body: object) => Promise<unknown>;
const api = misskeyApi as unknown as UntypedApi;

export function approveUser(userId: string): Promise<unknown> {
	return api('admin/approve-user', { userId });
}

export function declineUser(userId: string): Promise<unknown> {
	return api('admin/decline-user', { userId });
}

/** HTTP statuses that mean "this endpoint does not exist on the server". */
export function isMissingEndpointStatus(status: number): boolean {
	return status === 404 || status === 405 || status === 501;
}

/**
 * Probes whether the backend has the approval endpoints. The probe sends no `userId`, so a
 * Sharkey backend rejects it with a parameter error (400) without acting, while a stock
 * backend answers 404. Network failures are treated as "supported" so the page can show
 * its own load error rather than a misleading disabled note.
 */
export async function probeApprovalsSupported(): Promise<boolean> {
	try {
		const res = await window.fetch(`${apiUrl}/admin/approve-user`, {
			method: 'POST',
			body: JSON.stringify({ i: $i?.token }),
			credentials: 'omit',
			cache: 'no-cache',
			headers: { 'Content-Type': 'application/json' },
		});
		return !isMissingEndpointStatus(res.status);
	} catch {
		return true;
	}
}
