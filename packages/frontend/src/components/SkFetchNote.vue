<!--
SPDX-FileCopyrightText: hazelnoot and other Sharkey contributors
SPDX-License-Identifier: AGPL-3.0-only

Fetches and displays a note from a note ID.
-->

<template>
<component :is="lazy ? MkLazy : 'div'">
	<div :ref="markShown">
		<MkLoading v-if="state === 'loading'"/>

		<div v-if="state === 'error'">{{ i18n.ts.cannotLoadNote }}</div>

		<DynamicNote v-if="state === 'done' && note" :note="note"/>
	</div>
</component>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import * as Misskey from 'misskey-js';
import MkLazy from '@/components/global/MkLazy.vue';
import { misskeyApi } from '@/utility/misskey-api.js';
import DynamicNote from '@/components/DynamicNote.vue';
import { i18n } from '@/i18n.js';

const props = withDefaults(defineProps<{
	noteId: string,
	lazy?: boolean,
}>(), {
	lazy: true,
});

// Lazy-load, unless props.lazy is false.
// eslint-disable-next-line vue/no-setup-props-reactivity-loss
const showing = ref(!props.lazy);
const state = ref<'loading' | 'error' | 'done'>('loading');
const note = ref<Misskey.entities.Note | null>(null);

// MkLazy only renders its slot once it is on screen, so the first slot element to mount marks the note as visible.
// This replaces the donor's `@show` event, which MkLazy does not emit.
const markShown = () => {
	showing.value = true;
};

watch(
	[
		() => props.noteId,
		() => showing.value,
	],
	async ([noteId, show]) => {
		// Wait until the note is visible to avoid bombarding the API with requests.
		if (!show) return;

		// Unload the old note
		note.value = null;
		state.value = 'loading';

		// Fetch the new note
		const newNote = await misskeyApi('notes/show', { noteId }).catch(() => null);

		// Check for race conditions (ex. the note changed again while the first request was still running)
		if (noteId !== props.noteId) return;

		// Check for errors
		if (!newNote) {
			state.value = 'error';
			return;
		}

		// Display the new note
		note.value = newNote;
		state.value = 'done';
	},
	{
		immediate: true,
	},
);
</script>
