/*
 * SPDX-FileCopyrightText: hazelnoot and other Sharkey contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Ref } from 'vue';
import type * as Misskey from 'misskey-js';
import { misskeyApi } from '@/utility/misskey-api.js';
import { miLocalStorage } from '@/local-storage.js';

/**
 * Server-side translation of a note (notes/translate). Sets `translation` to the result,
 * or `false` on failure. Shared by the Sk* note components. Upstream's get-note-menu keeps
 * its own browser-translator path; this helper is the server path only.
 */
export async function translateNote(noteId: string, translation: Ref<Misskey.entities.NotesTranslateResponse | false | null>, translating: Ref<boolean>): Promise<void> {
	if (translating.value || translation.value) return;
	translating.value = true;
	try {
		const targetLang = miLocalStorage.getItem('lang') ?? navigator.language;
		translation.value = await misskeyApi('notes/translate', {
			noteId,
			targetLang,
		});
	} catch (err) {
		console.error(`Translation failed for ${noteId}: `, err);
		translation.value = false;
	} finally {
		translating.value = false;
	}
}
