/*
 * SPDX-FileCopyrightText: hazelnoot and other Sharkey contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { ParameterizedString } from 'i18n';

/**
 * Sharkey UI strings that Misskey's en-US.yml does not have yet.
 *
 * Temporary home for the remaining un-migrated strings. Each entry is listed in
 * MISSING-STRINGS.md. Move entries into locales/en-US.yml (and ja-JP.yml) when they
 * are settled, switch the components to i18n.ts, then remove them here.
 */
export const skStrings = {

	// SkPatternTest.vue (Phase 8.2)
	wordMuteTestLabel: 'Test your mutes',
	wordMuteTestDescription: 'Enter text to check against the mutes above. Each line is tested separately.',
	wordMuteTestTest: 'Test',
	wordMuteTestNoResults: 'Enter some text and press Test.',
	wordMuteTestNoMatch: 'No mutes matched.',
	wordMuteTestMatch: 'Matched',
	wordMuteTestInvalid: 'Some mutes were skipped because they are invalid.',

	// profile.attribution-domains-setting.vue (Phase 8.3)
	attributionDomains: 'Attribution domains',
	attributionDomainsDescription: 'Websites listed here may credit you as an author. Enter one domain per line.',
	attributionDomainsTutorial: 'Add this tag to the website to be credited:',
	attributionDomainsUnsupported: 'This server does not support attribution domains.',

	// about-sharkey.vue, unsubscribe.vue (Phase 9.3)
	aboutSharkey: 'About Sharkey',
	aboutSharkeyDescription: 'Sharkey is open-source software forked from Misskey.',
	aboutSharkeySource: 'Source code (Sharkey)',
	aboutSharkeyDonate: 'Donate to Sharkey',
	aboutSharkeyTesters: 'Testers',
	aboutSharkeyMisskeyContributors: 'Misskey contributors',
	aboutSharkeySponsors: 'Our lovely sponsors',
	clickToUnsubscribe: 'Click OK to unsubscribe from these emails.',
	unsubscribeError: 'Could not unsubscribe. The link may be invalid or expired.',
	unsubscribeSuccess: 'You have been unsubscribed.',

	// show-system-account-dialog.ts (Phase 9.4; not in the donor locale either)
	systemAccountTitle: 'System account',
	systemAccountDescription: 'This is a system account used by the server. It cannot be interacted with.',

	// SkListenBrainz.vue (Phase 9.1)
	listeningTo: 'Listening to\u2026',

	// SkMfmWindow.vue (Phase 9.1)
	mfmCheatsheet: {
		title: 'MFM Cheatsheet',
		openButton: 'MFM cheatsheet',
		intro: 'MFM is a markup language used on Misskey, Sharkey, Firefish, Akkoma, and more that can be used in many places. Here you can view a list of all available MFM syntax.',
		dummy: 'Sharkey expands the world of the Fediverse',
		uncommonFeature: 'This is not a widespread feature, it may not display properly on most other fedi software, including other Misskey forks',
		sections: {
			mention: { title: 'Mention', description: 'You can specify a user by using an At-Symbol and a username.' },
			hashtag: { title: 'Hashtag', description: 'You can specify a hashtag using a number sign and text.' },
			link: { title: 'Link', description: 'Specific parts of text can be displayed as a URL.' },
			emoji: { title: 'Custom Emoji', description: 'By surrounding a custom emoji name with colons, custom emoji can be displayed.' },
			bold: { title: 'Bold', description: 'Highlights letters by making them thicker.' },
			small: { title: 'Small', description: 'Displays content small and thin.' },
			quote: { title: 'Quote', description: 'Displays content as a quote.' },
			center: { title: 'Center', description: 'Displays content centered.' },
			unixtime: { title: 'Unix Time', description: 'Displays a timestamp in the viewer\'s current timezone.' },
			inlineCode: { title: 'Code (Inline)', description: 'Displays inline syntax highlighting for (program) code.' },
			blockCode: { title: 'Code (Block)', description: 'Displays syntax highlighting for multi-line (program) code in a block.' },
			inlineMath: { title: 'Math (Inline)', description: 'Display math formulas (KaTeX) in-line' },
			blockMath: { title: 'Math (Block)', description: 'Display math formulas (KaTeX) in a block' },
			search: { title: 'Search', description: 'Displays a search box with pre-entered text.' },
			flip: { title: 'Flip', description: 'Flips content horizontally or vertically.' },
			font: { title: 'Font', description: 'Sets the font to display content in.' },
			x2: { title: 'Big', description: 'Displays content bigger.' },
			x3: { title: 'Very big', description: 'Displays content even bigger.' },
			x4: { title: 'Unbelievably big', description: 'Displays content even bigger than bigger than big.' },
			blur: { title: 'Blur', description: 'Blurs content. It will be displayed clearly when hovered over.' },
			jelly: { title: 'Animation (Jelly)', description: 'Gives content a jelly-like animation.' },
			tada: { title: 'Animation (Tada)', description: 'Gives content a "Tada!"-like animation.' },
			jump: { title: 'Animation (Jump)', description: 'Gives content a jumping animation.' },
			bounce: { title: 'Animation (Bounce)', description: 'Gives content a bouncy animation.' },
			spin: { title: 'Animation (Spin)', description: 'Gives content a spinning animation.' },
			shake: { title: 'Animation (Shake)', description: 'Gives content a shaking animation.' },
			twitch: { title: 'Animation (Twitch)', description: 'Gives content a strongly twitching animation.' },
			rainbow: { title: 'Rainbow', description: 'Makes the content appear in rainbow colors.' },
			sparkle: { title: 'Sparkle', description: 'Gives content a sparkling particle effect.' },
			rotate: { title: 'Rotate', description: 'Turns content by a specified angle.' },
			crop: { title: 'Crop', description: 'Crop content.' },
			position: { title: 'Position', description: 'Move content by a specified amount.' },
			followMouse: { title: 'Follow Mouse', description: 'Content will follow the mouse. On mobile it will follow wherever the user taps.' },
			scale: { title: 'Scale', description: 'Scale content by a specified amount.' },
			fade: { title: 'Fade', description: 'Fade text in and out.' },
			foreground: { title: 'Foreground color', description: 'Change the foreground color of text.' },
			background: { title: 'Background color', description: 'Change the background color of text.' },
			border: { title: 'Border', description: 'Draw a border around the content.' },
			plain: { title: 'Plain', description: 'Deactivates the effects of all MFM contained within this MFM effect.' },
		},
	},
} as const;
