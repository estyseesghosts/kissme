<!--
SPDX-FileCopyrightText: marie and other Sharkey contributors
SPDX-License-Identifier: AGPL-3.0-only

Displays a sheet of info about MFM.
The donor repeated one hand-written block per function; here the sections come from utility/sk-mfm-cheatsheet.ts.
-->

<template>
<MkWindow
	:initialWidth="600"
	:initialHeight="800"
	:canResize="true"
	@closed="emit('closed')"
>
	<template #header>
		{{ i18n.ts.mfmCheatsheet.title }}
	</template>
	<MkStickyContainer>
		<div class="_spacer" style="--MI_SPACER-w: 800px;">
			<div :class="$style.root">
				<div>{{ i18n.ts.mfmCheatsheet.intro }}</div>
				<br/>
				<div v-for="section in sections" :key="section.id" class="_block" :class="$style.section">
					<div :class="$style.title">{{ section.title }}</div>
					<MkInfo v-if="section.uncommon" warn>{{ i18n.ts.mfmCheatsheet.uncommonFeature }}</MkInfo>
					<div :class="$style.content">
						<p :class="$style.description">{{ section.description }}</p>
						<div :class="$style.preview">
							<Mfm :text="section.preview"/>
							<MkTextarea v-model="section.preview"><template #label>MFM</template></MkTextarea>
						</div>
					</div>
				</div>
			</div>
		</div>
	</MkStickyContainer>
</MkWindow>
</template>

<script lang="ts" setup>
import { reactive } from 'vue';
import MkInfo from '@/components/MkInfo.vue';
import MkWindow from '@/components/MkWindow.vue';
import MkTextarea from '@/components/MkTextarea.vue';
import MkStickyContainer from '@/components/global/MkStickyContainer.vue';
import { i18n } from '@/i18n.js';
import { buildMfmCheatsheet } from '@/utility/sk-mfm-cheatsheet.js';

const emit = defineEmits<{
	(ev: 'closed'): void;
}>();

// Each section's preview is edited in place, so the list is reactive.
const sections = reactive(buildMfmCheatsheet());
</script>

<style lang="scss" module>
.section {
	overflow: hidden;
}

.title {
	position: sticky;
	z-index: 1;
	top: var(--MI-stickyTop, 0px);
	padding: 16px;
	font-weight: bold;
	-webkit-backdrop-filter: var(--MI-blur, blur(10px));
	backdrop-filter: var(--MI-blur, blur(10px));
	background-color: var(--MI_THEME-X16);
}

.description {
	margin: 0;
	padding: 16px;
	padding-top: 0;
}

.preview {
	border-top: solid 0.5px var(--MI_THEME-divider);
	padding: 16px;
}
</style>
