<!--
SPDX-FileCopyrightText: amelia and other Sharkey contributors
SPDX-License-Identifier: AGPL-3.0-only

Shows the track a user is currently listening to (ListenBrainz). Rendered only for users whose
profile reports `listenbrainz`, a Sharkey-only field; the `users/listenbrainz` endpoint is not in stock Misskey.
-->

<template>
<Transition>
	<div v-if="data" style="padding: 4px">
		<div class="flex">
			<component
				:is="data.musicbrainzUrl ? 'a' : 'div'"
				:href="data.musicbrainzUrl" 
				@click.prevent="data.musicbrainzUrl && warningExternalWebsite(data.musicbrainzUrl)"
			>
				<div class="imageContainer">
					<div v-if="prefer.s.animation && shouldShowBars" class="musicBars">
						<div class="bar" :style="{ bottom: barPosition }"></div>
						<div class="bar" :style="{ bottom: barPosition }"></div>
						<div class="bar" :style="{ bottom: barPosition }"></div>
					</div>
					<img v-if="data.coverArt" v-show="!loading" :src="getProxiedImageUrl(data.coverArt)" :alt="data.title" class="image" @load="loading = false"/>
					<MkLoading v-if="loading && data.coverArt" class="spinner"/>
				</div>
			</component>
			<div class="flex flex-col items-start titles">
				<p class="listening-to">{{ skStrings.listeningTo }}</p>
				<p class="text-sm font-bold ellipsis">{{ data.title }}</p>
				<p class="text-xs font-medium ellipsis">{{ data.artist }}</p>
			</div>
			<a 
				v-if="data.listenbrainzUrl" 
				:href="data.listenbrainzUrl"
				@click.prevent="warningExternalWebsite(data.listenbrainzUrl)"
			>
				<div class="playicon">
					<i class="ti ti-player-play"></i>
				</div>
			</a>
		</div>
	</div>
</Transition>
</template>

<script lang="ts" setup>
import { ref, watch, computed, onMounted, onBeforeUnmount } from 'vue';
import { prefer } from '@/preferences.js';
import { skStrings } from '@/utility/sk-strings.js';
import { getProxiedImageUrl } from '@/utility/media-proxy.js';
import { warningExternalWebsite } from '@/utility/warning-external-website.js';
import { fetchListenBrainz } from '@/utility/sk-listenbrainz-api.js';
import type { SkListenBrainzData } from '@/utility/sk-listenbrainz.js';

const props = defineProps<{
	userId: string,
	popup?: boolean,
}>();

const data = ref<SkListenBrainzData>();

const loading = ref(true);

const shouldShowBars = computed(() => !data.value?.coverArt || !loading.value);
const barPosition = computed(() => data.value?.coverArt ? '1px' : '1rem');

let intervalId: number | undefined;

watch(data, (newData, oldData) => {
	if (!loading.value && newData?.coverArt !== oldData?.coverArt) {
		loading.value = true;
	}
});

async function fetchLB(): Promise<void> {
	try {
		data.value = await fetchListenBrainz(props.userId);
	} catch (err) {
		console.error(`ListenBrainz failed for ${props.userId}: `, err);
	}
}

onMounted(() => {
	fetchLB();
	intervalId = window.setInterval(fetchLB, 15000);
});
onBeforeUnmount(() => window.clearInterval(intervalId));
</script>

<style lang="scss" scoped>
.v-enter-active,
.v-leave-active {
  transition: all 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  transform: scaleY(80%);
  opacity: 0;
}

.flex {
	display: flex;
	align-items: center;
}
.flex a {
  display: flex;
  align-items: center;
  text-decoration: none;
}
.imageContainer {
	position: relative;
	height: 3rem;
	width: 3rem;
	margin-right: 0.7rem;
}
.image {
	height: 100%;
	width: 100%;
}
.spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.musicBars {
  position: absolute;
  left: 1px;
  top: 100%;
}
.bar {
	background: var(--MI_THEME-accent);
	border-radius: 0.25em;
  width: calc(0.8rem - 2px);
  position: absolute;
  animation: bars 0ms ease-in-out infinite alternate;
}
@keyframes bars {
	0% {
		height: 0.125em;
	}
	100% {
		height: 1rem;
	}
}
.bar:nth-child(1)  { left: 0.3rem; animation-duration: 342ms; animation-delay: -5312ms }
.bar:nth-child(2)  { left: 1.1rem; animation-duration: 303ms; animation-delay: -1392s }
.bar:nth-child(3)  { left: 1.9rem; animation-duration: 296ms; animation-delay: -357ms }
.items-start {
	align-items: flex-start;
}
.flex-col {
	display: flex;
	flex-direction: column;
}
.titles {
	flex-grow: 999;
	width: calc(100% - 6rem);
}
.text-sm {
	font-size: 0.75rem;
	margin: 0 0 0.3rem;
}
.font-bold {
	font-weight: 700;
}
.listening-to {
	font-size: 0.625rem;
	margin: 0 0 0.3rem;
	color: var(--MI_THEME-accent);
}
.text-xs {
	font-size: 0.75rem;
	margin: 0;
}
.ellipsis {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  width: 100%
}
.font-medium {
	font-weight: 500;
}
.playicon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 3rem;
	height: 3rem;
	font-size: 1.5rem;
}
@media (max-width: 500px) {
	.playicon {
		display: none;
	}
}
</style>
