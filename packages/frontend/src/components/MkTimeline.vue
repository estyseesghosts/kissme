<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<component :is="prefer.s.enablePullToRefresh ? MkPullToRefresh : 'div'" :refresher="() => reloadTimeline()">
	<SkPagination v-if="paginationQuery" ref="pagingComponent" :pagination="paginationQuery" @queue="emit('queue', $event)">
		<template #empty><MkResult type="empty" :text="i18n.ts.noNotes"/></template>

		<template #default="{ items: notes }">
			<SkTransitionGroup
				:class="[$style.root, { [$style.noGap]: noGap, '_gaps': !noGap, [$style.reverse]: paginationQuery.reversed }]"
				:enterActiveClass="$style.transition_x_enterActive"
				:leaveActiveClass="$style.transition_x_leaveActive"
				:enterFromClass="$style.transition_x_enterFrom"
				:leaveToClass="$style.transition_x_leaveTo"
				:moveClass="$style.transition_x_move"
				tag="div"
			>
				<div v-for="(note, i) in notes" :key="note.id" :class="{ '_gaps': !noGap }">
					<DynamicNote :class="$style.note" :note="note as Misskey.entities.Note" :withHardMute="true" :data-scroll-anchor="note.id"/>
					<MkAd v-if="note._shouldInsertAd_" :preferForms="['horizontal', 'horizontal-big']" :class="$style.ad"/>
				</div>
			</SkTransitionGroup>
		</template>
	</SkPagination>
</component>
</template>

<script lang="ts" setup>
import { computed, watch, onUnmounted, provide, shallowRef, useTemplateRef } from 'vue';
import * as Misskey from 'misskey-js';
import type { Paging } from '@/components/SkPagination.vue';
import type { SkTimelineSrc } from '@/utility/sk-timeline-query.js';
import MkPullToRefresh from '@/components/MkPullToRefresh.vue';
import { useStream } from '@/stream.js';
import * as sound from '@/utility/sound.js';
import { $i } from '@/i.js';
import { instance } from '@/instance.js';
import { prefer } from '@/preferences.js';
import DynamicNote from '@/components/DynamicNote.vue';
import SkPagination from '@/components/SkPagination.vue';
import { i18n } from '@/i18n.js';
import SkTransitionGroup from '@/components/SkTransitionGroup.vue';
import { buildTimelineChannel, buildTimelineQuery } from '@/utility/sk-timeline-query.js';

const props = withDefaults(defineProps<{
	src: SkTimelineSrc;
	list?: string;
	antenna?: string;
	channel?: string;
	role?: string;
	sound?: boolean;
	withRenotes?: boolean;
	withReplies?: boolean;
	withBots?: boolean;
	withSensitive?: boolean;
	onlyFiles?: boolean;
}>(), {
	withRenotes: true,
	withReplies: false,
	withSensitive: true,
	onlyFiles: false,
	withBots: true,
});

const emit = defineEmits<{
	(ev: 'note'): void;
	(ev: 'queue', count: number): void;
}>();

provide('inTimeline', true);
provide('tl_withSensitive', computed(() => props.withSensitive));
provide('inChannel', computed(() => props.src === 'channel'));

const pagingComponent = useTemplateRef('pagingComponent');

let tlNotesCount = 0;

function prepend(note: Misskey.entities.Note) {
	if (pagingComponent.value == null) return;

	tlNotesCount++;

	if (instance.notesPerOneAd > 0 && tlNotesCount % instance.notesPerOneAd === 0) {
		(note as Misskey.entities.Note & { _shouldInsertAd_?: boolean })._shouldInsertAd_ = true;
	}

	pagingComponent.value.prepend(note);

	emit('note');

	if (props.sound) {
		sound.playMisskeySfx($i && (note.userId === $i.id) ? 'noteMy' : 'note');
	}
}

let connection: Misskey.IChannelConnection<Misskey.Channels['main']> | null = null;
let connection2: Misskey.IChannelConnection<Misskey.Channels['main']> | null = null;
const paginationQuery = shallowRef<Paging | null>(null);
const noGap = !prefer.s.showGapBetweenNotesInTimeline;

const stream = useStream();

function connectChannel() {
	const spec = buildTimelineChannel(props.src, props);
	if (spec == null) return;

	// 'bubbleTimeline' is absent from misskey-js' channel typings, so the name is cast.
	connection = stream.useChannel(spec.channel as 'main', spec.params as never) as unknown as Misskey.IChannelConnection<Misskey.Channels['main']>;
	if (spec.extraMain) connection2 = stream.useChannel('main');

	if (spec.mentionEvent === 'mention') {
		connection.on('mention' as never, prepend as never);
	} else if (spec.mentionEvent === 'directs') {
		connection.on('mention' as never, ((note: Misskey.entities.Note) => {
			if (note.visibility === 'specified') prepend(note);
		}) as never);
	} else {
		connection.on('note' as never, prepend as never);
	}
}

function disconnectChannel() {
	if (connection) connection.dispose();
	if (connection2) connection2.dispose();
	connection = null;
	connection2 = null;
}

function updatePaginationQuery() {
	const q = buildTimelineQuery(props.src, props);

	paginationQuery.value = q ? {
		endpoint: q.endpoint as keyof Misskey.Endpoints,
		limit: 10,
		params: q.params as never,
	} : null;
}

function refreshEndpointAndChannel() {
	if (!prefer.s.disableStreamingTimeline) {
		disconnectChannel();
		connectChannel();
	}

	updatePaginationQuery();
}

// デッキのリストカラムでwithRenotesを変更した場合に自動的に更新されるようにさせる
// IDが切り替わったら切り替え先のTLを表示させたい
watch(() => [props.list, props.antenna, props.channel, props.role, props.withRenotes], refreshEndpointAndChannel);

// withSensitiveはクライアントで完結する処理のため、単にリロードするだけでOK
watch(() => props.withSensitive, reloadTimeline);

// 初回表示用
refreshEndpointAndChannel();

onUnmounted(() => {
	disconnectChannel();
});

function reloadTimeline() {
	return new Promise<void>((res) => {
		if (pagingComponent.value == null) return;

		tlNotesCount = 0;

		pagingComponent.value.reload().then(() => {
			res();
		});
	});
}

defineExpose({
	reloadTimeline,
});
</script>

<style lang="scss" module>
.transition_x_move {
	transition: transform 0.7s cubic-bezier(0.23, 1, 0.32, 1);
}

.transition_x_enterActive {
	transition: transform 0.7s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.7s cubic-bezier(0.23, 1, 0.32, 1);

	&.note,
	.note {
		/* Skip Note Rendering有効時、TransitionGroupでnoteを追加するときに一瞬がくっとなる問題を抑制する */
		content-visibility: visible !important;
	}
}

.transition_x_leaveActive {
	transition: height 0.2s cubic-bezier(0,.5,.5,1), opacity 0.2s cubic-bezier(0,.5,.5,1);
}

.transition_x_enterFrom {
	opacity: 0;
	transform: translateY(max(-64px, -100%));
}

@supports (interpolate-size: allow-keywords) {
	.transition_x_leaveTo {
		interpolate-size: allow-keywords; // heightのtransitionを動作させるために必要
		height: 0;
	}
}

.transition_x_leaveTo {
	opacity: 0;
}

.reverse {
	display: flex;
	flex-direction: column-reverse;
}

.root {
	container-type: inline-size;

	&.noGap {
		background: var(--MI_THEME-panel);

		.note:not(:empty) {
			border-bottom: solid 0.5px var(--MI_THEME-divider);
		}

		.ad {
			padding: 8px;
			background-size: auto auto;
			background-image: repeating-linear-gradient(45deg, transparent, transparent 8px, var(--MI_THEME-bg) 8px, var(--MI_THEME-bg) 14px);
			border-bottom: solid 0.5px var(--MI_THEME-divider);
		}
	}

	&:not(.noGap) {
		background: var(--MI_THEME-bg);

		.note {
			background: var(--MI_THEME-panel);
			border-radius: var(--MI-radius);
		}
	}
}

.ad:empty {
	display: none;
}
</style>
