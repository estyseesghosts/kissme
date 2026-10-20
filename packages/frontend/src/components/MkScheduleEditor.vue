<!--
SPDX-FileCopyrightText: syuilo and other misskey contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div style="padding: 8px 16px;">
	<section>
		<MkInput v-model="atDate" small type="date" class="input">
			<template #label>{{ skStrings.postOn }}</template>
		</MkInput>
		<MkInput v-model="atTime" small type="time" class="input">
			<template #label>{{ i18n.ts._poll.deadlineTime }}</template>
		</MkInput>
	</section>
</div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import MkInput from '@/components/MkInput.vue';
import { i18n } from '@/i18n.js';
import { skStrings } from '@/utility/sk-strings.js';
import { defaultScheduleParts, joinScheduledAt, splitScheduledAt } from '@/utility/sk-schedule.js';

const props = defineProps<{
	modelValue: {
		scheduledAt: number | null;
	};
}>();

const emit = defineEmits<{
	(ev: 'update:modelValue', v: {
		scheduledAt: number | null;
	}): void;
}>();

const initial = props.modelValue.scheduledAt ? splitScheduledAt(props.modelValue.scheduledAt) : defaultScheduleParts(new Date());
const atDate = ref(initial.date);
const atTime = ref(initial.time);

function get() {
	return { scheduledAt: joinScheduledAt(atDate.value, atTime.value) };
}

watch([
	atDate,
	atTime,
], () => emit('update:modelValue', get()));

onMounted(() => {
	emit('update:modelValue', get());
});
</script>
