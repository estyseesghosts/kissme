/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, expect, test } from 'vitest';
import legacyProfile from './fixtures/legacy-profile.json';
import type { LegacyInput } from '@/pref-migrate-core.js';
import { planPrefMigration, shouldMigrateOldSettings } from '@/pref-migrate-core.js';

function plan(input: Partial<LegacyInput> = {}) {
	let n = 0;
	const commits = planPrefMigration({
		...(legacyProfile as unknown as LegacyInput),
		makeId: () => `id${++n}`,
		...input,
	});
	return new Map(commits.map(c => [c.key, c.value]));
}

describe('shouldMigrateOldSettings', () => {
	test('runs only for versions older than 2025.3.2-alpha.0', () => {
		expect(shouldMigrateOldSettings('2025.3.1')).toBe(true);
		expect(shouldMigrateOldSettings('2024.11.0')).toBe(true);
		expect(shouldMigrateOldSettings('2025.3.2-alpha.0')).toBe(false);
		expect(shouldMigrateOldSettings('2025.3.2')).toBe(false);
		expect(shouldMigrateOldSettings('2026.10.0')).toBe(false);
	});
	test('fresh installs and garbage versions do not migrate', () => {
		expect(shouldMigrateOldSettings(null)).toBe(false);
		expect(shouldMigrateOldSettings(undefined)).toBe(false);
		expect(shouldMigrateOldSettings('')).toBe(false);
		expect(shouldMigrateOldSettings('not-a-version')).toBe(false);
	});
});

describe('planPrefMigration', () => {
	test('themes, light/dark and plugins', () => {
		const c = plan();
		expect(c.get('themes')).toEqual(legacyProfile.registryThemes);
		expect(c.get('lightTheme')).toEqual(legacyProfile.cold.lightTheme);
		expect(c.get('darkTheme')).toEqual(legacyProfile.cold.darkTheme);
		expect(c.get('syncDeviceDarkMode')).toBe(false);
		const plugins = c.get('plugins') as { installId: string; id?: string; name: string; config: unknown }[];
		expect(plugins).toHaveLength(1);
		expect(plugins[0].installId).toBe('plugin-1');
		expect(plugins[0]).not.toHaveProperty('id');
		expect(plugins[0].config).toEqual({ k: 1 });
	});

	test('deck profiles: valid ones kept with new ids, broken ones skipped', () => {
		const c = plan();
		expect(c.get('deck.profile')).toBe('main');
		expect(c.get('deck.profiles')).toEqual([{
			id: 'id1',
			name: 'main',
			columns: [{ id: 'c1', type: 'main' }],
			layout: [['c1']],
		}]);
	});

	test('emoji palettes and menu', () => {
		const c = plan();
		expect(c.get('emojiPalettes')).toEqual([
			{ id: 'reactions', name: '', emojis: ['👍', '❤️'] },
			{ id: 'pinnedEmojis', name: '', emojis: [':a:'] },
		]);
		expect(c.get('emojiPaletteForMain')).toBe('pinnedEmojis');
		expect(c.get('emojiPaletteForReaction')).toBe('reactions');
		expect(c.get('menu')).toEqual(['notifications', '-', 'explore', 'chat']);
	});

	test('plain store values, renamed keys and dataSaver shape', () => {
		const c = plan();
		expect(c.get('keepCw')).toBe(false);
		expect(c.get('nsfw')).toBe('force');
		expect(c.get('squareAvatars')).toBe(true);
		expect(c.get('defaultFollowWithReplies')).toBe(true);
		expect(c.get('sound.masterVolume')).toBe(0.8);
		expect(c.get('sound.on.note')).toEqual({ type: 'syuilo/n-aec', volume: 0.5 });
		expect(c.get('dataSaver')).toEqual({ media: true, avatar: false, urlPreviewThumbnail: true, disableUrlPreview: false, code: false });
	});

	test('Sharkey state: noteDesign renamed, followingFeed completed, lists kept', () => {
		const c = plan();
		expect(c.get('noteDesign')).toBe('sk');
		expect(c.get('followingFeed')).toMatchObject({ withNonPublic: true });
		expect(Object.keys(c.get('followingFeed') as object).length).toBeGreaterThan(1);
		expect(c.get('trustedDomains')).toEqual(['example.com']);
		expect(c.get('warnMissingAltText')).toBe(false);
	});

	test('absent legacy values are skipped, not defaulted', () => {
		const c = plan({ store: {}, cold: {}, registryThemes: null, registryDeckProfiles: [], deckProfileName: undefined });
		expect(c.size).toBe(0);
	});

	test('a failed themes registry call keeps existing themes', () => {
		expect(plan({ registryThemes: [] }).has('themes')).toBe(false);
	});

	test('no commit is emitted twice for the same key', () => {
		const keys = [...plan().keys()];
		expect(new Set(keys).size).toBe(keys.length);
	});
});
