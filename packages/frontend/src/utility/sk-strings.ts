/*
 * SPDX-FileCopyrightText: hazelnoot and other Sharkey contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { ParameterizedString } from 'i18n';

/**
 * Sharkey UI strings that Misskey's en-US.yml does not have yet.
 *
 * Single source for every Sk* component. The port is no longer constrained to upstream
 * strings, so these are not in any locale file. Each entry is listed in MISSING-STRINGS.md.
 * Move entries into locales/en-US.yml when they are settled, then remove them here.
 */
export const skStrings = {
	// SkMutedNote.vue
	noteIsFlaggedAs: 'Flagged as: {cw}' as ParameterizedString<'cw'>,
	userIsFlaggedAs: '{name} is flagged as: {cw}' as ParameterizedString<'name' | 'cw'>,
	instanceIsFlaggedAs: '{name} is flagged as: {cw}' as ParameterizedString<'name' | 'cw'>,
	userSaysSomethingInMutedNote: '{name} posted a muted note' as ParameterizedString<'name'>,
	userSaysSomethingInMutedThread: '{name} posted in a muted thread' as ParameterizedString<'name'>,
	silencedUserSaysSomething: '{name} ({host}) is silenced and posted' as ParameterizedString<'name' | 'host'>,
	silencedInstanceSaysSomething: '{name} is from a silenced instance and posted' as ParameterizedString<'name' | 'host'>,

	// SkUrlPreview.vue
	writtenBy: 'Written by {user}' as ParameterizedString<'user'>,
	fetchLinkedNote: 'Fetch linked note',

	// SkNote.vue, SkNoteSub.vue, SkNoteDetailed.vue, SkNoteSimple.vue
	quoted: 'Quoted.',
	rmboost: 'Removed boost.',
	noteFooterLabel: 'Note actions',
	animatedMFM: {
		play: 'Play',
		stop: 'Stop',
		alertText: 'Animated MFM may be distracting. Play it anyway?',
		alertConfirm: 'Play',
	},

	// MkScheduleEditor.vue, MkSchedulePostListDialog.vue, MkPostForm.vue
	postOn: 'Post on',
	schedulePostList: 'Scheduled notes',

	// SkNoteTranslation.vue
	translationFailed: 'Translation failed',

	// SkFetchNote.vue
	cannotLoadNote: 'Cannot load note',

	// MkUrlWarningDialog.vue
	externalWarningTitle: 'External website',
	externalWarningDescription: 'This link goes to a website outside {host}. Check that you trust it before you continue.',
	externalWarningTrust: 'Trust this domain',
} as const;
