<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div v-if="instance">
	<XSetup v-if="instance.requireSetup"/>
	<XEntranceA v-else-if="entranceStyle === 'a'"/>
	<XEntranceClassic v-else-if="entranceStyle === 'classic'"/>
	<XEntranceSimple v-else/>
</div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import * as Misskey from 'misskey-js';
import { instanceName } from '@@/js/config.js';
import XSetup from './welcome.setup.vue';
import XEntranceClassic from './welcome.entrance.classic.vue';
import XEntranceSimple from './welcome.entrance.simple.vue';
import XEntranceA from './welcome.entrance.a.vue';
import { definePage } from '@/page.js';
import { fetchInstance } from '@/instance.js';
import { prefer } from '@/preferences.js';
import { resolveEntranceStyle } from '@/utility/sk-static-pages.js';

const instance = ref<Misskey.entities.MetaDetailed | null>(null);

fetchInstance(true).then((res) => {
	instance.value = res;
});

// Sharkey entrance variant is opt-in via pref `welcomeEntranceStyle`; 'server' keeps stock behavior.
const entranceStyle = computed(() => resolveEntranceStyle(instance.value?.clientOptions.entrancePageStyle, prefer.r.welcomeEntranceStyle.value));

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePage(() => ({
	title: instanceName,
	icon: null,
}));
</script>
