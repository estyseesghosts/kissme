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

	// MkPostForm.vue (edit mode)
	confirmPollEditTitle: 'Edit poll?',
	confirmPollEditText: 'The poll was changed. Editing a note with a poll may reset its votes. Continue?',

	// SkNoteTranslation.vue
	translationFailed: 'Translation failed',

	// SkFetchNote.vue
	cannotLoadNote: 'Cannot load note',

	// MkUrlWarningDialog.vue
	externalWarningTitle: 'External website',
	externalWarningDescription: 'This link goes to a website outside {host}. Check that you trust it before you continue.',
	externalWarningTrust: 'Trust this domain',

	// SkFlashPlayer.vue (wording from the donor's sharkey-locales _flash.*)
	flashContentHidden: 'Flash Content Hidden',
	flashPoweredByRuffle: 'Powered by Ruffle.',
	flashArbitraryCodeExecutionWarning: 'Always be wary of arbitrary code execution!',
	flashFailedToLoad: 'Flash Content Failed To Load:',
	flashIsLoading: 'Flash Content Is Loading',
	flashLoadingRufflePlayer: 'Loading Ruffle player',
	flashLoadingFlashFile: 'Loading Flash file',
	flashCspError: 'raw.esm.sh could not be accessed, meaning this instance\'s Content Security Policy is likely out of date. Please contact your instance administrators.',

	// SkModPlayer.vue (patternHidden is hard-coded in the donor; the other two are written for this port, the donor has no wording)
	modPatternHidden: 'Pattern Hidden',
	modFailedToLoad: 'Module failed to load',
	modAudioUnsupported: 'Audio playback is not supported in this browser.',

	// SkMediaImage.vue (hard-coded in the donor)
	imageLacksDescription: 'Image lacks descriptive text',

	// sk-like.ts (written for this port; the donor's like() is fire-and-forget and has no wording)
	likeNotSupported: 'This server does not support likes yet.',
} as const;
