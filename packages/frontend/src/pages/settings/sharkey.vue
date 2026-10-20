<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div class="_gaps_m">
	<MkInfo>{{ skStrings.skSettings.description }}</MkInfo>

	<FormSection>
		<template #label>{{ skStrings.skSettings.sectionNotes }}</template>
		<div class="_gaps_m">
			<MkRadios
				v-model="noteDesign"
				:options="[
					{ value: 'misskey', label: skStrings.skSettings.noteDesignMisskey },
					{ value: 'sk', label: skStrings.skSettings.noteDesignSharkey },
				]"
			>
				<template #label>{{ skStrings.skSettings.noteDesign }}</template>
			</MkRadios>
			<MkPreferenceContainer k="expandLongNote"><MkSwitch v-model="expandLongNote">{{ skStrings.skSettings.expandLongNote }}</MkSwitch></MkPreferenceContainer>
			<MkPreferenceContainer k="clickToOpen"><MkSwitch v-model="clickToOpen">{{ skStrings.skSettings.clickToOpen }}</MkSwitch></MkPreferenceContainer>
			<MkPreferenceContainer k="collapseNotesRepliedTo"><MkSwitch v-model="collapseNotesRepliedTo">{{ skStrings.skSettings.collapseNotesRepliedTo }}</MkSwitch></MkPreferenceContainer>
			<MkPreferenceContainer k="uncollapseCW"><MkSwitch v-model="uncollapseCW">{{ skStrings.skSettings.uncollapseCW }}</MkSwitch></MkPreferenceContainer>
			<MkPreferenceContainer k="autoloadConversation"><MkSwitch v-model="autoloadConversation">{{ skStrings.skSettings.autoloadConversation }}</MkSwitch></MkPreferenceContainer>
			<MkPreferenceContainer k="showTickerOnReplies"><MkSwitch v-model="showTickerOnReplies">{{ skStrings.skSettings.showTickerOnReplies }}</MkSwitch></MkPreferenceContainer>
			<MkPreferenceContainer k="showVisibilitySelectorOnBoost"><MkSwitch v-model="showVisibilitySelectorOnBoost">{{ skStrings.skSettings.showVisibilitySelectorOnBoost }}</MkSwitch></MkPreferenceContainer>
			<MkPreferenceContainer k="visibilityOnBoost">
				<MkRadios
					v-model="visibilityOnBoost"
					:options="[
						{ value: 'public', label: i18n.ts._visibility.public },
						{ value: 'home', label: i18n.ts._visibility.home },
						{ value: 'followers', label: i18n.ts._visibility.followers },
					]"
				>
					<template #label>{{ skStrings.skSettings.visibilityOnBoost }}</template>
				</MkRadios>
			</MkPreferenceContainer>
			<MkPreferenceContainer k="numberOfReplies">
				<MkInput v-model="numberOfReplies" type="number" :min="0" :max="50">
					<template #label>{{ skStrings.skSettings.numberOfReplies }}</template>
				</MkInput>
			</MkPreferenceContainer>
			<MkPreferenceContainer k="like">
				<MkInput v-model="like">
					<template #label>{{ skStrings.skSettings.like }}</template>
					<template #caption>{{ skStrings.skSettings.likeDescription }}</template>
				</MkInput>
			</MkPreferenceContainer>
			<MkPreferenceContainer k="mutedEmojis">
				<MkTextarea v-model="mutedEmojisText" :spellcheck="false" @update:modelValue="commitMutedEmojis">
					<template #label>{{ skStrings.skSettings.mutedEmojis }}</template>
					<template #caption>{{ skStrings.skSettings.mutedEmojisDescription }}</template>
				</MkTextarea>
			</MkPreferenceContainer>
				</div>
		</FormSection>

		<FormSection>
			<template #label>{{ skStrings.skSettings.sectionTimeline }}</template>
		<div class="_gaps_m">
			<MkPreferenceContainer k="showGapBetweenNotesInTimeline"><MkSwitch v-model="showGapBetweenNotesInTimeline">{{ skStrings.skSettings.showGapBetweenNotesInTimeline }}</MkSwitch></MkPreferenceContainer>
			<MkPreferenceContainer k="disableStreamingTimeline"><MkSwitch v-model="disableStreamingTimeline">{{ skStrings.skSettings.disableStreamingTimeline }}</MkSwitch></MkPreferenceContainer>
				</div>
		</FormSection>

		<FormSection>
			<template #label>{{ skStrings.skSettings.sectionComposing }}</template>
		<div class="_gaps_m">
			<MkPreferenceContainer k="useSharkeyPostForm"><MkSwitch v-model="useSharkeyPostForm">{{ skStrings.skSettings.useSharkeyPostForm }}</MkSwitch></MkPreferenceContainer>
			<MkPreferenceContainer k="useSharkeyEmojiPicker"><MkSwitch v-model="useSharkeyEmojiPicker">{{ skStrings.skSettings.useSharkeyEmojiPicker }}</MkSwitch></MkPreferenceContainer>
			<MkPreferenceContainer k="useSharkeyUploader"><MkSwitch v-model="useSharkeyUploader">{{ skStrings.skSettings.useSharkeyUploader }}</MkSwitch></MkPreferenceContainer>
				</div>
		</FormSection>

		<FormSection>
			<template #label>{{ skStrings.skSettings.sectionNavigation }}</template>
		<div class="_gaps_m">
			<MkPreferenceContainer k="showFollowingFeedNav"><MkSwitch v-model="showFollowingFeedNav">{{ skStrings.skSettings.showFollowingFeedNav }}</MkSwitch></MkPreferenceContainer>
			<MkPreferenceContainer k="showWordMuteTester"><MkSwitch v-model="showWordMuteTester">{{ skStrings.skSettings.showWordMuteTester }}</MkSwitch></MkPreferenceContainer>
			<MkPreferenceContainer k="showAttributionDomains"><MkSwitch v-model="showAttributionDomains">{{ skStrings.skSettings.showAttributionDomains }}</MkSwitch></MkPreferenceContainer>
			<MkPreferenceContainer k="oneko"><MkSwitch v-model="oneko">{{ skStrings.skSettings.oneko }}</MkSwitch></MkPreferenceContainer>
			<MkPreferenceContainer k="welcomeEntranceStyle">
				<MkRadios
					v-model="welcomeEntranceStyle"
					:options="[
						{ value: 'server', label: skStrings.welcomeEntranceStyleServer },
						{ value: 'a', label: skStrings.welcomeEntranceStyleA },
					]"
				>
					<template #label>{{ skStrings.welcomeEntranceStyle }}</template>
				</MkRadios>
			</MkPreferenceContainer>
				</div>
		</FormSection>

		<FormSection>
			<template #label>{{ skStrings.skSettings.sectionSafety }}</template>
		<div class="_gaps_m">
			<MkPreferenceContainer k="warnExternalUrl"><MkSwitch v-model="warnExternalUrl">{{ skStrings.skSettings.warnExternalUrl }}</MkSwitch></MkPreferenceContainer>
			<MkTextarea v-model="trustedDomainsText" :spellcheck="false" @update:modelValue="commitTrustedDomains">
				<template #label>{{ skStrings.skSettings.trustedDomains }}</template>
				<template #caption>{{ skStrings.skSettings.trustedDomainsDescription }}</template>
			</MkTextarea>
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
	import MkSwitch from '@/components/MkSwitch.vue';
	import MkTextarea from '@/components/MkTextarea.vue';
	import { i18n } from '@/i18n.js';
	import { definePage } from '@/page.js';
	import { prefer } from '@/preferences.js';
	import { skStrings } from '@/utility/sk-strings.js';
	import { parseSkPrefLines } from '@/utility/sk-pref-lines.js';

	const noteDesign = prefer.model('noteDesign');
	const expandLongNote = prefer.model('expandLongNote');
	const clickToOpen = prefer.model('clickToOpen');
	const collapseNotesRepliedTo = prefer.model('collapseNotesRepliedTo');
	const uncollapseCW = prefer.model('uncollapseCW');
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
	const showFollowingFeedNav = prefer.model('showFollowingFeedNav');
	const showWordMuteTester = prefer.model('showWordMuteTester');
	const showAttributionDomains = prefer.model('showAttributionDomains');
	const oneko = prefer.model('oneko');
	const welcomeEntranceStyle = prefer.model('welcomeEntranceStyle');
	const warnExternalUrl = prefer.model('warnExternalUrl');

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
		title: skStrings.skSettings.title,
		icon: 'ti ti-fish',
	}));
	</script>
