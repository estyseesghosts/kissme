<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div
	ref="playerEl"
	v-hotkey="keymap"
	tabindex="0"
	:class="[
		$style.audioContainer,
		(audio.isSensitive && prefer.s.highlightSensitiveMedia) && $style.sensitive,
	]"
	@contextmenu.stop
	@keydown.stop
>
	<button v-if="hide" :class="$style.hidden" @click="show">
		<div :class="$style.hiddenTextWrapper">
			<b v-if="audio.isSensitive" style="display: block;"><i class="ti ti-eye-exclamation"></i> {{ i18n.ts.sensitive }}{{ prefer.s.dataSaver.media ? ` (${i18n.ts.audio}${audio.size ? ' ' + bytes(audio.size) : ''})` : '' }}</b>
			<b v-else style="display: block;"><i class="ti ti-music"></i> {{ prefer.s.dataSaver.media && audio.size ? bytes(audio.size) : i18n.ts.audio }}</b>
			<span style="display: block;">{{ i18n.ts.clickToShow }}</span>
		</div>
	</button>

	<div v-else-if="prefer.s.useNativeUiForVideoAudioPlayer" :class="$style.nativeAudioContainer">
		<audio
			ref="audioEl"
			preload="metadata"
			controls
			:class="$style.nativeAudio"
			@keydown.prevent
		>
			<source :src="audio.url">
		</audio>
	</div>

	<div v-else :class="$style.audioControls">
		<audio
			ref="audioEl"
			preload="metadata"
			@keydown.prevent="() => {}"
		>
			<source :src="audio.url">
		</audio>
		<div :class="[$style.controlsChild, $style.controlsLeft]">
			<button
				:class="['_button', $style.controlButton]"
				tabindex="-1"
				@click.stop="togglePlayPause"
			>
				<i v-if="isPlaying" class="ti ti-player-pause-filled"></i>
				<i v-else class="ti ti-player-play-filled"></i>
			</button>
		</div>
		<div :class="[$style.controlsChild, $style.controlsRight]">
			<a class="_button" :class="$style.controlButton" :href="audio.url" :download="audio.name" target="_blank">
				<i class="ti ti-download"></i>
			</a>
			<button
				:class="['_button', $style.controlButton]"
				tabindex="-1"
				@click.stop="() => {}"
				@mousedown.prevent.stop="showMenu"
			>
				<i class="ti ti-settings"></i>
			</button>
		</div>
		<div :class="[$style.controlsChild, $style.controlsTime]">{{ formatMediaTime(elapsedTimeMs) }}</div>
		<div :class="[$style.controlsChild, $style.controlsVolume]">
			<button
				:class="['_button', $style.controlButton]"
				tabindex="-1"
				@click.stop="toggleMute"
			>
				<i v-if="volume === 0" class="ti ti-volume-3"></i>
				<i v-else class="ti ti-volume"></i>
			</button>
			<MkMediaRange
				v-model="volume"
				:class="$style.volumeSeekbar"
			/>
		</div>
		<MkMediaRange
			v-model="rangePercent"
			:class="$style.seekbarRoot"
			:buffer="bufferedDataRatio"
		/>
	</div>
</div>
</template>

<script lang="ts" setup>
import { useTemplateRef, watch, computed, ref, onDeactivated, onActivated, onMounted } from 'vue';
import * as Misskey from 'misskey-js';
import type { MenuItem } from '@/types/menu.js';
import type { MediaComponentExposes } from '@/types/media-component.js';
import type { Keymap } from '@/utility/hotkey.js';
import { i18n } from '@/i18n.js';
import * as os from '@/os.js';
import bytes from '@/filters/bytes.js';
import MkMediaRange from '@/components/MkMediaRange.vue';
import { getFileMenu } from '@/utility/get-file-menu.js';
import { shouldHideFileByDefault, canRevealFile } from '@/utility/sensitive-file.js';
import { DEFAULT_VOLUME, PLAYBACK_SPEEDS, bufferedRatio, clampVolume, elapsedRatio, formatMediaTime, ratioToSeconds, seekTarget, stepVolume, toggleMuteVolume } from '@/utility/sk-media-player.js';
import { prefer } from '@/preferences.js';

const props = defineProps<{
	audio: Misskey.entities.DriveFile;
}>();

const keymap = {
	'up': {
		allowRepeat: true,
		callback: () => {
			if (hasFocus() && audioEl.value) {
				volume.value = stepVolume(volume.value, 1);
			}
		},
	},
	'down': {
		allowRepeat: true,
		callback: () => {
			if (hasFocus() && audioEl.value) {
				volume.value = stepVolume(volume.value, -1);
			}
		},
	},
	'left': {
		allowRepeat: true,
		callback: () => {
			if (hasFocus() && audioEl.value) {
				audioEl.value.currentTime = seekTarget(audioEl.value.currentTime, audioEl.value.duration, -1);
			}
		},
	},
	'right': {
		allowRepeat: true,
		callback: () => {
			if (hasFocus() && audioEl.value) {
				audioEl.value.currentTime = seekTarget(audioEl.value.currentTime, audioEl.value.duration, 1);
			}
		},
	},
	'space': () => {
		if (hasFocus()) {
			togglePlayPause();
		}
	},
} as const satisfies Keymap;

// PlayerElもしくはその子要素にフォーカスがあるかどうか
function hasFocus() {
	if (!playerEl.value) return false;
	return playerEl.value === window.document.activeElement || playerEl.value.contains(window.document.activeElement);
}

const playerEl = useTemplateRef('playerEl');
const audioEl = useTemplateRef('audioEl');

// eslint-disable-next-line vue/no-setup-props-reactivity-loss
const hide = ref(shouldHideFileByDefault(props.audio));

async function show() {
	if (!(await canRevealFile(props.audio))) return;

	hide.value = false;
}

// Menu
const menuShowing = ref(false);

function showMenu(ev: MouseEvent) {
	const menu: MenuItem[] = [
		// TODO: 再生キューに追加
		{
			type: 'switch',
			text: i18n.ts._mediaControls.loop,
			icon: 'ti ti-repeat',
			ref: loop,
		},
		{
			type: 'radio',
			text: i18n.ts._mediaControls.playbackRate,
			icon: 'ti ti-clock-play',
			ref: speed,
			options: PLAYBACK_SPEEDS,
		},
		{
			type: 'divider',
		},
		...getFileMenu(props.audio, (newHide) => { hide.value = newHide; }),
	];

	menuShowing.value = true;
	os.popupMenu(menu, ev.currentTarget ?? ev.target, {
		align: 'right',
		onClosing: () => {
			menuShowing.value = false;
		},
	});
}

// MediaControl: Common State
const oncePlayed = ref(false);
const isReady = ref(false);
const isPlaying = ref(false);
const isActuallyPlaying = ref(false);
const elapsedTimeMs = ref(0);
const durationMs = ref(0);
const rangePercent = computed({
	get: () => {
		return elapsedRatio(elapsedTimeMs.value, durationMs.value);
	},
	set: (to) => {
		if (!audioEl.value) return;
		audioEl.value.currentTime = ratioToSeconds(to, durationMs.value);
	},
});
const volume = ref(DEFAULT_VOLUME);
const speed = ref(1);
const loop = ref(false); // TODO: ドライブファイルのフラグに置き換える
const bufferedEnd = ref(0);
const bufferedDataRatio = computed(() => {
	if (!audioEl.value) return 0;
	return bufferedRatio(bufferedEnd.value, audioEl.value.duration);
});

// MediaControl Events
function togglePlayPause() {
	if (!isReady.value || !audioEl.value) return;

	if (isPlaying.value) {
		audioEl.value.pause();
		isPlaying.value = false;
	} else {
		audioEl.value.play();
		isPlaying.value = true;
		oncePlayed.value = true;
	}
}

function toggleMute() {
	volume.value = toggleMuteVolume(volume.value);
}

let onceInit = false;
let mediaTickFrameId: number | null = null;
let stopAudioElWatch: () => void;

function init() {
	if (onceInit) return;
	onceInit = true;

	stopAudioElWatch = watch(audioEl, () => {
		if (audioEl.value) {
			isReady.value = true;

			function updateMediaTick() {
				if (audioEl.value) {
					try {
						bufferedEnd.value = audioEl.value.buffered.end(0);
					} catch (err) {
						bufferedEnd.value = 0;
					}

					elapsedTimeMs.value = audioEl.value.currentTime * 1000;

					if (audioEl.value.loop !== loop.value) {
						loop.value = audioEl.value.loop;
					}
				}
				mediaTickFrameId = window.requestAnimationFrame(updateMediaTick);
			}

			updateMediaTick();

			audioEl.value.addEventListener('play', () => {
				isActuallyPlaying.value = true;
			});

			audioEl.value.addEventListener('pause', () => {
				isActuallyPlaying.value = false;
				isPlaying.value = false;
			});

			audioEl.value.addEventListener('ended', () => {
				oncePlayed.value = false;
				isActuallyPlaying.value = false;
				isPlaying.value = false;
			});

			durationMs.value = audioEl.value.duration * 1000;
			audioEl.value.addEventListener('durationchange', () => {
				if (audioEl.value) {
					durationMs.value = audioEl.value.duration * 1000;
				}
			});

			audioEl.value.volume = volume.value;
		}
	}, {
		immediate: true,
	});
}

watch(volume, (to) => {
	if (audioEl.value) audioEl.value.volume = clampVolume(to);
});

watch(speed, (to) => {
	if (audioEl.value) audioEl.value.playbackRate = to;
});

watch(loop, (to) => {
	if (audioEl.value) audioEl.value.loop = to;
});

defineExpose<MediaComponentExposes>({
	isRevealed: () => !hide.value,
});

onMounted(() => {
	init();
});

onActivated(() => {
	init();
});

onDeactivated(() => {
	isReady.value = false;
	isPlaying.value = false;
	isActuallyPlaying.value = false;
	elapsedTimeMs.value = 0;
	durationMs.value = 0;
	bufferedEnd.value = 0;
	hide.value = shouldHideFileByDefault(props.audio);
	stopAudioElWatch();
	onceInit = false;
	if (mediaTickFrameId) {
		window.cancelAnimationFrame(mediaTickFrameId);
		mediaTickFrameId = null;
	}
});
</script>

<style lang="scss" module>
.audioContainer {
	container-type: inline-size;
	position: relative;
	border: .5px solid var(--MI_THEME-divider);
	border-radius: var(--MI-radius);
	overflow: clip;

	&:focus-visible {
		outline: none;
	}
}

.sensitive {
	position: relative;

	&::after {
		content: "";
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		border-radius: inherit;
		box-shadow: inset 0 0 0 4px var(--MI_THEME-warn);
	}
}

.hidden {
	width: 100%;
	background: #000;
	border: none;
	outline: none;
	font: inherit;
	color: inherit;
	cursor: pointer;
	padding: 12px 0;
	display: flex;
	align-items: center;
	justify-content: center;
}

.hiddenTextWrapper {
	text-align: center;
	font-size: 0.8em;
	color: #fff;
}

.audioControls {
	display: grid;
	grid-template-areas:
		"left time . volume right"
		"seekbar seekbar seekbar seekbar seekbar";
	grid-template-columns: auto auto 1fr auto auto;
	align-items: center;
	gap: 4px 8px;
	padding: 10px;
}

.controlsChild {
	display: flex;
	align-items: center;
	gap: 4px;

	.controlButton {
		padding: 6px;
		border-radius: calc(var(--MI-radius) / 2);
		font-size: 1.05rem;

		&:hover {
			color: var(--MI_THEME-accent);
			background-color: var(--MI_THEME-accentedBg);
		}

		&:focus-visible {
			outline: none;
		}
	}
}

.controlsLeft {
	grid-area: left;
}

.controlsRight {
	grid-area: right;
}

.controlsTime {
	grid-area: time;
	font-size: .9rem;
}

.controlsVolume {
	grid-area: volume;

	.volumeSeekbar {
		display: none;
	}
}

.seekbarRoot {
	grid-area: seekbar;
}

@container (min-width: 500px) {
	.audioControls {
		grid-template-areas: "left seekbar time volume right";
		grid-template-columns: auto 1fr auto auto auto;
	}

	.controlsVolume {
		.volumeSeekbar {
			max-width: 90px;
			display: block;
			flex-grow: 1;
		}
	}
}

.nativeAudioContainer {
	display: flex;
	align-items: center;
	padding: 6px;
}

.nativeAudio {
	display: block;
	width: 100%;
}
</style>
