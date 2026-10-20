<!--
SPDX-FileCopyrightText: syuilo and other misskey contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<PageWithHeader :actions="headerActions" :tabs="headerTabs">
	<div style="overflow: clip;">
		<div class="_spacer" style="--MI_SPACER-w: 600px; --MI_SPACER-min: 20px;">
			<div class="_gaps_m znqjceqz">
				<div v-panel class="about">
					<div ref="containerEl" class="container" :class="{ playing: easterEggEngine != null }">
						<img src="/client-assets/about-icon.png" alt="" class="icon" draggable="false" @load="iconLoaded" @click="gravity"/>
						<div class="misskey">Sharkey</div>
						<div class="version">v{{ version }}</div>
						<span v-for="emoji in easterEggEmojis" :key="emoji.id" class="emoji" :data-physics-x="emoji.left" :data-physics-y="emoji.top" :class="{ _physics_circle_: !emoji.emoji.startsWith(':') }">
							<MkCustomEmoji v-if="emoji.emoji[0] === ':'" class="emoji" :name="emoji.emoji" :normal="true" :noStyle="true" :fallbackToImage="true"/>
							<MkEmoji v-else class="emoji unicode" :emoji="emoji.emoji" :normal="true" :noStyle="true"/>
						</span>
					</div>
					<button v-if="thereIsTreasure" class="_button treasure" @click="getTreasure"><img src="/fluent-emoji/1f3c6.png" class="treasureImg"></button>
				</div>
				<div style="text-align: center;">
					{{ skStrings.aboutSharkeyDescription }}<br><a href="https://joinsharkey.org/" target="_blank" rel="noopener" class="_link">{{ i18n.ts.learnMore }}</a>
				</div>
				<div v-if="$i != null" style="text-align: center;">
					<MkButton primary rounded inline @click="iLoveSharkey">I <Mfm text="$[jelly ❤]"/> #Sharkey</MkButton>
				</div>
				<FormSection v-if="instance.repositoryUrl !== SHARKEY_REPOSITORY">
					<div class="_gaps_s">
						<MkInfo>
							{{ i18n.tsx._aboutMisskey.thisIsModifiedVersion({ name: instance.name ?? host }) }}
						</MkInfo>
						<FormLink v-if="instance.repositoryUrl" :to="instance.repositoryUrl" external>
							<template #icon><i class="ti ti-code"></i></template>
							{{ i18n.ts._aboutMisskey.source }}
						</FormLink>
						<FormLink v-if="instance.providesTarball" :to="`/tarball/sharkey-${version}.tar.gz`" external>
							<template #icon><i class="ti ti-download"></i></template>
							{{ i18n.ts._aboutMisskey.source }}
							<template #suffix>Tarball</template>
						</FormLink>
						<MkInfo v-if="!instance.repositoryUrl && !instance.providesTarball" warn>
							{{ i18n.ts.sourceCodeIsNotYetProvided }}
						</MkInfo>
					</div>
				</FormSection>
				<FormSection>
					<div class="_gaps_s">
						<FormLink :to="SHARKEY_REPOSITORY" external>
							<template #icon><i class="ti ti-code"></i></template>
							{{ skStrings.aboutSharkeySource }}
							<template #suffix>GitLab</template>
						</FormLink>
						<FormLink to="https://opencollective.com/sharkey" external>
							<template #icon><i class="ti ti-pig-money"></i></template>
							{{ skStrings.aboutSharkeyDonate }}
							<template #suffix>OpenCollective</template>
						</FormLink>
					</div>
				</FormSection>
				<FormSection>
					<div class="_gaps_s">
						<FormLink to="https://github.com/misskey-dev/misskey" external>
							<template #icon><i class="ti ti-code"></i></template>
							{{ i18n.ts._aboutMisskey.source }} ({{ i18n.ts._aboutMisskey.original }})
							<template #suffix>GitHub</template>
						</FormLink>
						<FormLink to="https://www.patreon.com/syuilo" external>
							<template #icon><i class="ti ti-pig-money"></i></template>
							{{ i18n.ts._aboutMisskey.donate }}
							<template #suffix>Patreon</template>
						</FormLink>
					</div>
				</FormSection>
				<FormSection v-for="section in everyone" :key="section.heading">
					<template #label>{{ section.heading }}</template>
					<div :class="$style.contributors" style="margin-bottom: 8px;">
						<a v-for="person in section.people" :key="person.handle" :href="person.link" target="_blank" rel="noopener" :class="$style.contributor">
							<img :src="person.avatar" :class="$style.contributorAvatar">
							<span :class="$style.contributorUsername">{{ person.handle }}</span>
						</a>
					</div>
					<template v-if="section.link" #description><MkLink :url="section.link.url">{{ section.link.label }}</MkLink></template>
				</FormSection>
			</div>
		</div>
	</div>
</PageWithHeader>
</template>

<script lang="ts" setup>
import { nextTick, onBeforeUnmount, onMounted, ref, computed, useTemplateRef } from 'vue';
import { host, version } from '@@/js/config.js';
import { DEFAULT_EMOJIS } from '@@/js/const.js';
import FormLink from '@/components/form/link.vue';
import FormSection from '@/components/form/section.vue';
import MkButton from '@/components/MkButton.vue';
import MkLink from '@/components/MkLink.vue';
import MkInfo from '@/components/MkInfo.vue';
import { physics } from '@/utility/physics.js';
import { i18n } from '@/i18n.js';
import { instance } from '@/instance.js';
import * as os from '@/os.js';
import { misskeyApi } from '@/utility/misskey-api.js';
import { claimAchievement, claimedAchievements } from '@/utility/achievements.js';
import { $i } from '@/i.js';
import { definePage } from '@/page.js';
import { prefer } from '@/preferences.js';
import { skStrings } from '@/utility/sk-strings.js';
import { shuffled, sponsorsToPeople } from '@/utility/sk-static-pages.js';
import type { SponsorData } from '@/utility/sk-static-pages.js';

const SHARKEY_REPOSITORY = 'https://activitypub.software/TransFem-org/Sharkey/';

type Section = {
	heading: string,
	link?: {
		label: string,
		url: string,
	},
	people: {
		handle: string,
		avatar: string,
		link?: string
	}[],
};

const thereIsTreasure = ref($i && !claimedAchievements.includes('foundTreasure'));

let easterEggReady = false;
const easterEggEmojis = ref<{
	id: string,
	top: number,
	left: number,
	emoji: string
}[]>([]);
const easterEggEngine = ref<{ stop: () => void } | null>(null);
const everyone = ref<Section[]>([
	{
		heading: i18n.ts._aboutMisskey.projectMembers,
		link: {
			label: i18n.ts._aboutMisskey.allContributors,
			url: 'https://activitypub.software/TransFem-org/Sharkey/-/graphs/develop',
		},
		people: shuffled([
			{
				handle: '@CenTdemeern1',
				avatar: 'https://secure.gravatar.com/avatar/e97dd57d32caf703cea556ace6304617b7420f17f5b1aac4a1eea8e4234735bb?s=128&d=identicon',
				link: 'https://activitypub.software/CenTdemeern1',
			},
			{
				handle: '@dakkar',
				avatar: 'https://secure.gravatar.com/avatar/c71b315eed7c63ff94c42b1b3e8dbad1?s=128&d=identicon',
				link: 'https://activitypub.software/dakkar',
			},
			{
				handle: '@hazelnoot',
				avatar: 'https://activitypub.software/uploads/-/system/user/avatar/5/avatar.png?width=128',
				link: 'https://activitypub.software/fEmber',
			},
			{
				handle: '@julia',
				avatar: 'https://activitypub.software/uploads/-/system/user/avatar/41/avatar.png?width=128',
				link: 'https://activitypub.software/julia',
			},
			{
				handle: '@Luna',
				avatar: 'https://secure.gravatar.com/avatar/4faf37df86a3d93a6c19ed6abf8588eade4efb837410dbbc53021b4fd12eaae7?s=128&d=identicon',
				link: 'https://activitypub.software/luna',
			},
			{
				handle: '@Marie',
				avatar: 'https://activitypub.software/uploads/-/system/user/avatar/2/avatar.png?width=128',
				link: 'https://activitypub.software/marie',
			},
			{
				handle: '@supakaity',
				avatar: 'https://activitypub.software/uploads/-/system/user/avatar/65/avatar.png?width=128',
				link: 'https://activitypub.software/supakaity',
			},
			{
				handle: '@tess',
				avatar: 'https://activitypub.software/uploads/-/system/user/avatar/132/avatar.png?width=128',
				link: 'https://activitypub.software/tess',
			},
			{
				handle: '@bunnybeam',
				avatar: 'https://secure.gravatar.com/avatar/25736ba5847665e58884874e87042324e9233885263cb982bfa19f667b8304ae?s=128&d=identicon',
				link: 'https://activitypub.software/bunnybeam',
			},
		]),
	},
	{
		heading: skStrings.aboutSharkeyTesters,
		people: [
			{
				handle: '@lucent',
				avatar: 'https://antani.cyou/proxy/avatar.webp?url=https%3A%2F%2Fantani.cyou%2Ffiles%2Fa2944119-024c-4abd-86e5-64bf0d30b26f&avatar=1',
				link: 'https://antani.cyou/@lucent',
			},
			{
				handle: '@privateger',
				avatar: 'https://mediaproxy.plasmatrap.com/?url=https%3A%2F%2Fplasmatrap.com%2Ffiles%2F2cf35a8f-6520-4d4c-9611-bf22ee983293&avatar=1',
				link: 'https://plasmatrap.com/@privateger',
			},
			{
				handle: '@phoenix_fairy',
				avatar: 'https://thetransagenda.gay/proxy/avatar.webp?url=https%3A%2F%2Fs3.us-east-005.backblazeb2.com%2Ftranssharkey%2Fnull%2Fd93ac6dc-2020-4b5a-bce7-84b41e97a0ac.png&avatar=1',
				link: 'https://thetransagenda.gay/@phoenix_fairy',
			},
		],
	},
	{
		heading: skStrings.aboutSharkeyMisskeyContributors,
		people: [
			{
				handle: '@syuilo',
				avatar: 'https://avatars.githubusercontent.com/u/4439005?s=128&v=4',
				link: 'https://github.com/syuilo',
			},
			{
				handle: '@tamaina',
				avatar: 'https://avatars.githubusercontent.com/u/7973572?s=128&v=4',
				link: 'https://github.com/tamaina',
			},
			{
				handle: '@acid-chicken',
				avatar: 'https://avatars.githubusercontent.com/u/20679825?s=128&v=4',
				link: 'https://github.com/acid-chicken',
			},
			{
				handle: '@mei23',
				avatar: 'https://avatars.githubusercontent.com/u/30769358?s=128&v=4',
				link: 'https://github.com/mei23',
			},
			{
				handle: '@AyaMorisawa',
				avatar: 'https://avatars.githubusercontent.com/u/10798641?s=128&v=4',
				link: 'https://github.com/AyaMorisawa',
			},
			{
				handle: '@kakkokari-gtyih',
				avatar: 'https://avatars.githubusercontent.com/u/67428053?s=128&v=4',
				link: 'https://github.com/kakkokari-gtyih',
			},
			{
				handle: '@tai-cha',
				avatar: 'https://avatars.githubusercontent.com/u/40626578?s=128&v=4',
				link: 'https://github.com/tai-cha',
			},
			{
				handle: '@Johann150',
				avatar: 'https://avatars.githubusercontent.com/u/20990607?s=128&v=4',
				link: 'https://github.com/Johann150',
			},
			{
				handle: '@anatawa12',
				avatar: 'https://avatars.githubusercontent.com/u/22656849?s=128&v=4',
				link: 'https://github.com/anatawa12',
			},
			{
				handle: '@saschanaz',
				avatar: 'https://avatars.githubusercontent.com/u/3396686?s=128&v=4',
				link: 'https://github.com/saschanaz',
			},
			{
				handle: '@zyoshoka',
				avatar: 'https://avatars.githubusercontent.com/u/107108195?s=128&v=4',
				link: 'https://github.com/zyoshoka',
			},
			{
				handle: '@samunohito',
				avatar: 'https://avatars.githubusercontent.com/u/46447427?s=128&v=4',
				link: 'https://github.com/samunohito',
			},
		],
	},
]);
const containerEl = useTemplateRef('containerEl');

// `sponsors` is a Sharkey endpoint, absent from misskey-js (and stock Misskey). A failure just hides the section.
const sponsorsApi = misskeyApi as unknown as (endpoint: string, body: object) => Promise<{ sponsor_data: SponsorData[] }>;

onMounted(async () => {
	try {
		const res = await sponsorsApi('sponsors', { forceUpdate: false });
		everyone.value.push({
			heading: skStrings.aboutSharkeySponsors,
			people: sponsorsToPeople(res.sponsor_data),
		});
	} catch {
		// endpoint missing or unreachable; leave the section out
	}
});

function iconLoaded() {
	if (containerEl.value == null) return;
	const emojis = [...(prefer.s.emojiPalettes[0]?.emojis ?? [])];

	if (emojis.length < DEFAULT_EMOJIS.length) {
		emojis.push(...DEFAULT_EMOJIS.slice(0, DEFAULT_EMOJIS.length - emojis.length));
	}

	const containerWidth = containerEl.value.offsetWidth;
	for (let i = 0; i < 32; i++) {
		easterEggEmojis.value.push({
			id: i.toString(),
			top: -(128 + (Math.random() * 256)),
			left: (Math.random() * containerWidth),
			emoji: emojis[Math.floor(Math.random() * emojis.length)],
		});
	}

	nextTick(() => {
		easterEggReady = true;
	});
}

function gravity() {
	if (containerEl.value == null) return;
	if (!easterEggReady) return;
	easterEggReady = false;
	easterEggEngine.value = physics(containerEl.value);
}

function iLoveSharkey() {
	os.post({
		initialText: 'I $[jelly ❤] #Sharkey',
		instant: true,
	});
}

function getTreasure() {
	thereIsTreasure.value = false;
	claimAchievement('foundTreasure');
}

onBeforeUnmount(() => {
	if (easterEggEngine.value) {
		easterEggEngine.value.stop();
	}
});

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePage(() => ({
	title: skStrings.aboutSharkey,
}));
</script>

<style lang="scss" scoped>
.znqjceqz {
	> .about {
		position: relative;
		border-radius: var(--MI-radius);

		> .treasure {
			position: absolute;
			top: 60px;
			left: 0;
			right: 0;
			margin: 0 auto;
			width: min-content;

			> .treasureImg {
				width: 25px;
				vertical-align: bottom;
			}
		}

		> .container {
			position: relative;
			text-align: center;
			padding: 16px;

			&.playing {
				&, * {
					user-select: none;
				}

				* {
					will-change: transform;
				}

				> .emoji {
					visibility: visible;
				}
			}

			> .icon {
				display: block;
				width: 80px;
				margin: 0 auto;
				border-radius: var(--MI-radius-md);
				position: relative;
				z-index: 1;
				transform: translateX(-10%);
			}

			> .misskey {
				margin: 0.75em auto 0 auto;
				width: max-content;
				position: relative;
				z-index: 1;
			}

			> .version {
				margin: 0 auto;
				width: max-content;
				opacity: 0.5;
				position: relative;
				z-index: 1;
			}

			> .emoji {
				position: absolute;
				z-index: 1;
				top: 0;
				left: 0;
				visibility: hidden;

				> .emoji {
					pointer-events: none;
					font-size: 24px;
					width: 24px;
				}
			}
		}
	}
}
</style>

<style lang="scss" module>
.contributors {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
	grid-gap: 12px;
}

.contributor {
	display: flex;
	align-items: center;
	padding: 12px;
	background: var(--MI_THEME-buttonBg);
	border-radius: var(--MI-radius-sm);

	&:hover {
		text-decoration: none;
		background: var(--MI_THEME-buttonHoverBg);
	}

	&.active {
		color: var(--MI_THEME-accent);
		background: var(--MI_THEME-buttonHoverBg);
	}
}

.contributorAvatar {
	width: 30px;
	border-radius: var(--MI-radius-full);
}

.contributorUsername {
	margin-left: 12px;
}
</style>
