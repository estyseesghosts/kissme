<!--
SPDX-FileCopyrightText: marie and other Sharkey contributors
SPDX-License-Identifier: AGPL-3.0-only

Displays a sub-note in the Sharkey style. Used to display secondary notes in a given context.

For example, when viewing a reply on the timeline, SkNoteSub will be used to display the note that is being replied to.
-->

<template>
<SkMutedNote v-show="!isDeleted" ref="rootComp" :note="appearNote" :mutedClass="$style.muted" :expandedClass="[$style.root, { [$style.children]: depth > 1, [$style.isReply]: props.isReply, [$style.detailed]: props.detailed }]" @expandMute="n => emit('expandMute', n)">
	<div v-if="!hideLine" :class="$style.line"></div>
	<div :class="$style.main">
		<div v-if="note.channel" :class="$style.colorBar" :style="{ background: note.channel.color }"></div>
		<!-- new avatar container with line (post section) -->
		<div :class="$style.avatarContainer">
			<MkAvatar :class="$style.avatar" :user="note.user" link preview/>
			<template v-if="note.repliesCount > 0 && replies.length > 0">
				<div v-if="hideLine" :class="$style.threadLine"></div>
			</template>
		</div>
		<!-- end new avatar container -->
		<div :class="$style.body">
			<SkNoteHeader :class="$style.header" :note="note" :classic="true"/>
			<div :class="$style.content">
				<p v-if="appearNote.cw != null" :class="$style.cw">
					<Mfm v-if="appearNote.cw != ''" style="margin-right: 8px;" :text="appearNote.cw" :isBlock="true" :author="note.user" :nyaize="'respect'"/>
					<MkCwButton v-model="showContent" :text="note.text" :files="note.files" :poll="note.poll"/>
				</p>
				<div v-show="appearNote.cw == null || showContent">
					<MkSubNoteContent :class="$style.text" :note="note" :translating="translating" :translation="translation" :expandAllCws="props.expandAllCws"/>
				</div>
			</div>
			<SkReactionsViewer ref="reactionsViewer" :note="reactionNote" :mutedEmojis="prefer.s.mutedEmojis" @toggleEmojiMute="onToggleEmojiMute"/>
			<footer :class="$style.footer" class="_gaps _h_gaps" tabindex="0" role="group" :aria-label="skStrings.noteFooterLabel">
				<button class="_button" :class="$style.noteFooterButton" @click="reply()">
					<i class="ti ti-arrow-back-up"></i>
					<p v-if="note.repliesCount > 0" :class="$style.noteFooterButtonCount">{{ note.repliesCount }}</p>
				</button>
				<button
					v-if="canRenote"
					ref="renoteButton"
					v-tooltip="renoteTooltip"
					class="_button"
					:class="$style.noteFooterButton"
					:style="appearNote.isRenoted ? 'color: var(--MI_THEME-accent) !important;' : ''"
					@click.stop="appearNote.isRenoted ? undoRenote() : boostVisibility($event.shiftKey)"
				>
					<i class="ti ti-rocket"></i>
					<p v-if="note.renoteCount > 0" :class="$style.noteFooterButtonCount">{{ note.renoteCount }}</p>
				</button>
				<button
					v-if="canRenote && !rejectQuotes"
					ref="quoteButton"
					class="_button"
					:class="$style.noteFooterButton"
					@click.stop="quote()"
				>
					<i class="ti ti-quote"></i>
				</button>
				<button v-else class="_button" :class="$style.noteFooterButton" disabled>
					<i class="ti ti-ban"></i>
				</button>
				<button v-if="$note.myReaction == null && note.reactionAcceptance !== 'likeOnly'" ref="likeButton" :class="$style.noteFooterButton" class="_button" @click.stop="like()">
					<i class="ti ti-heart"></i>
				</button>
				<button v-if="$note.myReaction == null" ref="reactButton" :class="$style.noteFooterButton" class="_button" @click.stop="react()">
					<i v-if="note.reactionAcceptance === 'likeOnly'" class="ti ti-heart"></i>
					<i v-else class="ti ti-mood-smile"></i>
				</button>
				<button v-if="$note.myReaction != null" ref="reactButton" class="_button" :class="[$style.noteFooterButton, $style.reacted]" @click="undoReact()">
					<i class="ti ti-minus"></i>
				</button>
				<button v-if="prefer.s.showClipButtonInNoteFooter" ref="clipButton" :class="$style.noteFooterButton" class="_button" @click.stop="clip()">
					<i class="ti ti-paperclip"></i>
				</button>
				<button v-if="prefer.s.showTranslationButtonInNoteFooter && policies.canUseTranslator && instance.translatorAvailable" ref="translationButton" class="_button" :class="$style.noteFooterButton" :disabled="translating || !!translation" @click.stop="translate()">
					<i class="ti ti-language-hiragana"></i>
				</button>
				<button ref="menuButton" class="_button" :class="$style.noteFooterButton" @click.stop="menu()">
					<i class="ti ti-dots"></i>
				</button>
			</footer>
		</div>
	</div>
	<template v-if="depth < prefer.s.numberOfReplies">
		<SkNoteSub v-for="reply in replies" :key="reply.id" :note="reply" :class="[$style.reply, { [$style.single]: replies.length === 1 }]" :detail="true" :depth="depth + 1" :expandAllCws="props.expandAllCws" :onDeleteCallback="removeReply" :isReply="props.isReply" @expandMute="n => emit('expandMute', n)"/>
	</template>
	<div v-else :class="$style.more">
		<MkA class="_link" :to="notePage(note)">{{ i18n.ts.continueThread }} <i class="ti ti-chevron-double-right"></i></MkA>
	</div>
</SkMutedNote>
</template>

<script lang="ts" setup>
import { computed, inject, ref, shallowRef, useTemplateRef, watch } from 'vue';
import * as Misskey from 'misskey-js';
import * as config from '@@/js/config.js';
import type { Ref } from 'vue';
import type { Visibility } from '@/utility/boost-quote.js';
import type { OpenOnRemoteOptions } from '@/utility/please-login.js';
import SkNoteSub from '@/components/SkNoteSub.vue';
import SkNoteHeader from '@/components/SkNoteHeader.vue';
import SkReactionsViewer from '@/components/SkReactionsViewer.vue';
import { onToggleEmojiMute } from '@/utility/sk-emoji-mute.js';
import { likeNoteWithFeedback } from '@/utility/sk-like.js';
import MkSubNoteContent from '@/components/MkSubNoteContent.vue';
import MkCwButton from '@/components/MkCwButton.vue';
import { notePage } from '@/filters/note.js';
import * as os from '@/os.js';
import * as sound from '@/utility/sound.js';
import { misskeyApi } from '@/utility/misskey-api.js';
import { i18n } from '@/i18n.js';
import { $i } from '@/i.js';
import { pleaseLogin } from '@/utility/please-login.js';
import { showMovedDialog } from '@/utility/show-moved-dialog.js';
import MkRippleEffect from '@/components/MkRippleEffect.vue';
import { reactionPicker } from '@/utility/reaction-picker.js';
import { claimAchievement } from '@/utility/achievements.js';
import { getNoteClipMenu, getNoteMenu } from '@/utility/get-note-menu.js';
import { translateNote } from '@/utility/translate-note.js';
import { boostMenuItems, computeRenoteTooltip } from '@/utility/boost-quote.js';
import { prefer } from '@/preferences.js';
import { noteEvents, useNoteCapture } from '@/composables/use-note-capture.js';
import { useGlobalEvent } from '@/events.js';
import SkMutedNote from '@/components/SkMutedNote.vue';
import { instance, policies } from '@/instance.js';
import { getAppearNote } from '@/utility/get-appear-note.js';
import { setupNoteViewInterruptors } from '@/plugin.js';
import { deepClone } from '@/utility/clone.js';
import { skStrings } from '@/utility/sk-strings.js';

/*
	Sharkey strings that Misskey's en-US.yml does not have yet. Locale edits are restricted
	(ja-JP only) by the port plan, so they live here until Crowdin syncs them into locales.
	See docs/sk-port/MISSING-STRINGS.md.
*/

const props = withDefaults(defineProps<{
	note: Misskey.entities.Note;
	detail?: boolean;
	expandAllCws?: boolean;
	onDeleteCallback?: (id: Misskey.entities.Note['id']) => void;

	// how many notes are in between this one and the note being viewed in detail
	depth?: number;

	isReply?: boolean;
	detailed?: boolean;
}>(), {
	depth: 1,
	isReply: false,
	detailed: false,
	onDeleteCallback: undefined,
});

const emit = defineEmits<{
	(ev: 'expandMute', note: Misskey.entities.Note): void;
}>();

const note = ref(deepClone(props.note));

// isRenoted is a Sharkey field that the Misskey Note entity does not declare.
type SkNote = Misskey.entities.Note & { isRenoted?: boolean };
const appearNote = computed<SkNote>(() => getAppearNote(note.value) ?? note.value);
// SkReactionsViewer wants a whole Note; overlay the live-captured reaction fields on it
const reactionNote = computed(() => ({ ...appearNote.value, ...$note }) as Misskey.entities.Note);

const canRenote = computed(() => ['public', 'home'].includes(appearNote.value.visibility) || appearNote.value.userId === $i?.id);
const hideLine = computed(() => props.detail);

// rejectQuotes is a Sharkey user setting that misskey-js's MeDetailed does not define.
const rejectQuotes = computed(() => Reflect.get($i ?? {}, 'rejectQuotes') === true);

const el = shallowRef<HTMLElement>();
const translation = ref<Misskey.entities.NotesTranslateResponse | null>(null);
const translating = ref(false);
const isDeleted = ref(false);
const reactButton = shallowRef<HTMLElement>();
const clipButton = useTemplateRef('clipButton');
const renoteButton = shallowRef<HTMLElement>();
const quoteButton = shallowRef<HTMLElement>();
const menuButton = shallowRef<HTMLElement>();
const likeButton = shallowRef<HTMLElement>();

const renoteTooltip = computeRenoteTooltip(appearNote);

const defaultLike = computed(() => prefer.s.like ? prefer.s.like : null);
const replies = ref<Misskey.entities.Note[]>([]);

const pleaseLoginContext = computed<OpenOnRemoteOptions>(() => ({
	type: 'lookup',
	url: appearNote.value.url ?? appearNote.value.uri ?? `${config.url}/notes/${appearNote.value.id}`,
}));

const currentClip = inject<Ref<Misskey.entities.Clip> | null>('currentClip', null);

setupNoteViewInterruptors(note, isDeleted);

// Live reactions and my-reaction state are read from the captured copy.
const { $note } = useNoteCapture({
	note: appearNote.value,
	parentNote: null,
});

// Replaces the Sharkey useNoteCapture delete callback. Sharkey's version also appended live replies
// (onReplyCallback), which the Misskey composable does not expose, so only deletion is wired here.
useGlobalEvent('noteDeleted', (noteId) => {
	if (noteId !== note.value.id && noteId !== appearNote.value.id) return;
	isDeleted.value = true;
	if (props.detail && props.depth < prefer.s.numberOfReplies) {
		props.onDeleteCallback?.(note.value.id);
	}
});

async function removeReply(id: Misskey.entities.Note['id']) {
	const replyIdx = replies.value.findIndex(reply => reply.id === id);
	if (replyIdx >= 0) {
		replies.value.splice(replyIdx, 1);
		appearNote.value.repliesCount -= 1;
	}
}

function focus() {
	el.value?.focus();
}

async function reply(): Promise<void> {
	pleaseLogin({ openOnRemote: pleaseLoginContext.value });
	showMovedDialog();
	await os.post({
		reply: appearNote.value,
		channel: appearNote.value.channel ?? undefined,
	});
	focus();
}

function react(): void {
	pleaseLogin({ openOnRemote: pleaseLoginContext.value });
	showMovedDialog();
	if (appearNote.value.reactionAcceptance === 'likeOnly') {
		sound.playMisskeySfx('reaction');

		void likeNoteWithFeedback(appearNote.value, defaultLike.value);
		const el = reactButton.value as HTMLElement | null | undefined;
		if (el) {
			const rect = el.getBoundingClientRect();
			const x = rect.left + (el.offsetWidth / 2);
			const y = rect.top + (el.offsetHeight / 2);
			const { dispose } = os.popup(MkRippleEffect, { x, y }, {
				end: () => dispose(),
			});
		}
	} else {
		blur();
		reactionPicker.show(reactButton.value ?? null, note.value, async (reaction) => {
			if (prefer.s.confirmOnReact) {
				const confirm = await os.confirm({
					type: 'question',
					text: i18n.tsx.reactAreYouSure({ emoji: reaction.replace('@.', '') }),
				});

				if (confirm.canceled) return;
			}

			sound.playMisskeySfx('reaction');

			misskeyApi('notes/reactions/create', {
				noteId: appearNote.value.id,
				reaction: reaction,
			}).then(() => {
				// Immediate local update (stock MkNote parity); the stream echo is deduped.
				if ($i) noteEvents.emit(`reacted:${appearNote.value.id}`, { userId: $i.id, reaction });
			});
			if (appearNote.value.text && appearNote.value.text.length > 100 && (Date.now() - new Date(appearNote.value.createdAt).getTime() < 1000 * 3)) {
				claimAchievement('reactWithoutRead');
			}
		}, () => {
			focus();
		});
	}
}

function like(): void {
	pleaseLogin({ openOnRemote: pleaseLoginContext.value });
	showMovedDialog();
	sound.playMisskeySfx('reaction');
	void likeNoteWithFeedback(appearNote.value, defaultLike.value);
	const el = likeButton.value as HTMLElement | null | undefined;
	if (el) {
		const rect = el.getBoundingClientRect();
		const x = rect.left + (el.offsetWidth / 2);
		const y = rect.top + (el.offsetHeight / 2);
		const { dispose } = os.popup(MkRippleEffect, { x, y }, {
			end: () => dispose(),
		});
	}
}

function undoReact(): void {
	const oldReaction = $note.myReaction;
	if (!oldReaction) return;
	misskeyApi('notes/reactions/delete', {
		noteId: appearNote.value.id,
	}).then(() => {
		if ($i) noteEvents.emit(`unreacted:${appearNote.value.id}`, { userId: $i.id, reaction: oldReaction });
	});
}

function undoRenote() : void {
	if (!appearNote.value.isRenoted) return;
	misskeyApi('notes/unrenote', {
		noteId: appearNote.value.id,
	});
	os.toast(skStrings.rmboost);
	appearNote.value.isRenoted = false;

	const el = renoteButton.value as HTMLElement | null | undefined;
	if (el) {
		const rect = el.getBoundingClientRect();
		const x = rect.left + (el.offsetWidth / 2);
		const y = rect.top + (el.offsetHeight / 2);
		const { dispose } = os.popup(MkRippleEffect, { x, y }, {
			end: () => dispose(),
		});
	}
}

let showContent = ref(prefer.s.uncollapseCW);

watch(() => props.expandAllCws, (expandAllCws) => {
	if (expandAllCws !== showContent.value) showContent.value = expandAllCws;
});

function boostVisibility(forceMenu: boolean = false) {
	if (!prefer.s.showVisibilitySelectorOnBoost && !forceMenu) {
		renote(prefer.s.visibilityOnBoost);
	} else {
		os.popupMenu(boostMenuItems(appearNote, renote), renoteButton.value);
	}
}

function renote(visibility: Visibility, localOnly: boolean = false) {
	pleaseLogin({ openOnRemote: pleaseLoginContext.value });
	showMovedDialog();

	if (appearNote.value.channel) {
		const el = renoteButton.value as HTMLElement | null | undefined;
		if (el) {
			const rect = el.getBoundingClientRect();
			const x = rect.left + (el.offsetWidth / 2);
			const y = rect.top + (el.offsetHeight / 2);
			const { dispose } = os.popup(MkRippleEffect, { x, y }, {
				end: () => dispose(),
			});
		}

		misskeyApi('notes/create', {
			renoteId: appearNote.value.id,
			channelId: appearNote.value.channelId,
		}).then(() => {
			os.toast(i18n.ts.renoted);
			appearNote.value.isRenoted = true;
		});
	} else {
		const el = renoteButton.value as HTMLElement | null | undefined;
		if (el) {
			const rect = el.getBoundingClientRect();
			const x = rect.left + (el.offsetWidth / 2);
			const y = rect.top + (el.offsetHeight / 2);
			const { dispose } = os.popup(MkRippleEffect, { x, y }, {
				end: () => dispose(),
			});
		}

		misskeyApi('notes/create', {
			renoteId: appearNote.value.id,
			localOnly: localOnly,
			visibility: visibility,
		}).then(() => {
			os.toast(i18n.ts.renoted);
			appearNote.value.isRenoted = true;
		});
	}
}

function quote() {
	pleaseLogin({ openOnRemote: pleaseLoginContext.value });
	showMovedDialog();

	// Target os.post() resolves to void and does not report cancellation, so the renotes check runs regardless.
	os.post({
		renote: appearNote.value,
		channel: appearNote.value.channel ?? undefined,
	}).then(() => {
		misskeyApi('notes/renotes', {
			noteId: appearNote.value.id,
			userId: $i?.id,
			limit: 1,
			quote: true,
		}).then((res) => {
			if (!(res.length > 0)) return;
			const popupEl = quoteButton.value as HTMLElement | null | undefined;
			if (popupEl && res.length > 0) {
				const rect = popupEl.getBoundingClientRect();
				const x = rect.left + (popupEl.offsetWidth / 2);
				const y = rect.top + (popupEl.offsetHeight / 2);
				const { dispose } = os.popup(MkRippleEffect, { x, y }, {
					end: () => dispose(),
				});
			}

			os.toast(skStrings.quoted);
		});
	});
}

function menu(): void {
	const { menu, cleanup } = getNoteMenu({ note: appearNote.value, translating, translation });
	os.popupMenu(menu, menuButton.value).then(focus).finally(cleanup);
}

async function clip(): Promise<void> {
	os.popupMenu(await getNoteClipMenu({ note: appearNote.value, currentClip: currentClip?.value }), clipButton.value).then(focus);
}

async function translate() {
	await translateNote(appearNote.value.id, translation, translating);
}

if (props.detail) {
	misskeyApi('notes/children', {
		noteId: appearNote.value.id,
		limit: prefer.s.numberOfReplies,
		showQuotes: false,
	}).then(res => {
		replies.value = res;
	});
}
</script>

<style lang="scss" module>
.root {
	padding: 28px 32px;
	position: relative;

	--reply-indent: calc(.5 * var(--MI-avatar));

	&.children {
		padding: 10px 0 0 8px;
	}

	&.isReply {
		/* @link https://utopia.fyi/clamp/calculator?a=450,580,26—36 */
		--MI-avatar: clamp(26px, -8.6154px + 7.6923cqi, 36px);
	}
}

.line {
	position: absolute;
	left: calc(32px + .5 * var(--MI-avatar));
	// using solid instead of dotted, stylelistic choice
	border-left: var(--MI-thread-width) solid var(--MI_THEME-thread);
	top: calc(28px + var(--MI-avatar)); // 28px of .root padding, plus 58px of avatar height (see SkNote)
	bottom: -28px;
}

.footer {
	display: flex;
	align-items: center;
	justify-content: flex-start;
	position: relative;
	z-index: 1;
	margin-top: 0.4em;
	overflow-x: auto;
}

.main {
	position: relative;
	display:  flex;

	:is(.detailed, .isReply) &::after {
		content: "";
		position: absolute;
		top: -12px;
		right: -12px;
		left: -12px;
		bottom: -12px;
		background: var(--MI_THEME-panelHighlight);
		border-radius: var(--MI-radius);
		opacity: 0;
		transition: opacity .2s, background .2s;
		z-index: -1;
	}

	:is(.detailed, .isReply) &:hover::after,
	:is(.detailed, .isReply) &:focus-within::after {
		opacity: 1;
	}
}

.colorBar {
	position: absolute;
	top: 8px;
	left: 8px;
	width: 5px;
	height: calc(100% - 8px);
	border-radius: var(--MI-radius-ellipse);
	pointer-events: none;
}

.avatar {
	flex-shrink: 0;
	display: block;
	margin: 0 14px 0 0;
	width: var(--MI-avatar);
	height: var(--MI-avatar);
	border-radius: var(--MI-radius-sm);
}

.body {
	flex: 1;
	min-width: 0;
}

.content {
	overflow: hidden;
}

.text {
	margin: 0;
	padding: 0;
}

.header {
	margin-bottom: 2px;
}

.noteFooterButton {
	margin: 0;
	padding: 8px;
	padding-top: 10px;
	opacity: 0.7;

	&:hover {
		color: var(--MI_THEME-fgHighlighted);
	}
}
// Responsible for Reply borders 448 and 508
.reply, .more {
	//border-left: solid 0.5px var(--MI_THEME-divider);
	margin-top: 10px;
}

.more {
	padding: 10px 0 0 16px;
}

@container (max-width: 580px) {
	.root {
		padding: 28px 26px 0;
		--MI-avatar: 46px;
	}

	.line {
		left: calc(26px + .5 * var(--MI-avatar));
	}
}

@container (max-width: 500px) {
	.root {
		padding: 23px 25px;
	}

	.line {
		top: calc(23px + var(--MI-avatar));
		left: calc(25px + .5 * var(--MI-avatar));
	}
}

.noteFooterButtonCount {
	display: inline;
	margin: 0 0 0 8px;
	opacity: 0.7;

	&.reacted {
		color: var(--MI_THEME-accent);
	}
}

.cw {
	display: block;
	margin: 0;
	padding: 0;
	overflow-wrap: break-word;
}

.text {
	margin: 0;
	padding: 0;
}

.reply, .more {
	//border-left: solid 0.5px var(--MI_THEME-divider);
	margin-top: 10px;
}

.more {
	padding: 10px 0 0 16px;
}

@container (max-width: 480px) {
	.root {
		padding: 22px 24px;
	}

	.line {
		top: calc(22px + var(--MI-avatar));
		left: calc(24px + .5 * var(--MI-avatar));
	}
}

@container (max-width: 450px) {
	.root {
		--MI-avatar: 44px;
	}
}

.muted {
	border: 1px solid var(--MI_THEME-divider);
	margin: 8px 8px 0 8px;
	border-radius: var(--MI-radius-sm);
}

// avatar container with line
.avatarContainer {
	display: flex;
	flex-direction: column;
}

.threadLine {
	width: 0;
	flex-grow: 1;
	border-left: var(--MI-thread-width) solid var(--MI_THEME-thread);
	margin-left: var(--reply-indent);
}

.reply {
	margin-left: var(--reply-indent);
}

.reply:not(:last-child) {
	border-left: var(--MI-thread-width) solid var(--MI_THEME-thread);

	&::before {
		left: calc(-1 * var(--MI-thread-width));
	}
}

.reply::before {
	position: absolute;
	content: '';
	left: 0px;
	top: -10px;
	height: calc(10px + 10px + .5 * var(--MI-avatar));
	width: 15px;
	border-left: var(--MI-thread-width) solid var(--MI_THEME-thread);
	border-bottom: var(--MI-thread-width) solid var(--MI_THEME-thread);
	border-bottom-left-radius: 15px;
}

.single {
	margin-left: 0;
	padding-left: 0 !important;

	&::before {
		left: var(--reply-indent);
		width: 0;
		border-bottom: unset;
	}
}
</style>
