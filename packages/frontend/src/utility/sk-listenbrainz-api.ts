/*
 * SPDX-FileCopyrightText: amelia and other Sharkey contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { misskeyApi } from '@/utility/misskey-api.js';
import { parseListenBrainz } from '@/utility/sk-listenbrainz.js';
import type { SkListenBrainzData } from '@/utility/sk-listenbrainz.js';

/**
 * `users/listenbrainz` is a Sharkey-only endpoint, absent from misskey-js and from a stock Misskey
 * backend. The call goes through an untyped alias; remove once typed.
 */
type UntypedApi = (endpoint: string, body: object) => Promise<unknown>;
const api = misskeyApi as unknown as UntypedApi;

export async function fetchListenBrainz(userId: string): Promise<SkListenBrainzData | undefined> {
	return parseListenBrainz(await api('users/listenbrainz', { userId }));
}
