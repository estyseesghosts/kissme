<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div class="_gaps_m">
	<MkTextarea v-model="attributionDomains" :spellcheck="false">
		<template #label>{{ skStrings.attributionDomains }}</template>
		<template #caption>
			{{ skStrings.attributionDomainsDescription }}
			<br/>
			{{ skStrings.attributionDomainsTutorial }}
			<code>{{ tutorialTag }}</code>
		</template>
	</MkTextarea>
	<MkButton primary :disabled="!changed" @click="save()"><i class="ti ti-device-floppy"></i> {{ i18n.ts.save }}</MkButton>
</div>
</template>

<script lang="ts" setup>
import { ref, watch, computed } from 'vue';
import { host as hostRaw } from '@@/js/config.js';
import { toUnicode } from 'punycode.js';
import MkTextarea from '@/components/MkTextarea.vue';
import MkButton from '@/components/MkButton.vue';
import { ensureSignin } from '@/i.js';
import { misskeyApi } from '@/utility/misskey-api.js';
import { i18n } from '@/i18n.js';
import * as os from '@/os.js';
import { skStrings } from '@/utility/sk-strings.js';
import { parseAttributionDomains, isValidAttributionDomainList } from '@/utility/sk-attribution-domains.js';

const $i = ensureSignin();

// `attributionDomains` exists on Sharkey's i/update and MeDetailed only; absent from misskey-js.
const initial = (($i as unknown as { attributionDomains?: string[] }).attributionDomains ?? []);

const attributionDomains = ref(initial.join('\n'));
const domainArray = computed(() => parseAttributionDomains(attributionDomains.value));
const changed = ref(false);
const tutorialTag = '<meta name="fediverse:creator" content="' + $i.username + '@' + toUnicode(hostRaw) + '" />';

async function save() {
	if (!isValidAttributionDomainList(domainArray.value)) {
		os.alert({
			type: 'error',
			title: i18n.ts.invalidValue,
		});
		return;
	}

	const update = misskeyApi as unknown as (ep: string, body: object) => Promise<unknown>;
	await os.promiseDialog(update('i/update', { attributionDomains: domainArray.value }));

	// Refresh filtered list to signal to the user how they've been saved
	attributionDomains.value = domainArray.value.join('\n');
	changed.value = false;
}

watch(domainArray, (newArray, oldArray) => {
	if (newArray.length !== oldArray.length || !newArray.every((a, i) => a === oldArray[i])) {
		changed.value = true;
	}
});
</script>
