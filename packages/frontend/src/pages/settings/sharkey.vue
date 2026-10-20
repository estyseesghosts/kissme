<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div class="_gaps_m">
	<MkInfo>{{ i18n.ts._skSettings.description }}</MkInfo>

	<FormSection>
		<template #label>{{ i18n.ts._skSettings.sectionNotes }}</template>
		<div class="_gaps_m">
			<MkRadios
				v-model="noteDesign"
				:options="[
					{ value: 'misskey', label: i18n.ts._skSettings.noteDesignMisskey },
					{ value: 'sk', label: i18n.ts._skSettings.noteDesignSharkey },
				]"
			>
				<template #label>{{ i18n.ts._skSettings.noteDesign }}</template>
			</MkRadios>
			<MkPreferenceContainer k="expandLongNote"><MkSwitch v-model="expandLongNote">{{ i18n.ts.expandLongNote }}</MkSwitch></MkPreferenceContainer>
			<MkPreferenceContainer k="clickToOpen"><MkSwitch v-model="clickToOpen">{{ i18n.ts.clickToOpen }}</MkSwitch></MkPreferenceContainer>
			<MkPreferenceContainer k="collapseNotesRepliedTo"><MkSwitch v-model="collapseNotesRepliedTo">{{ i18n.ts.collapseNotesRepliedTo }}</MkSwitch></MkPreferenceContainer>
			<MkPreferenceContainer k="collapseFiles"><MkSwitch v-model="collapseFiles">{{ i18n.ts.collapseFiles }}</MkSwitch></MkPreferenceContainer>
			<MkPreferenceContainer k="uncollapseCW"><MkSwitch v-model="uncollapseCW">{{ i18n.ts.uncollapseCW }}</MkSwitch></MkPreferenceContainer>
			<MkPreferenceContainer k="disableCatSpeak"><MkSwitch v-model="disableCatSpeak">{{ i18n.ts.disableCatSpeak }}</MkSwitch></MkPreferenceContainer>
			<MkPreferenceContainer k="showTranslationButtonInNoteFooter"><MkSwitch v-model="showTranslationButtonInNoteFooter">{{ i18n.ts.showTranslationButtonInNoteFooter }}</MkSwitch></MkPreferenceContainer>
			<MkPreferenceContainer k="autoloadConversation"><MkSwitch v-model="autoloadConversation">{{ i18n.ts.autoloadConversation }}</MkSwitch></MkPreferenceContainer>
			<MkPreferenceContainer k="showTickerOnReplies"><MkSwitch v-model="showTickerOnReplies">{{ i18n.ts.showTickerOnReplies }}</MkSwitch></MkPreferenceContainer>
			<MkPreferenceContainer k="showVisibilitySelectorOnBoost"><MkSwitch v-model="showVisibilitySelectorOnBoost">{{ i18n.ts.showVisibilitySelectorOnBoost }}</MkSwitch></MkPreferenceContainer>
			<MkPreferenceContainer k="visibilityOnBoost">
				<MkRadios
					v-model="visibilityOnBoost"
					:options="[
						{ value: 'public', label: i18n.ts._visibility.public },
						{ value: 'home', label: i18n.ts._visibility.home },
						{ value: 'followers', label: i18n.ts._visibility.followers },
					]"
				>
					<template #label>{{ i18n.ts.visibilityOnBoost }}</template>
				</MkRadios>
			</MkPreferenceContainer>
			<MkPreferenceContainer k="numberOfReplies">
				<MkInput v-model="numberOfReplies" type="number" :min="0" :max="50">
					<template #label>{{ i18n.ts.numberOfReplies }}</template>
				</MkInput>
			</MkPreferenceContainer>
			<MkPreferenceContainer k="like">
				<MkInput v-model="like">
					<template #label>{{ i18n.ts._skSettings.like }}</template>
					<template #caption>{{ i18n.ts._skSettings.likeDescription }}</template>
				</MkInput>
			</MkPreferenceContainer>
			<MkPreferenceContainer k="mutedEmojis">
				<MkTextarea v-model="mutedEmojisText" :spellcheck="false" @update:modelValue="commitMutedEmojis">
					<template #label>{{ i18n.ts._skSettings.mutedEmojis }}</template>
					<template #caption>{{ i18n.ts._skSettings.mutedEmojisDescription }}</template>
				</MkTextarea>
			</MkPreferenceContainer>
				</div>
		</FormSection>

		<FormSection>
			<template #label>{{ i18n.ts._skSettings.sectionTimeline }}</template>
		<div class="_gaps_m">
			<MkPreferenceContainer k="showGapBetweenNotesInTimeline"><MkSwitch v-model="showGapBetweenNotesInTimeline">{{ i18n.ts._skSettings.showGapBetweenNotesInTimeline }}</MkSwitch></MkPreferenceContainer>
			<MkPreferenceContainer k="disableStreamingTimeline"><MkSwitch v-model="disableStreamingTimeline">{{ i18n.ts._skSettings.disableStreamingTimeline }}</MkSwitch></MkPreferenceContainer>
				</div>
		</FormSection>

		<FormSection>
			<template #label>{{ i18n.ts._skSettings.sectionComposing }}</template>
		<div class="_gaps_m">
			<MkPreferenceContainer k="useSharkeyPostForm"><MkSwitch v-model="useSharkeyPostForm">{{ i18n.ts._skSettings.useSharkeyPostForm }}</MkSwitch></MkPreferenceContainer>
			<MkPreferenceContainer k="useSharkeyEmojiPicker"><MkSwitch v-model="useSharkeyEmojiPicker">{{ i18n.ts._skSettings.useSharkeyEmojiPicker }}</MkSwitch></MkPreferenceContainer>
			<MkPreferenceContainer k="useSharkeyUploader"><MkSwitch v-model="useSharkeyUploader">{{ i18n.ts._skSettings.useSharkeyUploader }}</MkSwitch></MkPreferenceContainer>
			<MkPreferenceContainer k="searchEngine">
				<MkSelect v-model="searchEngine" :items="searchEngineItems">
					<template #label>{{ i18n.ts.searchEngine }}</template>
				</MkSelect>
				<MkInput v-if="useCustomSearchEngine" v-model="searchEngine" :manualSave="true">
					<template #label>{{ i18n.ts.searchEngineCusomURI }}</template>
					<template #caption>{{ i18n.ts.searchEngineCustomURIDescription }}</template>
				</MkInput>
			</MkPreferenceContainer>
			<MkPreferenceContainer k="warnMissingAltText"><MkSwitch v-model="warnMissingAltText">{{ i18n.ts.warnForMissingAltText }}</MkSwitch></MkPreferenceContainer>
				</div>
		</FormSection>

		<FormSection>
			<template #label>{{ i18n.ts._skSettings.sectionNavigation }}</template>
		<div class="_gaps_m">
			<MkPreferenceContainer k="showFollowingFeedNav"><MkSwitch v-model="showFollowingFeedNav">{{ i18n.ts._skSettings.showFollowingFeedNav }}</MkSwitch></MkPreferenceContainer>
			<MkPreferenceContainer k="showWordMuteTester"><MkSwitch v-model="showWordMuteTester">{{ i18n.ts._skSettings.showWordMuteTester }}</MkSwitch></MkPreferenceContainer>
			<MkPreferenceContainer k="showAttributionDomains"><MkSwitch v-model="showAttributionDomains">{{ i18n.ts._skSettings.showAttributionDomains }}</MkSwitch></MkPreferenceContainer>
			<MkPreferenceContainer k="oneko"><MkSwitch v-model="oneko">{{ i18n.ts.oneko }}</MkSwitch></MkPreferenceContainer>
			<MkPreferenceContainer k="welcomeEntranceStyle">
				<MkRadios
					v-model="welcomeEntranceStyle"
					:options="[
						{ value: 'server', label: i18n.ts._skSettings.welcomeEntranceStyleServer },
						{ value: 'a', label: i18n.ts._skSettings.welcomeEntranceStyleA },
					]"
				>
					<template #label>{{ i18n.ts._skSettings.welcomeEntranceStyle }}</template>
				</MkRadios>
			</MkPreferenceContainer>
				</div>
		</FormSection>

		<FormSection>
			<template #label>{{ i18n.ts._skSettings.sectionSafety }}</template>
		<div class="_gaps_m">
			<MkPreferenceContainer k="warnExternalUrl"><MkSwitch v-model="warnExternalUrl">{{ i18n.ts.warnExternalUrl }}</MkSwitch></MkPreferenceContainer>
			<MkTextarea v-model="trustedDomainsText" :spellcheck="false" @update:modelValue="commitTrustedDomains">
				<template #label>{{ i18n.ts._skSettings.trustedDomains }}</template>
				<template #caption>{{ i18n.ts._skSettings.trustedDomainsDescription }}</template>
			</MkTextarea>
				</div>
		</FormSection>

		<FormSection>
			<template #label>{{ i18n.ts._skSettings.sectionNotifications }}</template>
		<div class="_gaps_m">
			<MkPreferenceContainer k="enableFaviconNotificationDot"><MkSwitch v-model="enableFaviconNotificationDot">{{ i18n.ts.enableFaviconNotificationDot }}</MkSwitch></MkPreferenceContainer>
			<MkPreferenceContainer k="notificationClickable"><MkSwitch v-model="notificationClickable">{{ i18n.ts.allowClickingNotifications }}</MkSwitch></MkPreferenceContainer>
				</div>
		</FormSection>
	</div>
	</template>

	<script lang="ts" setup>
	import { computed, ref } from 'vue';
	import FormSection from '@/components/form/section.vue';
	import MkInfo from '@/components/MkInfo.vue';
	import MkInput from '@/components/MkInput.vue';
	import MkPreferenceContainer from '@/components/MkPreferenceContainer.vue';
	import MkRadios from '@/components/MkRadios.vue';
	import MkSelect from '@/components/MkSelect.vue';
	import MkSwitch from '@/components/MkSwitch.vue';
	import MkTextarea from '@/components/MkTextarea.vue';
	import { i18n } from '@/i18n.js';
	import { definePage } from '@/page.js';
	import { prefer } from '@/preferences.js';
	import { parseSkPrefLines } from '@/utility/sk-pref-lines.js';
	import { searchEngineMap } from '@/utility/search-engine-map.js';

	const noteDesign = prefer.model('noteDesign');
	const expandLongNote = prefer.model('expandLongNote');
	const clickToOpen = prefer.model('clickToOpen');
	const collapseNotesRepliedTo = prefer.model('collapseNotesRepliedTo');
	const collapseFiles = prefer.model('collapseFiles');
	const uncollapseCW = prefer.model('uncollapseCW');
	const disableCatSpeak = prefer.model('disableCatSpeak');
	const showTranslationButtonInNoteFooter = prefer.model('showTranslationButtonInNoteFooter');
	const autoloadConversation = prefer.model('autoloadConversation');
	const showTickerOnReplies = prefer.model('showTickerOnReplies');
	const showVisibilitySelectorOnBoost = prefer.model('showVisibilitySelectorOnBoost');
	const visibilityOnBoost = prefer.model('visibilityOnBoost');
	const numberOfReplies = prefer.model('numberOfReplies');
	// The pref is `string | null`; the input works on a string.
	const like = prefer.model('like', v => v ?? '', v => (v.trim() === '' ? null : v.trim()));
	const showGapBetweenNotesInTimeline = prefer.model('showGapBetweenNotesInTimeline');
	const disableStreamingTimeline = prefer.model('disableStreamingTimeline');
	const useSharkeyPostForm = prefer.model('useSharkeyPostForm');
	const useSharkeyEmojiPicker = prefer.model('useSharkeyEmojiPicker');
	const useSharkeyUploader = prefer.model('useSharkeyUploader');
	const searchEngine = prefer.model('searchEngine');
	const useCustomSearchEngine = computed(() => !Object.keys(searchEngineMap).includes(searchEngine.value));
	const searchEngineItems = computed(() => [
		...Object.entries(searchEngineMap).map(([value, label]) => ({ label, value })),
		...(useCustomSearchEngine.value
			? [{ label: i18n.ts.searchEngineOther, value: searchEngine.value }]
			: [{ label: i18n.ts.searchEngineOther, value: '' }]),
	]);
	const warnMissingAltText = prefer.model('warnMissingAltText');
	const showFollowingFeedNav = prefer.model('showFollowingFeedNav');
	const showWordMuteTester = prefer.model('showWordMuteTester');
	const showAttributionDomains = prefer.model('showAttributionDomains');
	const oneko = prefer.model('oneko');
	const welcomeEntranceStyle = prefer.model('welcomeEntranceStyle');
	const warnExternalUrl = prefer.model('warnExternalUrl');
	const enableFaviconNotificationDot = prefer.model('enableFaviconNotificationDot');
	const notificationClickable = prefer.model('notificationClickable');

	// List prefs keep their own text so that typing a newline is not normalized away mid-edit.
	const mutedEmojisText = ref(prefer.s.mutedEmojis.join('\n'));

	function commitMutedEmojis(text: string) {
		prefer.commit('mutedEmojis', parseSkPrefLines(text));
	}

	const trustedDomainsText = ref(prefer.s.trustedDomains.join('\n'));

	function commitTrustedDomains(text: string) {
		prefer.commit('trustedDomains', parseSkPrefLines(text));
	}

	const headerActions = computed(() => []);
	const headerTabs = computed(() => []);

	definePage(() => ({
		title: i18n.ts._skSettings.title,
		icon: 'ti ti-fish',
	}));
	</script>
