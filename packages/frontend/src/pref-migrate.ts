/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

// Phase 10.2: legacy (pre 2025.3.2-alpha.0) settings -> preferences. Ported from Sharkey, which kept
// this after upstream Misskey dropped it. The pure planning step is in pref-migrate-core.ts (unit tested).
//
// Call site (owned by boot, slice 10.4): in `mainBoot()` inside the `isClientUpdated` branch,
//   if (shouldMigrateOldSettings(lastVersion)) migrateOldSettings();
// `lastVersion` is the value `common()` already returns. No other caller is needed.

import { planPrefMigration, shouldMigrateOldSettings } from './pref-migrate-core.js';
import type { LegacyPlugin, LegacyInput } from './pref-migrate-core.js';
import { store } from '@/store.js';
import { prefer } from '@/preferences.js';
import { misskeyApi } from '@/utility/misskey-api.js';
import { deckStore } from '@/ui/deck/deck-store.js';
import { unisonReload } from '@/utility/unison-reload.js';
import { genId } from '@/utility/id.js';
import * as os from '@/os.js';
import { i18n } from '@/i18n.js';

export { shouldMigrateOldSettings };

function readCold<T>(key: string): T | undefined {
	// Old ColdDeviceStorage: localStorage `miux:<key>`, JSON. Read only; never written back.
	try {
		const raw = window.localStorage.getItem(`miux:${key}`);
		return raw == null ? undefined : JSON.parse(raw) as T;
	} catch {
		return undefined;
	}
}

// TODO: そのうち消す
export function migrateOldSettings(): void {
	os.waiting({ text: i18n.ts._skSettings.migrating });

	store.loaded.then(async () => {
		const registryThemes = await misskeyApi('i/registry/get', { scope: ['client'], key: 'themes' }).catch(() => null);

		const registryDeckProfiles: LegacyInput['registryDeckProfiles'] = [];
		const keys = await misskeyApi('i/registry/keys', { scope: ['client', 'deck', 'profiles'] }).catch(() => [] as string[]);
		for (const key of keys) {
			const value = await misskeyApi('i/registry/get', { scope: ['client', 'deck', 'profiles'], key }).catch(() => null);
			registryDeckProfiles.push({ key, value });
		}

		const commits = planPrefMigration({
			store: store.s,
			cold: {
				lightTheme: readCold<NonNullable<LegacyInput['cold']['lightTheme']>>('lightTheme'),
				darkTheme: readCold<NonNullable<LegacyInput['cold']['darkTheme']>>('darkTheme'),
				syncDeviceDarkMode: readCold<boolean>('syncDeviceDarkMode'),
				plugins: readCold<LegacyPlugin[]>('plugins'),
			},
			registryThemes,
			deckProfileName: deckStore.s.profile,
			registryDeckProfiles,
			makeId: genId,
		});

		for (const c of commits) {
			// PrefCommit is a key/value union that TypeScript cannot correlate at this call; planPrefMigration types each pair.
			prefer.commit(c.key as never, c.value as never);
		}

		window.setTimeout(() => {
			unisonReload();
		}, 10000);
	});
}
