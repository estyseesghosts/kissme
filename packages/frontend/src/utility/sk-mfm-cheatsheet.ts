/*
 * SPDX-FileCopyrightText: marie and other Sharkey contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { i18n } from '@/i18n.js';
import type { Locale } from 'i18n';

export type MfmSectionId = keyof Locale['mfmCheatsheet']['sections'];

export type MfmCheatsheetSection = {
	id: MfmSectionId;
	title: string;
	description: string;
	/** Initial MFM source shown in the editable preview. */
	preview: string;
	/** Shows the "uncommon feature" warning. */
	uncommon?: boolean;
};

const TIMING = '$[{fn}.speed=3s 🍮] $[{fn}.delay=3s 🍮] $[{fn}.loop=3 🍮]';

function animation(fn: string): string {
	return `$[${fn} 🍮] ${TIMING.replaceAll('{fn}', fn)}`;
}

/**
 * Builds the cheatsheet sections in display order.
 * `now` is injectable so the unixtime example is deterministic in tests.
 */
export function buildMfmCheatsheet(now: number = Date.now()): MfmCheatsheetSection[] {
	const s = i18n.ts.mfmCheatsheet;
	const dummy = s.dummy;
	const previews: Record<MfmSectionId, string> = {
		mention: '@example',
		hashtag: '#test',
		link: `[${dummy}](https://joinsharkey.org)`,
		emoji: ':heart:',
		bold: `**${dummy}**`,
		small: `<small>${dummy}</small>`,
		quote: `> ${dummy}`,
		center: `<center>${dummy}</center>`,
		unixtime: `$[unixtime ${Math.floor(now / 1000)}]`,
		inlineCode: '`<: "Hello, world!"`',
		blockCode: '```ai\n~ (#i, 100) {\n\t<: ? ((i % 15) = 0) "FizzBuzz"\n\t\t.? ((i % 3) = 0) "Fizz"\n\t\t.? ((i % 5) = 0) "Buzz"\n\t\t. i\n}\n```',
		inlineMath: '\\(x= \\frac{-b\' \\pm \\sqrt{(b\')^2-ac}}{a}\\)',
		blockMath: '\\[x= \\frac{-b\' \\pm \\sqrt{(b\')^2-ac}}{a}\\]',
		search: `${dummy} [search]\n${dummy} [検索]`,
		flip: `$[flip ${dummy}]\n$[flip.v ${dummy}]\n$[flip.h,v ${dummy}]`,
		font: `$[font.serif ${dummy}]\n$[font.monospace ${dummy}]`,
		x2: '$[x2 🍮]',
		x3: '$[x3 🍮]',
		x4: '$[x4 🍮]',
		blur: `$[blur ${dummy}]`,
		jelly: animation('jelly'),
		tada: animation('tada'),
		jump: animation('jump'),
		bounce: animation('bounce'),
		spin: '$[spin 🍮] $[spin.left 🍮] $[spin.alternate 🍮]\n$[spin.x 🍮] $[spin.x,left 🍮] $[spin.x,alternate 🍮]\n$[spin.y 🍮] $[spin.y,left 🍮] $[spin.y,alternate 🍮]\n\n$[spin.speed=3s 🍮] $[spin.delay=3s 🍮] $[spin.loop=3 🍮]',
		shake: animation('shake'),
		twitch: animation('twitch'),
		rainbow: animation('rainbow'),
		sparkle: '$[sparkle 🍮]',
		rotate: '$[rotate 🍮]\n$[rotate.deg=45 🍮]\n$[rotate.x,deg=45 Hello, world!]',
		crop: '$[crop.top=50 🍮] $[crop.right=50 🍮] $[crop.bottom=50 🍮] $[crop.left=50 🍮]',
		position: '$[position.y=-1 🍮]\n$[position.x=-1 🍮]',
		followMouse: '$[followmouse.x 🍮]\n$[followmouse.x,y,rotateByVelocity,speed=0.4 🍮]',
		scale: '$[scale.x=1.3 🍮]\n$[scale.x=1.5,y=3 🍮]\n$[scale.y=0.3 🍮]',
		fade: '$[fade 🍮] $[fade.out 🍮] $[fade.speed=3s 🍮] $[fade.delay=3s 🍮]',
		foreground: '$[fg.color=eb6f92 Text color]',
		background: '$[bg.color=31748f Background color]',
		border: '$[border.color=eb6f92,style=outset,width=10,radius=10 Border]',
		plain: '<plain>**bold** @mention #hashtag `code` $[x2 🍮]</plain>',
	};

	return (Object.keys(s.sections) as MfmSectionId[]).map(id => ({
		id,
		title: s.sections[id].title,
		description: s.sections[id].description,
		preview: previews[id],
		uncommon: id === 'followMouse' ? true : undefined,
	}));
}
