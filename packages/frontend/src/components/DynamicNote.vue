<!--
SPDX-FileCopyrightText: hazelnoot and other Sharkey contributors
SPDX-License-Identifier: AGPL-3.0-only

Displays a note with either Misskey or Sharkey style, based on user preference.
Slice 1.1: only the Misskey design is wired. The 'sk' branch (SkNote.vue) and mute overrides land in slice 1.2.
-->

<template>
<XNote
	ref="rootEl"
	:note="note"
	:pinned="pinned"
	:mock="mock"
	:withHardMute="withHardMute"
	@reaction="emoji => emit('reaction', emoji)"
	@removeReaction="emoji => emit('removeReaction', emoji)"
/>
</template>

<script setup lang="ts">
import * as Misskey from 'misskey-js';
import { defineAsyncComponent, useTemplateRef } from 'vue';
import type { ComponentExposed } from 'vue-component-type-helpers';
import type MkNote from '@/components/MkNote.vue';

// 1.1: only the stock design exists. Both branches of noteDesign resolve here until SkNote.vue lands (1.2).
const XNote = defineAsyncComponent(() => import('@/components/MkNote.vue'));

const rootEl = useTemplateRef<ComponentExposed<typeof MkNote>>('rootEl');

defineExpose({ rootEl });

defineProps<{
	note: Misskey.entities.Note;
	pinned?: boolean;
	mock?: boolean;
	withHardMute?: boolean;
}>();

const emit = defineEmits<{
	(ev: 'reaction', emoji: string): void;
	(ev: 'removeReaction', emoji: string): void;
}>();
</script>
