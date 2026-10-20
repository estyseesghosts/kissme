<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<SkTransitionGroup
	:enterActiveClass="$style.transition_x_enterActive"
	:leaveActiveClass="$style.transition_x_leaveActive"
	:enterFromClass="$style.transition_x_enterFrom"
	:leaveToClass="$style.transition_x_leaveTo"
	:moveClass="$style.transition_x_move"
	tag="div" :class="$style.root"
>
	<XReaction v-for="[reaction, count] in shown" :key="reaction" :reaction="reaction" :count="count" :isInitial="initialReactions.has(reaction)" :note="note" :muted="mutedEmojis" @reactionToggled="onMockToggleReaction" @toggleEmojiMute="onToggleEmojiMute"/>
	<button v-if="hiddenReactions.length > 0" key="$muted" class="_button" :class="$style.mutedToggle" @click.stop="showMuted = !showMuted">
		<i :class="showMuted ? 'ti ti-eye-off' : 'ti ti-eye'"></i> {{ hiddenReactions.length }} ({{ showMuted ? i18n.ts.hide : i18n.ts.show }})
	</button>
	<div v-if="hasMoreReactions" :key="'$more'" :class="$style.moreReactions">
		<slot name="more"></slot>
	</div>
</SkTransitionGroup>
</template>

<script lang="ts" setup>
import * as Misskey from 'misskey-js';
import { computed, inject, watch, ref } from 'vue';
import XReaction from '@/components/SkReactionsViewer.reaction.vue';
import { i18n } from '@/i18n.js';
import { partitionMutedReactions } from '@/utility/sk-reaction-rules.js';
import { prefer } from '@/preferences.js';
import { DI } from '@/di.js';
import SkTransitionGroup from '@/components/SkTransitionGroup.vue';

const props = withDefaults(defineProps<{
	note: Misskey.entities.Note;
	maxNumber?: number;
	/** Emoji names (or full reaction keys) whose reactions are hidden behind an unmute affordance. */
	mutedEmojis?: readonly string[];
}>(), {
	maxNumber: Infinity,
	mutedEmojis: () => [],
});

const mock = inject(DI.mock, false);

const emit = defineEmits<{
	(ev: 'mockUpdateMyReaction', emoji: string, delta: number): void;
	(ev: 'toggleEmojiMute', reaction: string): void;
}>();

const initialReactions = new Set(Object.keys(props.note.reactions));

const reactions = ref<[string, number][]>([]);
const hasMoreReactions = ref(false);
const showMuted = ref(false);

const partitioned = computed(() => partitionMutedReactions(reactions.value, props.mutedEmojis, props.note.myReaction));
const hiddenReactions = computed(() => partitioned.value.hidden);
const shown = computed(() => showMuted.value ? reactions.value : partitioned.value.visible);

function onToggleEmojiMute(reaction: string) {
	emit('toggleEmojiMute', reaction);
}

function onMockToggleReaction(emoji: string, count: number) {
	if (!mock) return;

	const i = reactions.value.findIndex((item) => item[0] === emoji);
	if (i < 0) return;

	emit('mockUpdateMyReaction', emoji, (count - reactions.value[i][1]));
}

watch([() => props.note.reactions, () => props.maxNumber], ([newSource, maxNumber]) => {
	let newReactions: [string, number][] = [];
	hasMoreReactions.value = Object.keys(newSource).length > maxNumber;

	for (let i = 0; i < reactions.value.length; i++) {
		const reaction = reactions.value[i][0];
		if (reaction in newSource && newSource[reaction] !== 0) {
			reactions.value[i][1] = newSource[reaction];
			newReactions.push(reactions.value[i]);
		}
	}

	const newReactionsNames = newReactions.map(([x]) => x);
	newReactions = [
		...newReactions,
		...Object.entries(newSource)
			.sort(([, a], [, b]) => b - a)
			.filter(([y], i) => i < maxNumber && !newReactionsNames.includes(y)),
	];

	newReactions = newReactions.slice(0, props.maxNumber);

	if (props.note.myReaction && !newReactions.map(([x]) => x).includes(props.note.myReaction)) {
		newReactions.push([props.note.myReaction, newSource[props.note.myReaction]]);
	}

	reactions.value = newReactions;
}, { immediate: true, deep: true });
</script>

<style lang="scss" module>
.transition_x_move,
.transition_x_enterActive,
.transition_x_leaveActive {
	transition: opacity 0.2s cubic-bezier(0,.5,.5,1), transform 0.2s cubic-bezier(0,.5,.5,1) !important;
}
.transition_x_enterFrom,
.transition_x_leaveTo {
	opacity: 0;
	transform: scale(0.7);
}
.transition_x_leaveActive {
	position: absolute;
}

.mutedToggle {
	height: 32px;
	padding: 0 8px;
	border-radius: var(--MI-radius-xs);
	background: var(--MI_THEME-buttonBg);
	font-size: 0.85em;
}

.root, .moreReactions {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 4px;
	cursor: auto; /* not clickToOpen-able */

	&:empty {
		display: none;
	}
}
</style>
