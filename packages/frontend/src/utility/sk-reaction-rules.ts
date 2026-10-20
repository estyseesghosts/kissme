/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

// Pure reaction permission / emoji-mute decisions for SkReactionsViewer.

export type SkReactionAcceptance = 'likeOnly' | 'likeOnlyForRemote' | 'nonSensitiveOnly' | 'nonSensitiveOnlyForLocalLikeOnlyForRemote' | null | undefined;

/** The slice of an emoji the rules look at. `unicode` emoji are always allowed (except under likeOnly). */
export type SkReactionEmoji = {
	unicode: true;
} | {
	unicode?: false;
	localOnly?: boolean;
	isSensitive?: boolean;
	roleIdsThatCanBeUsedThisEmojiAsReaction?: string[];
};

export type SkReactionContext = {
	/** Reacting user's host (null for local users). */
	meHost: string | null;
	meRoleIds: readonly string[];
	/** Host of the note author (null for local notes). */
	noteHost: string | null;
	acceptance: SkReactionAcceptance;
};

/** Reaction keys with a remote host part (`:name@host:`) cannot be used locally. */
export function isRemoteCustomReaction(reaction: string): boolean {
	return /@\w/.test(reaction);
}

/** Only a locally known (`:name:` without remote host) custom emoji has an info dialog. */
export function canGetEmojiInfo(reaction: string): boolean {
	return !isRemoteCustomReaction(reaction) && reaction.includes(':');
}

/**
 * Can the user toggle this reaction on the note?
 * likeOnly disables emoji reactions entirely; the sensitive-emoji rule applies to both nonSensitive modes
 * (likeOnlyForRemote concerns remote reactors, so it never blocks the local user).
 */
export function canReactWith(ctx: SkReactionContext, reaction: string, emoji: SkReactionEmoji | null): boolean {
	if (isRemoteCustomReaction(reaction)) return false;
	if (emoji == null) return false;
	if (ctx.acceptance === 'likeOnly') return false;
	if (emoji.unicode) return true;

	if (emoji.localOnly && ctx.noteHost !== ctx.meHost) return false;
	if (emoji.isSensitive && (ctx.acceptance === 'nonSensitiveOnly' || ctx.acceptance === 'nonSensitiveOnlyForLocalLikeOnlyForRemote')) return false;
	const roles = emoji.roleIdsThatCanBeUsedThisEmojiAsReaction ?? [];
	return roles.length === 0 || ctx.meRoleIds.some(id => roles.includes(id));
}

/** Normalise a reaction key (`:name@.:` or `:name:`) to the bare emoji name used by the mute list. */
export function reactionEmojiName(reaction: string): string {
	return reaction.replace(/:/g, '').replace(/@\./, '');
}

export function isReactionMuted(reaction: string, muted: readonly string[]): boolean {
	return muted.includes(reaction) || muted.includes(reactionEmojiName(reaction));
}

/** Split reactions into visible and muted. The user's own reaction is never hidden. */
export function partitionMutedReactions<T extends readonly [string, number]>(entries: readonly T[], muted: readonly string[], myReaction: string | null | undefined): { visible: T[]; hidden: T[] } {
	const visible: T[] = [];
	const hidden: T[] = [];
	for (const e of entries) {
		if (e[0] !== myReaction && isReactionMuted(e[0], muted)) hidden.push(e);
		else visible.push(e);
	}
	return { visible, hidden };
}

/** Add or remove a reaction's emoji name from the muted list. Returns a new array. */
export function toggleMutedEmoji(muted: readonly string[], reaction: string): string[] {
	const name = reactionEmojiName(reaction);
	return isReactionMuted(reaction, muted)
		? muted.filter(m => m !== reaction && m !== name)
		: [...muted, name];
}
