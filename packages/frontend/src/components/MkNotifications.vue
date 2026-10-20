<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<component :is="prefer.s.enablePullToRefresh ? MkPullToRefresh : 'div'" :refresher="() => reload()">
	<SkPagination ref="pagingComponent" :pagination="pagination">
		<template #empty><MkResult type="empty" :text="i18n.ts.noNotifications"/></template>

		<template #default="{ items: notifications }">
			<SkTransitionGroup
				:class="[$style.notifications]"
				:enterActiveClass="$style.transition_x_enterActive"
				:leaveActiveClass="$style.transition_x_leaveActive"
				:enterFromClass="$style.transition_x_enterFrom"
				:leaveToClass="$style.transition_x_leaveTo"
				:moveClass=" $style.transition_x_move"
				tag="div"
			>
				<div v-for="(notification, i) in sortedByTime(asNotifications(notifications))" :key="notification.id">
					<DynamicNote v-if="['reply', 'quote', 'mention'].includes(notification.type) && 'note' in notification" :class="$style.item" :note="notification.note" :withHardMute="true" :data-scroll-anchor="notification.id"/>
					<XNotification v-else :class="$style.item" :notification="notification" :withTime="true" :full="true" :data-scroll-anchor="notification.id"/>
				</div>
			</SkTransitionGroup>
		</template>
	</SkPagination>
</component>
</template>

<script lang="ts" setup>
import { onUnmounted, onMounted, computed, useTemplateRef } from 'vue';
import * as Misskey from 'misskey-js';
import type { notificationTypes } from 'misskey-js';
import SkPagination from '@/components/SkPagination.vue';
import XNotification from '@/components/MkNotification.vue';
import DynamicNote from '@/components/DynamicNote.vue';
import { useStream } from '@/stream.js';
import { i18n } from '@/i18n.js';
import MkPullToRefresh from '@/components/MkPullToRefresh.vue';
import { prefer } from '@/preferences.js';
import SkTransitionGroup from '@/components/SkTransitionGroup.vue';

const props = defineProps<{
	excludeTypes?: typeof notificationTypes[number][];
}>();

const pagingComponent = useTemplateRef('pagingComponent');

const pagination = computed(() => prefer.r.useGroupedNotifications.value ? {
	endpoint: 'i/notifications-grouped' as const,
	limit: 20,
	params: computed(() => ({
		excludeTypes: props.excludeTypes ?? undefined,
	})),
} : {
	endpoint: 'i/notifications' as const,
	limit: 20,
	params: computed(() => ({
		excludeTypes: props.excludeTypes ?? undefined,
	})),
});

// for pagination reasons, each notification group needs to have the
// id of the oldest notification inside it, but we want to show the
// groups sorted by the time of the *newest* notification; so we re-sort
// them here
function sortedByTime<T extends { createdAt: string }>(notifications: T[]): T[] {
	return notifications.toSorted(
		(a: T, b: T) => {
			if (a.createdAt < b.createdAt) return 1;
			if (a.createdAt > b.createdAt) return -1;
			return 0;
		}
	);
}

type NotificationItem = Misskey.entities.INotificationsGroupedResponse[number];

// SkPagination hands out loosely typed entities; narrow them for the template.
function asNotifications(items: unknown[]): NotificationItem[] {
	return items as NotificationItem[];
}

function onNotification(notification: Misskey.entities.Notification) {
	const isMuted = props.excludeTypes ? props.excludeTypes.includes(notification.type as typeof notificationTypes[number]) : false;
	if (isMuted || window.document.visibilityState === 'visible') {
		useStream().send('readNotification');
	}

	if (!isMuted) {
		pagingComponent.value?.prepend(notification);
	}
}

function reload() {
	return new Promise<void>((res) => {
		pagingComponent.value?.reload().then(() => {
			res();
		});
	});
}

let connection: Misskey.IChannelConnection<Misskey.Channels['main']>;

onMounted(() => {
	connection = useStream().useChannel('main');
	connection.on('notification', onNotification);
	connection.on('notificationFlushed', reload);
});

onUnmounted(() => {
	if (connection) connection.dispose();
});

defineExpose({
	reload,
});
</script>

<style lang="scss" module>
.transition_x_move {
	transition: transform 0.7s cubic-bezier(0.23, 1, 0.32, 1);
}

.transition_x_enterActive {
	transition: transform 0.7s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.7s cubic-bezier(0.23, 1, 0.32, 1);

	&.item,
	.item {
		/* Skip Note Rendering有効時、TransitionGroupで通知を追加するときに一瞬がくっとなる問題を抑制する */
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
	.transition_x_enterFrom {
		interpolate-size: allow-keywords; // heightのtransitionを動作させるために必要
		height: 0;
	}
}

.transition_x_leaveTo {
	opacity: 0;
}

.notifications {
	container-type: inline-size;
	background: var(--MI_THEME-panel);
}

.item {
	border-bottom: solid 0.5px var(--MI_THEME-divider);
}
</style>
