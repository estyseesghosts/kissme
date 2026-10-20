/*
 * SPDX-FileCopyrightText: dakkar and other misskey contributors
 * SPDX-License-Identifier: AGPL-3.0-only
*/

import { ref, computed } from 'vue';
import * as Misskey from 'misskey-js';
import type { Ref, ComputedRef } from 'vue';
import type { MenuItem } from '@/types/menu.js';
import { i18n } from '@/i18n.js';
import { prefer } from '@/preferences';
import { store } from '@/store.js';

/*
	Sharkey-specific bits of boosting and quoting, shared by the Sk* note components.
	Slice 1.4. Icons are Tabler (ti-*); Sharkey used Phosphor.
 */

export type Visibility = 'public' | 'home' | 'followers' | 'specified';

export function smallerVisibility(a: Visibility | string, b: Visibility | string): Visibility {
	if (a === 'specified' || b === 'specified') return 'specified';
	if (a === 'followers' || b === 'followers') return 'followers';
	if (a === 'home' || b === 'home') return 'home';
	// if (a === 'public' || b === 'public')
	return 'public';
}

export function visibilityIsAtLeast(a: Visibility | string, b: Visibility | string): boolean {
	return smallerVisibility(a, b) === b;
}

export function boostMenuItems(appearNote: Ref<Misskey.entities.Note>, renote: (v: Visibility, l: boolean) => void): MenuItem[] {
	const localOnly = ref(prefer.s.rememberNoteVisibility ? store.s.localOnly : prefer.s.defaultNoteLocalOnly);
	const effectiveVisibility = (
		appearNote.value.channel?.isSensitive
			? smallerVisibility(appearNote.value.visibility, 'home')
			: appearNote.value.visibility
	);

	const menuItems: MenuItem[] = [];
	if (visibilityIsAtLeast(effectiveVisibility, 'public')) {
		menuItems.push({
			type: 'button',
			icon: 'ti ti-world',
			text: i18n.ts._visibility['public'],
			action: () => {
				renote('public', localOnly.value);
			},
		} as MenuItem);
	}
	if (visibilityIsAtLeast(effectiveVisibility, 'home')) {
		menuItems.push({
			type: 'button',
			icon: 'ti ti-home',
			text: i18n.ts._visibility['home'],
			action: () => {
				renote('home', localOnly.value);
			},
		} as MenuItem);
	}
	if (visibilityIsAtLeast(effectiveVisibility, 'followers')) {
		menuItems.push({
			type: 'button',
			icon: 'ti ti-lock',
			text: i18n.ts._visibility['followers'],
			action: () => {
				renote('followers', localOnly.value);
			},
		} as MenuItem);
	}

	return [
		...menuItems,
		{
			type: 'switch',
			icon: 'ti ti-planet',
			text: i18n.ts._timelines.local,
			ref: localOnly,
		} as MenuItem,
	];
}

export function computeRenoteTooltip(note: ComputedRef<Misskey.entities.Note>): ComputedRef<string> {
	// Sharkey switches to "unrenote" when the viewer already renoted this note (note.isRenoted, a Sharkey-only
	// field). Misskey-js has no such field, so the tooltip is always "renote" until get-self-note-ids lands.
	return computed(() => {
		void note.value;
		return i18n.ts.renote;
	});
}
