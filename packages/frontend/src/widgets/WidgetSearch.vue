<!--
SPDX-FileCopyrightText: marie and other Sharkey contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkContainer :showHeader="widgetProps.showHeader" class="skw-search">
	<MkInput v-model="searchQuery" :large="true" :autofocus="true" type="search" @keydown="onInputKeydown">
		<template #suffix>
			<button style="border: none; background: none; z-index: 2; pointer-events: auto; position: relative; margin: 0 auto;" @click="search"><i class="ti ti-search"></i></button>
		</template>
	</MkInput>
</MkContainer>
</template>

<script lang="ts" setup>
import { defineAsyncComponent, markRaw, ref } from 'vue';
import { useWidgetPropsManager } from './widget.js';
import type { WidgetComponentEmits, WidgetComponentExpose, WidgetComponentProps } from './widget.js';
import type { GetFormResultType } from '@/utility/form.js';
import MkInput from '@/components/MkInput.vue';
import MkContainer from '@/components/MkContainer.vue';
import { i18n } from '@/i18n.js';
import { misskeyApi } from '@/utility/misskey-api.js';
import * as os from '@/os.js';
import { notesSearchAvailable } from '@/utility/check-permissions.js';
import { Paginator } from '@/utility/paginator.js';
import { useRouter } from '@/router.js';

const name = 'search';

const widgetPropsDef = {
	showHeader: {
		type: 'boolean' as const,
		label: i18n.ts._widgetOptions.showHeader,
		default: false,
	},
};

type WidgetProps = GetFormResultType<typeof widgetPropsDef>;

const props = defineProps<WidgetComponentProps<WidgetProps>>();
const emit = defineEmits<WidgetComponentEmits<WidgetProps>>();

const { widgetProps, configure } = useWidgetPropsManager(name,
	widgetPropsDef,
	props,
	emit,
);

function onInputKeydown(evt: KeyboardEvent) {
	if (evt.key === 'Enter') {
		evt.preventDefault();
		evt.stopPropagation();
		search();
	}
}

const router = useRouter();

const key = ref(0);
const searchQuery = ref('');

async function search() {
	const query = searchQuery.value.toString().trim();

	if (query == null || query === '') return;

	if (query.startsWith('https://')) {
		const promise = misskeyApi('ap/show', {
			uri: query,
		});

		os.promiseDialog(promise, null, null, i18n.ts.fetchingAsApObject);

		const res = await promise;

		if (res.type === 'User') {
			router.pushByPath(`/@${res.object.username}@${res.object.host}`);
		} else if (res.type === 'Note') {
			router.pushByPath(`/notes/${res.object.id}`);
		}

		return;
	}

	if (query.match(/^@[a-z0-9_.-]+@[a-z0-9_.-]+$/i)) {
		router.pushByPath(`/${query}`);
		return;
	}

	if (query.startsWith('#')) {
		router.pushByPath(`/tags/${encodeURIComponent(query.substring(1))}`);
		return;
	}

	if (!notesSearchAvailable) {
		os.alert({
			type: 'warning',
			text: i18n.ts.notesSearchNotAvailable,
		});
		return;
	}

	// NOTE: the donor also sends order/filetype here, but notes/search on this
	// backend rejects them (UNSUPPORTED_FIELD), so only the query is sent.
	const paginator = markRaw(new Paginator('notes/search', {
		limit: 10,
		params: {
			query: query,
			userId: null,
		},
	}));

	key.value++;

	const { dispose } = os.popup(defineAsyncComponent(() => import('@/components/SkSearchResultWindow.vue')), {
		resultKey: key.value,
		paginator: paginator,
	}, {
		closed: () => dispose(),
	});
}

defineExpose<WidgetComponentExpose>({
	name,
	configure,
	id: props.widget ? props.widget.id : null,
});
</script>

<style lang="scss" scoped>
.skw-search {
	border-radius: var(--MI-radius-sm) !important;
}
</style>
