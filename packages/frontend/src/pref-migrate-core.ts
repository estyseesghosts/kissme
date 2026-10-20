/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

// Pure part of the legacy settings migration (Phase 10.2). No side effects and no app imports at runtime,
// so it can be unit tested. The side-effecting wrapper is pref-migrate.ts.

import { compareVersions } from 'compare-versions';
import { defaultFollowingFeedState } from '@/types/following-feed.js';
import type { PREF_DEF } from '@/preferences/def.js';
import type { store } from '@/store.js';
import type { DeckProfile } from '@/deck.js';

/** Settings written by clients older than this version live in the legacy store and are migrated. */
export const PREF_MIGRATION_VERSION = '2025.3.2-alpha.0';

type Defs = typeof PREF_DEF;
export type PrefValue<K extends keyof Defs> = Defs[K]['default'] extends (...args: never[]) => infer R ? R : Defs[K]['default'];

export type PrefCommit = { [K in keyof Defs]: { key: K; value: PrefValue<K> } }[keyof Defs];

export type LegacyStore = Partial<typeof store.s>;

export type LegacyPlugin = Omit<PrefValue<'plugins'>[number], 'installId'> & { id: string };

export type LegacyInput = {
	/** The legacy `base` store (`store.s`). Missing keys are skipped, not defaulted. */
	store: LegacyStore;
	/** Old `ColdDeviceStorage` values (localStorage `miux:*` keys). */
	cold: {
		lightTheme?: PrefValue<'lightTheme'>;
		darkTheme?: PrefValue<'darkTheme'>;
		syncDeviceDarkMode?: boolean;
		plugins?: LegacyPlugin[];
	};
	/** Result of `i/registry/get` `client/themes`, or null if the call failed. */
	registryThemes: unknown;
	/** Name of the deck profile that was current (`deckStore.s.profile`). */
	deckProfileName?: string;
	/** `i/registry/get` results for `client/deck/profiles`, one per registry key. */
	registryDeckProfiles: { key: string; value: unknown }[];
	makeId: () => string;
};

/**
 * The migration only runs for clients that last ran a version older than PREF_MIGRATION_VERSION.
 * A missing `lastVersion` means a fresh install, which has nothing to migrate.
 */
export function shouldMigrateOldSettings(lastVersion: string | null | undefined): boolean {
	if (!lastVersion) return false;
	try {
		return compareVersions(PREF_MIGRATION_VERSION, lastVersion) === 1;
	} catch {
		return false;
	}
}

function isRecord(x: unknown): x is Record<string, unknown> {
	return typeof x === 'object' && x != null && !Array.isArray(x);
}

export function parseRegistryDeckProfile(key: string, value: unknown, id: string): DeckProfile | null {
	if (!isRecord(value)) return null;
	if (!Array.isArray(value.columns) || !Array.isArray(value.layout)) return null;
	return {
		id,
		name: key,
		columns: value.columns as DeckProfile['columns'],
		layout: value.layout as DeckProfile['layout'],
	};
}

/**
 * Builds the list of preference commits for a legacy profile. Order matters only in that later entries
 * for the same key win; none repeat.
 */
export function planPrefMigration(input: LegacyInput): PrefCommit[] {
	const out: PrefCommit[] = [];
	const s = input.store;

	function put<K extends keyof Defs>(key: K, value: PrefValue<K> | undefined): void {
		if (value === undefined) return;
		out.push({ key, value } as PrefCommit);
	}

	//#region registry and cold storage
	if (Array.isArray(input.registryThemes) && input.registryThemes.length > 0) {
		put('themes', input.registryThemes as PrefValue<'themes'>);
	}

	if (input.cold.plugins != null) {
		put('plugins', input.cold.plugins.map(p => {
			const { id, ...rest } = p;
			return { ...rest, installId: id };
		}));
	}

	put('deck.profile', input.deckProfileName);
	const profiles: DeckProfile[] = [];
	for (const { key, value } of input.registryDeckProfiles) {
		const profile = parseRegistryDeckProfile(key, value, input.makeId());
		if (profile != null) profiles.push(profile);
	}
	if (profiles.length > 0) put('deck.profiles', profiles);

	put('lightTheme', input.cold.lightTheme);
	put('darkTheme', input.cold.darkTheme);
	put('syncDeviceDarkMode', input.cold.syncDeviceDarkMode);
	//#endregion

	//#region emoji palettes
	if (s.reactions != null || s.pinnedEmojis != null) {
		put('emojiPalettes', [{
			id: 'reactions',
			name: '',
			emojis: s.reactions ?? [],
		}, {
			id: 'pinnedEmojis',
			name: '',
			emojis: s.pinnedEmojis ?? [],
		}]);
		put('emojiPaletteForMain', 'pinnedEmojis');
		put('emojiPaletteForReaction', 'reactions');
	}
	//#endregion

	put('overridedDeviceKind', s.overridedDeviceKind);
	put('widgets', s.widgets as PrefValue<'widgets'> | undefined);
	put('keepCw', s.keepCw);
	put('collapseRenotes', s.collapseRenotes);
	put('rememberNoteVisibility', s.rememberNoteVisibility);
	put('uploadFolder', s.uploadFolder);
	if (s.menu != null) put('menu', s.menu.includes('chat') ? s.menu : [...s.menu, 'chat']);
	put('statusbars', s.statusbars as PrefValue<'statusbars'> | undefined);
	put('pinnedUserLists', s.pinnedUserLists);
	put('serverDisconnectedBehavior', s.serverDisconnectedBehavior as PrefValue<'serverDisconnectedBehavior'> | undefined);
	put('nsfw', s.nsfw);
	put('highlightSensitiveMedia', s.highlightSensitiveMedia);
	put('animation', s.animation);
	put('animatedMfm', s.animatedMfm);
	put('advancedMfm', s.advancedMfm);
	put('showReactionsCount', s.showReactionsCount);
	put('enableQuickAddMfmFunction', s.enableQuickAddMfmFunction);
	put('loadRawImages', s.loadRawImages);
	put('imageNewTab', s.imageNewTab);
	put('disableShowingAnimatedImages', s.disableShowingAnimatedImages);
	put('emojiStyle', s.emojiStyle);
	put('menuStyle', s.menuStyle);
	put('useBlurEffectForModal', s.useBlurEffectForModal);
	put('useBlurEffect', s.useBlurEffect);
	put('showFixedPostForm', s.showFixedPostForm);
	put('showFixedPostFormInChannel', s.showFixedPostFormInChannel);
	put('enableInfiniteScroll', s.enableInfiniteScroll);
	put('useReactionPickerForContextMenu', s.useReactionPickerForContextMenu);
	put('showGapBetweenNotesInTimeline', s.showGapBetweenNotesInTimeline);
	put('instanceTicker', s.instanceTicker);
	put('emojiPickerScale', s.emojiPickerScale);
	put('emojiPickerWidth', s.emojiPickerWidth);
	put('emojiPickerHeight', s.emojiPickerHeight);
	put('emojiPickerStyle', s.emojiPickerStyle);
	put('reportError', s.reportError);
	put('squareAvatars', s.squareAvatars);
	put('showAvatarDecorations', s.showAvatarDecorations);
	put('numberOfPageCache', s.numberOfPageCache);
	put('showNoteActionsOnlyHover', s.showNoteActionsOnlyHover);
	put('showClipButtonInNoteFooter', s.showClipButtonInNoteFooter);
	put('reactionsDisplaySize', s.reactionsDisplaySize);
	put('limitWidthOfReaction', s.limitWidthOfReaction);
	put('forceShowAds', s.forceShowAds);
	put('aiChanMode', s.aiChanMode);
	put('devMode', s.devMode);
	put('mediaListWithOneImageAppearance', s.mediaListWithOneImageAppearance);
	put('notificationPosition', s.notificationPosition);
	put('notificationStackAxis', s.notificationStackAxis);
	put('keepScreenOn', s.keepScreenOn);
	put('disableStreamingTimeline', s.disableStreamingTimeline);
	put('useGroupedNotifications', s.useGroupedNotifications);
	if (s.dataSaver != null) {
		// The legacy `urlPreview` flag became `urlPreviewThumbnail`; the rest of the current shape keeps its defaults.
		put('dataSaver', {
			media: s.dataSaver.media,
			avatar: s.dataSaver.avatar,
			urlPreviewThumbnail: s.dataSaver.urlPreview,
			disableUrlPreview: false,
			code: s.dataSaver.code,
		});
	}
	put('enableSeasonalScreenEffect', s.enableSeasonalScreenEffect);
	put('enableHorizontalSwipe', s.enableHorizontalSwipe);
	put('useNativeUiForVideoAudioPlayer', s.useNativeUIForVideoAudioPlayer);
	put('keepOriginalFilename', s.keepOriginalFilename);
	put('alwaysConfirmFollow', s.alwaysConfirmFollow);
	put('confirmWhenRevealingSensitiveMedia', s.confirmWhenRevealingSensitiveMedia);
	put('contextMenu', s.contextMenu);
	put('skipNoteRender', s.skipNoteRender);
	put('showSoftWordMutedWord', s.showSoftWordMutedWord);
	put('confirmOnReact', s.confirmOnReact);
	put('defaultFollowWithReplies', s.defaultWithReplies);
	put('sound.masterVolume', s.sound_masterVolume);
	put('sound.notUseSound', s.sound_notUseSound);
	put('sound.useSoundOnlyWhenActive', s.sound_useSoundOnlyWhenActive);
	put('sound.on.note', s.sound_note as PrefValue<'sound.on.note'> | undefined);
	put('sound.on.noteMy', s.sound_noteMy as PrefValue<'sound.on.noteMy'> | undefined);
	put('sound.on.notification', s.sound_notification as PrefValue<'sound.on.notification'> | undefined);
	put('sound.on.reaction', s.sound_reaction as PrefValue<'sound.on.reaction'> | undefined);
	put('defaultNoteVisibility', s.defaultNoteVisibility);
	put('defaultNoteLocalOnly', s.defaultNoteLocalOnly);

	//#region Sharkey legacy state
	put('autoloadConversation', s.autoloadConversation);
	put('clickToOpen', s.clickToOpen);
	put('collapseFiles', s.collapseFiles);
	put('collapseNotesRepliedTo', s.collapseNotesRepliedTo);
	put('disableCatSpeak', s.disableCatSpeak);
	put('enableFaviconNotificationDot', s.enableFaviconNotificationDot);
	put('expandLongNote', s.expandLongNote);
	if (s.followingFeed != null) {
		// The legacy value is a Partial; fill the gaps so the pref always holds a complete state.
		put('followingFeed', { ...defaultFollowingFeedState, ...s.followingFeed });
	}
	put('like', s.like);
	// Sharkey called its own note design 'sharkey'; this port calls it 'sk'.
	if (s.noteDesign != null) put('noteDesign', s.noteDesign === 'sharkey' ? 'sk' : 'misskey');
	put('notificationClickable', s.notificationClickable);
	put('numberOfReplies', s.numberOfReplies);
	put('oneko', s.oneko);
	put('searchEngine', s.searchEngine);
	put('showTickerOnReplies', s.showTickerOnReplies);
	put('showVisibilitySelectorOnBoost', s.showVisibilitySelectorOnBoost);
	put('trustedDomains', s.trustedDomains);
	put('uncollapseCW', s.uncollapseCW);
	put('visibilityOnBoost', s.visibilityOnBoost);
	put('warnExternalUrl', s.warnExternalUrl);
	put('warnMissingAltText', s.warnMissingAltText);
	//#endregion

	return out;
}
