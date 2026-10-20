<!--
SPDX-FileCopyrightText: kopper and other Sharkey contributors
SPDX-License-Identifier: AGPL-3.0-only

Displays Oneko, a cat that follows the cursor. Shown only when pref `oneko` is on (see ui/_common_/common.vue).
-->

<template>
<div ref="nekoEl" :class="$style.oneko" aria-hidden="true"></div>
</template>

<script lang="ts" setup>
// oneko.js: https://github.com/adryd325/oneko.js
// modified to be a vue component by ShittyKopper :3

import { shallowRef, onMounted, onUnmounted } from 'vue';
import { availableIdleAnimations, clampPosition, directionFor, nekoSpeed, spriteBackgroundPosition } from '@/utility/sk-oneko.js';
import type { IdleAnimation, SpriteName } from '@/utility/sk-oneko.js';

const nekoEl = shallowRef<HTMLDivElement>();

let nekoPosX = 32;
let nekoPosY = 32;

let mousePosX = 0;
let mousePosY = 0;

let frameCount = 0;
let idleTime = 0;
let idleAnimation: IdleAnimation | null = null;
let idleAnimationFrame = 0;
let lastFrameTimestamp: number | null = null;
let rafId: number | null = null;

function mouseCallback(event: MouseEvent): void {
	mousePosX = event.clientX;
	mousePosY = event.clientY;
}

function init(): void {
	if (!nekoEl.value) return;

	nekoEl.value.style.left = `${nekoPosX - 16}px`;
	nekoEl.value.style.top = `${nekoPosY - 16}px`;

	window.document.addEventListener('mousemove', mouseCallback, { passive: true });

	rafId = window.requestAnimationFrame(onAnimationFrame);
}

function uninit(): void {
	// The donor removed this from `window` while adding it to `document`, leaking the listener.
	window.document.removeEventListener('mousemove', mouseCallback);
	if (rafId != null) window.cancelAnimationFrame(rafId);
	rafId = null;
}

function onAnimationFrame(timestamp: number): void {
	// Stops execution if the neko element is removed from DOM
	if (!nekoEl.value?.isConnected) {
		return;
	}
	if (lastFrameTimestamp == null) {
		lastFrameTimestamp = timestamp;
	}
	if (timestamp - lastFrameTimestamp > 100) {
		lastFrameTimestamp = timestamp;
		frame();
	}
	rafId = window.requestAnimationFrame(onAnimationFrame);
}

function setSprite(name: SpriteName, spriteFrame: number): void {
	if (!nekoEl.value) return;
	nekoEl.value.style.backgroundPosition = spriteBackgroundPosition(name, spriteFrame);
}

function resetIdleAnimation(): void {
	idleAnimation = null;
	idleAnimationFrame = 0;
}

function idle(): void {
	idleTime += 1;

	// every ~ 20 seconds
	if (idleTime > 10 && Math.floor(Math.random() * 200) === 0 && idleAnimation == null) {
		const available = availableIdleAnimations(nekoPosX, nekoPosY, window.innerWidth, window.innerHeight);
		idleAnimation = available[Math.floor(Math.random() * available.length)];
	}

	switch (idleAnimation) {
		case 'sleeping':
			if (idleAnimationFrame < 8) {
				setSprite('tired', 0);
				break;
			}
			setSprite('sleeping', Math.floor(idleAnimationFrame / 4));
			if (idleAnimationFrame > 192) {
				resetIdleAnimation();
			}
			break;
		case 'scratchWallN':
		case 'scratchWallS':
		case 'scratchWallE':
		case 'scratchWallW':
		case 'scratchSelf':
			setSprite(idleAnimation, idleAnimationFrame);
			if (idleAnimationFrame > 9) {
				resetIdleAnimation();
			}
			break;
		default:
			setSprite('idle', 0);
			return;
	}
	idleAnimationFrame += 1;
}

function frame(): void {
	if (!nekoEl.value) return;

	frameCount += 1;
	const diffX = nekoPosX - mousePosX;
	const diffY = nekoPosY - mousePosY;
	const distance = Math.sqrt(diffX ** 2 + diffY ** 2);

	if (distance < nekoSpeed || distance < 48) {
		idle();
		return;
	}

	resetIdleAnimation();

	if (idleTime > 1) {
		setSprite('alert', 0);
		// count down after being alerted before moving
		idleTime = Math.min(idleTime, 7);
		idleTime -= 1;
		return;
	}

	setSprite(directionFor(diffX, diffY, distance), frameCount);

	const clamped = clampPosition(
		nekoPosX - (diffX / distance) * nekoSpeed,
		nekoPosY - (diffY / distance) * nekoSpeed,
		window.innerWidth,
		window.innerHeight,
	);
	nekoPosX = clamped.x;
	nekoPosY = clamped.y;

	nekoEl.value.style.left = `${nekoPosX - 16}px`;
	nekoEl.value.style.top = `${nekoPosY - 16}px`;
}

onMounted(init);
onUnmounted(uninit);
</script>

<style module>
.oneko {
	width: 32px;
	height: 32px;
	position: fixed;
	pointer-events: none;
	image-rendering: pixelated;
	z-index: 2147483647;
	background-image: var(--MI_THEME-oneko-image, url(/client-assets/oneko.gif));
}
</style>
