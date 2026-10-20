<!--
SPDX-FileCopyrightText: hazelnoot and other Sharkey contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkModalWindow
	ref="modal"
	:width="500"
	:height="600"
	:withOkButton="false"
	@close="onClose"
	@closed="emit('closed')"
>
	<template #header>{{ i18n.ts.loginWithSharedAccess }}</template>

	<div class="_spacer" style="--MI_SPACER-min: 20px; --MI_SPACER-max: 28px;">
		<MkLoading v-if="fetching"/>
		<MkInfo v-else-if="unsupported" warn>{{ i18n.ts.sharedAccessUnsupported }}</MkInfo>
		<MkInfo v-else-if="loadFailed" warn>{{ i18n.ts.somethingHappened }}</MkInfo>
		<MkResult v-else-if="grants.length === 0" type="empty" :text="i18n.ts.noSharedAccess"/>
		<div v-else class="_gaps">
			<div v-for="(grant, i) of grants" :key="grant.id" :class="$style.grant">
				<MkUserCardMini :user="grant.user" :withChart="false" :class="$style.user"/>
				<div class="_gaps_s">
					<button v-tooltip="i18n.ts.login" class="_textButton" @click="onLogin(grant.id)"><i class="ti ti-login"></i></button>
					<button v-if="isExpanded(i)" v-tooltip="i18n.ts.collapse" class="_textButton" @click="collapse(i)"><i class="ti ti-chevron-up"></i></button>
					<button v-else v-tooltip="i18n.ts.expand" class="_textButton" @click="expand(i)"><i class="ti ti-chevron-down"></i></button>
				</div>
				<div v-if="isExpanded(i)" :class="$style.perms">
					<span>{{ i18n.ts.permissions }}:</span>
					<ul>
						<li v-for="perm of grant.permissions" :key="perm">{{ (i18n.ts._permissions as Record<string, string>)[perm] ?? perm }}</li>
					</ul>
				</div>
			</div>
		</div>
	</div>
</MkModalWindow>
</template>

<script setup lang="ts">
import { onMounted, ref, useTemplateRef } from 'vue';
import * as Misskey from 'misskey-js';
import * as os from '@/os.js';
import { misskeyApi } from '@/utility/misskey-api.js';
import { i18n } from '@/i18n';
import MkModalWindow from '@/components/MkModalWindow.vue';
import MkUserCardMini from '@/components/MkUserCardMini.vue';

/**
 * `i/shared-access/*` are Sharkey endpoints, absent from misskey-js (and from a stock
 * Misskey backend). Calls go through untyped aliases; remove the casts once typed.
 */
type UntypedApi = (endpoint: string, body: object) => Promise<unknown>;
const api = misskeyApi as unknown as UntypedApi;
const apiWithDialog = os.apiWithDialog as unknown as UntypedApi;

interface SharedAccessGrant {
	id: string;
	user: Misskey.entities.User;
	permissions: string[];
}

const emit = defineEmits<{
	(ev: 'done', v: { id: string, i: string }): void;
	(ev: 'closed'): void;
	(ev: 'cancelled'): void;
}>();

const modal = useTemplateRef('modal');
const grants = ref<SharedAccessGrant[]>([]);
const fetching = ref(true);
const unsupported = ref(false);
const loadFailed = ref(false);
const expandedIds = ref(new Set<number>());

onMounted(async () => {
	try {
		grants.value = await api('i/shared-access/list', { limit: 100 }) as unknown as SharedAccessGrant[];
	} catch (err) {
		// UNKNOWN_API_ENDPOINT: stock Misskey / Pinetree have no shared-access endpoints.
		if ((err as { code?: string }).code === 'UNKNOWN_API_ENDPOINT') unsupported.value = true;
		else loadFailed.value = true;
	} finally {
		fetching.value = false;
	}
});

function isExpanded(i: number) {
	return expandedIds.value.has(i);
}

function expand(i: number) {
	expandedIds.value.add(i);
}

function collapse(i: number) {
	expandedIds.value.delete(i);
}

async function onLogin(grantId: string) {
	const { userId, token } = await apiWithDialog('i/shared-access/login', { grantId }) as unknown as { userId: string, token: string };
	if (modal.value) modal.value.close();
	emit('done', { id: userId, i: token });
}

function onClose() {
	if (modal.value) modal.value.close();
	emit('cancelled');
}
</script>

<style module lang="scss">
.grant {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	align-items: center;
	gap: var(--MI-marginHalf);

	flex: 1;
}

.user {
	flex: 1;
}

.perms {
	width: 100%;
	padding: var(--MI-marginHalf);
	padding-top: 0;
}

.perms > ul {
	margin: 0 0 0 1.5em;
	padding: 0;
	font-size: 90%;
}
</style>
