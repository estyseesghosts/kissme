<!--
SPDX-FileCopyrightText: hazelnoot and other Sharkey contributors
SPDX-License-Identifier: AGPL-3.0-only

Allows a user to write text to test their word mutes against, displaying matched words.
-->

<template>
<MkFolder>
	<template #label>{{ i18n.ts.wordMuteTestLabel }}</template>

	<div class="_gaps">
		<MkTextarea v-model="testText">
			<template #caption>{{ i18n.ts.wordMuteTestDescription }}</template>
		</MkTextarea>
		<div><MkButton :disabled="!testText" @click="runTest()">{{ i18n.ts.wordMuteTestTest }}</MkButton></div>
		<template v-if="result == null">
			<div>{{ i18n.ts.wordMuteTestNoResults }}</div>
		</template>
		<template v-else>
			<MkInfo v-if="result.invalidLines.length > 0" warn>{{ i18n.ts.wordMuteTestInvalid }} ({{ result.invalidLines.join(', ') }})</MkInfo>
			<div v-if="result.matches.length === 0">{{ i18n.ts.wordMuteTestNoMatch }}</div>
			<div v-else>{{ i18n.ts.wordMuteTestMatch }}: {{ result.matches.join(', ') }}</div>
		</template>
	</div>
</MkFolder>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import MkFolder from '@/components/MkFolder.vue';
import MkButton from '@/components/MkButton.vue';
import MkTextarea from '@/components/MkTextarea.vue';
import MkInfo from '@/components/MkInfo.vue';
import { testMutePatterns } from '@/utility/sk-parse-mutes.js';
import type { PatternTestResult } from '@/utility/sk-parse-mutes.js';
import { i18n } from '@/i18n.js';

const props = defineProps<{
	/** The word-mute set as shown in the settings textarea (one mute per line). */
	mutedWords: string;
}>();

const testText = ref('');
const result = ref<PatternTestResult | null>(null);

function runTest() {
	result.value = testText.value ? testMutePatterns(props.mutedWords, testText.value) : null;
}
</script>
