/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
const backendUrlOverride = new URLSearchParams(window.location.search).get('backend')
	|| window.document.querySelector<HTMLMetaElement>('meta[property="instance_url"]')?.content
	|| window.location.href;
const address = new URL(backendUrlOverride);
const siteName = window.document.querySelector<HTMLMetaElement>('meta[property="og:site_name"]')?.content;

export const host = address.host;
export const hostname = address.hostname;
export const url = address.origin;
export const port = address.port;
export const apiUrl = address.origin + '/api';
export const wsOrigin = address.origin;
export const lang = localStorage.getItem('lang') ?? 'en-US';
export const langs = _LANGS_;
export const version = _VERSION_;
export const instanceName = (siteName === 'Misskey' || siteName == null) ? host : siteName;
export const ui = localStorage.getItem('ui');
export const debug = localStorage.getItem('debug') === 'true';
export const isSafeMode = localStorage.getItem('isSafeMode') === 'true';
export const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion)').matches;
