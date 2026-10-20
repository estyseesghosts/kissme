<!--
SPDX-FileCopyrightText: leah and other Cutiekey contributors
SPDX-License-Identifier: AGPL-3.0-only

Makes its slot follow the mouse pointer. Used by the `$[followmouse]` MFM function.
-->

<template>
<span ref="container" :class="$style.root">
	<span ref="el" :class="$style.inner" style="position: absolute">
		<slot></slot>
	</span>
</span>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, shallowRef } from 'vue';
import { computeFollowMouse } from '@/utility/sk-follow-mouse.js';
import type { FollowMouseState } from '@/utility/sk-follow-mouse.js';

const el = shallowRef<HTMLElement>();
const container = shallowRef<HTMLElement>();

const props = withDefaults(defineProps<{
	x?: boolean;
	y?: boolean;
	speed?: string;
	rotateByVelocity?: boolean;
}>(), {
	x: true,
	y: true,
	speed: '0.1s',
	rotateByVelocity: true,
});

let state: FollowMouseState = { lastX: 0, lastY: 0, angle: 0 };

function updatePosition(mouseEvent: MouseEvent): void {
	if (!el.value || !container.value) return;
	const rect = container.value.getBoundingClientRect();
	const result = computeFollowMouse({
		x: mouseEvent.clientX - rect.left,
		y: mouseEvent.clientY - rect.top,
		followX: props.x,
		followY: props.y,
		rotateByVelocity: props.rotateByVelocity,
	}, state);
	state = result.state;
	el.value.style.transform = result.transform;
	el.value.style.transition = `transform ${props.speed}`;
}

onMounted(() => {
	window.addEventListener('mousemove', updatePosition);
});

onUnmounted(() => {
	window.removeEventListener('mousemove', updatePosition);
});
</script>

<style lang="scss" module>
.root {
	position: relative;
	display: inline-block;
}

.inner {
	transform-origin: center center;
}
</style>
