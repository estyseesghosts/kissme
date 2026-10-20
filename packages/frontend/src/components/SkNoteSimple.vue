<!--
SPDX-FileCopyrightText: syuilo and other misskey contributors
SPDX-License-Identifier: AGPL-3.0-only

Simple view of a note in the Sharkey style. Used in quote renotes, link previews, etc.
-->

<template>
<SkMutedNote v-if="!isDeleted" :note="note" :skipMute="skipMute" :class="$style.root" @expandMute="n => emit('expandMute', n)">
	<MkAvatar :class="$style.avatar" :user="note.user" link preview/>
	<div :class="$style.main">
		<SkNoteHeader :class="$style.header" :classic="true" :note="note"/>
		<div>
			<p v-if="props.note.cw != null" :class="$style.cw">
				<Mfm v-if="props.note.cw != ''" style="margin-right: 8px;" :text="props.note.cw" :isBlock="true" :author="note.user" :nyaize="'respect'" :emojiUrls="note.emojis"/>
				<MkCwButton v-model="showContent" :text="note.text" :files="note.files" :poll="note.poll" @click.stop/>
			</p>
			<div v-show="props.note.cw == null || showContent">
				<MkSubNoteContent :hideFiles="hideFiles" :class="$style.text" :note="note" :expandAllCws="props.expandAllCws"/>
				<div v-if="note.isSchedule" style="margin-top: 10px;">
					<MkButton :class="$style.button" inline @click.stop.prevent="editScheduleNote()"><i class="ti ti-eraser"></i> {{ i18n.ts.edit }}</MkButton>
					<MkButton :class="$style.button" inline danger @click.stop.prevent="deleteScheduleNote()"><i class="ti ti-trash"></i> {{ i18n.ts.delete }}</MkButton>
				</div>
			</div>
		</div>
	</div>
</SkMutedNote>
</template>

<script lang="ts" setup>
import { watch, ref } from 'vue';
import * as Misskey from 'misskey-js';
import SkNoteHeader from '@/components/SkNoteHeader.vue';
import MkSubNoteContent from '@/components/MkSubNoteContent.vue';
import MkCwButton from '@/components/MkCwButton.vue';
import { prefer } from '@/preferences.js';
import { setupNoteViewInterruptors } from '@/plugin.js';
import { deepClone } from '@/utility/clone.js';
import SkMutedNote from '@/components/SkMutedNote.vue';
import type { PostFormProps } from '@/types/post-form.js';
import MkButton from '@/components/MkButton.vue';
import * as os from '@/os.js';
import { i18n } from '@/i18n.js';
import { deleteScheduledNote } from '@/utility/sk-schedule-api.js';

const props = defineProps<{
	note: Misskey.entities.Note & {
		isSchedule?: boolean,
		scheduledNoteId?: string
	};
	expandAllCws?: boolean;
	skipMute?: boolean;
	hideFiles?: boolean;
}>();

const emit = defineEmits<{
	(ev: 'editScheduleNote'): void;
	(ev: 'expandMute', note: Misskey.entities.Note): void;
}>();

let showContent = ref(prefer.s.uncollapseCW);
const isDeleted = ref(false);

const note = ref(deepClone(props.note));

setupNoteViewInterruptors(note, null);

async function deleteScheduleNote() {
	const { canceled } = await os.confirm({
		type: 'warning',
		text: i18n.ts.deleteConfirm,
		okText: i18n.ts.delete,
		cancelText: i18n.ts.cancel,
	});
	if (canceled) return;
	await deleteScheduledNote(note.value.id);
	isDeleted.value = true;
}

// Editing deletes the schedule entry and re-opens the composer with its content,
// so the edited note is scheduled again from scratch (same as the donor).
async function editScheduleNote() {
	await deleteScheduledNote(props.note.id);
	isDeleted.value = true;

	await os.post({
		initialNote: props.note,
		renote: props.note.renote,
		reply: props.note.reply,
		channel: props.note.channel as PostFormProps['channel'],
	});
	emit('editScheduleNote');
}

watch(() => props.expandAllCws, (expandAllCws) => {
	if (expandAllCws !== showContent.value) showContent.value = expandAllCws;
});
</script>

<style lang="scss" module>
.root {
	display: flex;
	margin: 0;
	padding: 0;
	font-size: 0.95em;

	&:hover, &:focus-within {
		background: var(--MI_THEME-panelHighlight);
		transition: background .2s;
	}
}

.avatar {
	flex-shrink: 0;
	display: block;
	margin: 0 10px 0 0;
	width: 34px;
	height: 34px;
	border-radius: var(--MI-radius-sm);
	position: sticky !important;
	top: calc(16px + var(--MI-stickyTop, 0px));
	left: 0;
}

.main {
	flex: 1;
	min-width: 0;
}

.header {
	margin-bottom: 2px;
	z-index: 2;
}

.cw {
	display: block;
	margin: 0;
	padding: 0;
	overflow-wrap: break-word;
	overflow: hidden;
}

.button {
	margin-right: 8px;
	margin-bottom: 8px;
}

.text {
	cursor: default;
	margin: 0;
	padding: 0;
	overflow: hidden;
}

@container (min-width: 250px) {
	.avatar {
		margin: 0 10px 0 0;
		width: 40px;
		height: 40px;
	}
}

@container (min-width: 350px) {
	.avatar {
		margin: 0 10px 0 0;
		width: 44px;
		height: 44px;
	}
}

@container (min-width: 500px) {
	.avatar {
		margin: 0 12px 0 0;
		width: 48px;
		height: 48px;
	}
}
</style>
