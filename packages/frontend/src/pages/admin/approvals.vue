<!--
SPDX-FileCopyrightText: marie and other Sharkey contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<PageWithHeader>
	<div class="_spacer" style="--MI_SPACER-w: 900px;">
		<MkLoading v-if="supported === null"/>
		<MkInfo v-else-if="!supported" warn>{{ i18n.ts.approvalsUnsupported }}</MkInfo>
		<MkPagination v-else :paginator="paginator" withControl>
			<template #empty><MkResult type="empty" :text="i18n.ts.approvalsEmpty"/></template>
			<template #default="{ items }">
				<div class="_gaps_s">
					<SkApprovalUser v-for="item in items" :key="item.id" :user="item" @deleted="deleted"/>
				</div>
			</template>
		</MkPagination>
	</div>
</PageWithHeader>
</template>

<script lang="ts" setup>
import { markRaw, ref } from 'vue';
import MkPagination from '@/components/MkPagination.vue';
import MkInfo from '@/components/MkInfo.vue';
import SkApprovalUser from '@/components/SkApprovalUser.vue';
import { definePage } from '@/page.js';
import { i18n } from '@/i18n.js';
import { Paginator } from '@/utility/paginator.js';
import { probeApprovalsSupported } from '@/utility/sk-approvals-api.js';

// null = probing, false = backend lacks admin/approve-user (disabled note), true = enabled.
const supported = ref<boolean | null>(null);
probeApprovalsSupported().then(v => { supported.value = v; });

// `state: 'approved'` is a Sharkey-only value of admin/show-users (it selects accounts still
// awaiting approval, i.e. approved = FALSE), hence the cast.
const paginator = markRaw(new Paginator('admin/show-users', {
	limit: 10,
	params: {
		sort: '+createdAt',
		state: 'approved' as unknown as 'all',
		origin: 'local',
	},
	offsetMode: true,
}));

function deleted(id: string) {
	paginator.removeItem(id);
}

definePage(() => ({
	title: i18n.ts.approvals,
	icon: 'ti ti-user-check',
}));
</script>
