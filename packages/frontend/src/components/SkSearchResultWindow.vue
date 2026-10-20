<!--
SPDX-FileCopyrightText: marie and other Sharkey contributors
SPDX-License-Identifier: AGPL-3.0-only

Displays a list of notes as results of a search.
-->

<template>
<MkWindow :initialWidth="600" :initialHeight="450" :canResize="true" @closed="emit('closed')">
	<template #header>
		<i class="ti ti-search" style="margin-right: 0.5em;"></i>
		<span>{{ i18n.ts.searchResult }}</span>
	</template>
	<MkNotesTimeline :key="props.resultKey" :paginator="props.paginator"/>
</MkWindow>
</template>

<script lang="ts" setup>
import { Paginator } from '@/utility/paginator.js';
import MkNotesTimeline from '@/components/MkNotesTimeline.vue';
import MkWindow from '@/components/MkWindow.vue';
import { i18n } from '@/i18n.js';

const props = defineProps<{
	resultKey: string | number;
	paginator: Paginator<'notes/search'>;
}>();

const emit = defineEmits<{
	(ev: 'closed'): void;
}>();
</script>

<style lang="scss" module>
</style>
