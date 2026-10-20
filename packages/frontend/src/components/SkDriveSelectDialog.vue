<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkModalWindow
	ref="dialog"
	:width="800"
	:height="500"
	:withOkButton="true"
	:okButtonDisabled="(type === 'file') && (selected.length === 0)"
	@click="cancel()"
	@close="cancel()"
	@ok="ok()"
	@closed="emit('closed')"
>
	<template #header>
		{{ multiple ? ((type === 'file') ? i18n.ts.selectFiles : i18n.ts.selectFolders) : ((type === 'file') ? i18n.ts.selectFile : i18n.ts.selectFolder) }}
		<span v-if="selected.length > 0" style="margin-left: 8px; opacity: 0.5;">({{ number(selected.length) }})</span>
	</template>
	<MkDrive
		:multiple="multiple"
		:select="type"
		:initialFolder="initialFolder"
		@changeSelectedFiles="onChangeFiles"
		@changeSelectedFolders="onChangeFolders"
		@selected="ok()"
	/>
</MkModalWindow>
</template>

<script lang="ts" setup>
import { ref, useTemplateRef } from 'vue';
import * as Misskey from 'misskey-js';
import MkDrive from '@/components/MkDrive.vue';
import MkModalWindow from '@/components/MkModalWindow.vue';
import number from '@/filters/number.js';
import { i18n } from '@/i18n.js';

// Sharkey unified file/folder picker. Upstream MkDriveFileSelectDialog and
// MkDriveFolderSelectDialog are untouched; this one covers both via `type`.
withDefaults(defineProps<{
	type?: 'file' | 'folder';
	multiple: boolean;
	initialFolder?: Misskey.entities.DriveFolder | Misskey.entities.DriveFolder['id'] | null;
}>(), {
	type: 'file',
	initialFolder: null,
});

const emit = defineEmits<{
	(ev: 'done', r?: Misskey.entities.DriveFile[] | (Misskey.entities.DriveFolder | null)[]): void;
	(ev: 'closed'): void;
}>();

const dialog = useTemplateRef('dialog');

const selected = ref<Misskey.entities.DriveFile[] | (Misskey.entities.DriveFolder | null)[]>([]);

function ok() {
	emit('done', selected.value);
	dialog.value?.close();
}

function cancel() {
	emit('done');
	dialog.value?.close();
}

function onChangeFiles(v: Misskey.entities.DriveFile[]) {
	selected.value = v;
}

function onChangeFolders(v: (Misskey.entities.DriveFolder | null)[]) {
	selected.value = v;
}
</script>
