<!--
SPDX-FileCopyrightText: syuilo and other misskey contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkModalWindow
	ref="dialogEl"
	:withOkButton="false"
	@click="cancel()"
	@close="cancel()"
>
	<template #header>{{ i18n.ts.schedulePostList }}</template>
	<div class="_spacer" style="--MI_SPACER-min: 14px; --MI_SPACER-max: 16px;">
		<SkPagination ref="paginationEl" :pagination="pagination">
			<template #empty><MkResult type="empty" :text="i18n.ts.nothing"/></template>

			<template #default="{ items }">
				<div class="_gaps">
					<SkNoteSimple v-for="item in asScheduledItems(items)" :key="item.id" :note="item.note" :skipMute="true" @editScheduleNote="listUpdate"/>
				</div>
			</template>
		</SkPagination>
	</div>
</MkModalWindow>
</template>

<script lang="ts" setup>
import { useTemplateRef } from 'vue';
import * as Misskey from 'misskey-js';
import type { Paging } from '@/components/SkPagination.vue';
import MkModalWindow from '@/components/MkModalWindow.vue';
import SkPagination from '@/components/SkPagination.vue';
import SkNoteSimple from '@/components/SkNoteSimple.vue';
import { i18n } from '@/i18n.js';

const emit = defineEmits<{
	(ev: 'cancel'): void;
}>();

const dialogEl = useTemplateRef('dialogEl');
const cancel = () => {
	emit('cancel');
	dialogEl.value?.close();
};

const paginationEl = useTemplateRef('paginationEl');

// 'notes/schedule/list' is absent from misskey-js, so the endpoint name is cast.
const pagination: Paging = {
	endpoint: 'notes/schedule/list' as keyof Misskey.Endpoints,
	limit: 10,
	offsetMode: true,
};

type ScheduledItem = { id: string; note: Misskey.entities.Note & { isSchedule?: boolean; scheduledNoteId?: string } };

function asScheduledItems(items: unknown[]): ScheduledItem[] {
	return items as ScheduledItem[];
}

function listUpdate() {
	paginationEl.value?.reload();
}
</script>
