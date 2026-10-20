<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only

Sharkey's render-function marquee (`MarqueeText` there). Behaviorally the same as upstream's MkMarqueeText.vue,
which stays in place. Upstream consumers (status bars, RSS ticker widget, classic entrance) keep MkMarqueeText;
Sharkey-origin pages (welcome.entrance.a.vue) use this one. See docs/sk-port/phase-9-1-9-2.md.
-->

<script lang="ts">
import { defineComponent, h, onMounted, shallowRef, useCssModule, watch } from 'vue';

export default defineComponent({
	name: 'MarqueeText',
	props: {
		duration: {
			type: Number,
			default: 15,
		},
		repeat: {
			type: Number,
			default: 2,
		},
		paused: {
			type: Boolean,
			default: false,
		},
		reverse: {
			type: Boolean,
			default: false,
		},
	},
	setup(props, { slots }) {
		const style = useCssModule();
		const contentEl = shallowRef<HTMLElement>();

		function calc(): void {
			if (contentEl.value == null) return;
			const eachLength = contentEl.value.offsetWidth / props.repeat;
			const factor = 3000;
			const duration = props.duration / ((1 / eachLength) * factor);

			contentEl.value.style.animationDuration = `${duration}s`;
		}

		watch(() => props.duration, calc);

		onMounted(calc);

		return () => h('div', { class: style.wrap }, [
			h('span', {
				ref: contentEl,
				class: [style.content, { [style.paused]: props.paused }],
			}, Array.from({ length: props.repeat }, () => h('span', {
				class: style.text,
				style: {
					animationDirection: props.reverse ? 'reverse' : undefined,
				},
			}, slots.default?.()))),
		]);
	},
});
</script>

<style lang="scss" module>
.wrap {
	overflow: clip;
	animation-play-state: running;

	&:hover {
		animation-play-state: paused;
	}
}

.content {
	display: inline-block;
	white-space: nowrap;
	animation-play-state: inherit;
}

.text {
	display: inline-block;
	animation-name: marquee;
	animation-timing-function: linear;
	animation-iteration-count: infinite;
	animation-duration: inherit;
	animation-play-state: inherit;
}

.paused .text {
	animation-play-state: paused;
}

@keyframes marquee {
	0% { transform: translateX(0); }
	100% { transform: translateX(-100%); }
}
</style>
