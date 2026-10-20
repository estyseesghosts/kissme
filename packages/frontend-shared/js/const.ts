/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

// ブラウザで直接表示することを許可するファイルの種類のリスト
// ここに含まれないものは application/octet-stream としてレスポンスされる
// SVGはXSSを生むので許可しない
export const FILE_TYPE_BROWSERSAFE = [
	// Images
	'image/png',
	'image/gif',
	'image/jpeg',
	'image/webp',
	'image/avif',
	'image/apng',
	'image/bmp',
	'image/tiff',
	'image/x-icon',

	// OggS
	'audio/opus',
	'video/ogg',
	'audio/ogg',
	'application/ogg',

	// ISO/IEC base media file format
	'video/quicktime',
	'video/mp4',
	'audio/mp4',
	'video/x-m4v',
	'audio/x-m4a',
	'video/3gpp',
	'video/3gpp2',

	'video/mpeg',
	'audio/mpeg',

	'video/webm',
	'audio/webm',

	'audio/aac',

	// see https://github.com/misskey-dev/misskey/pull/10686
	'audio/flac',
	'audio/wav',
	// backward compatibility
	'audio/x-flac',
	'audio/vnd.wave',
];
/*
https://github.com/sindresorhus/file-type/blob/main/supported.js
https://github.com/sindresorhus/file-type/blob/main/core.js
https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Containers
*/

// sharkey: types the Sharkey media components additionally treat as browser-displayable.
// Kept out of FILE_TYPE_BROWSERSAFE on purpose, because the stock lightbox (isPreviewable) and
// the embed media list read that list and their behavior must not change.
export const FILE_TYPE_BROWSERSAFE_SHARKEY = [
	'image/jxl',
	// MKV files
	'video/x-matroska',
];

export const FILE_TYPE_TRACKER_MODULES = [
	'audio/mod',
	'audio/x-mod',
	'audio/s3m',
	'audio/x-s3m',
	'audio/xm',
	'audio/x-xm',
	'audio/it',
	'audio/x-it',
];

export const FILE_EXT_TRACKER_MODULES = [
	'mod',
	's3m',
	'xm',
	'it',
	'mptm',
	'stm',
	'nst',
	'm15',
	'stk',
	'wow',
	'ult',
	'669',
	'mtm',
	'med',
	'far',
	'mdl',
	'ams',
	'dsm',
	'amf',
	'okt',
	'dmf',
	'ptm',
	'psm',
	'mt2',
	'dbm',
	'digi',
	'imf',
	'j2b',
	'gdm',
	'umx',
	'plm',
	'mo3',
	'xpk',
	'ppm',
	'mmcmp',
];

export const FILE_TYPE_FLASH_CONTENT = [
	'application/x-shockwave-flash',
	'application/vnd.adobe.flash.movie',
];

export const FILE_EXT_FLASH_CONTENT = [
	'swf',
];

/*
https://github.com/sindresorhus/file-type/blob/main/supported.js
https://github.com/sindresorhus/file-type/blob/main/core.js
https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Containers
*/


export const MFM_TAGS = ['tada', 'jelly', 'twitch', 'shake', 'spin', 'jump', 'bounce', 'flip', 'x2', 'x3', 'x4', 'scale', 'position', 'fg', 'bg', 'border', 'font', 'blur', 'rainbow', 'sparkle', 'rotate', 'ruby', 'unixtime'];
export const MFM_PARAMS: Record<typeof MFM_TAGS[number], string[]> = {
	tada: ['speed=', 'delay='],
	jelly: ['speed=', 'delay='],
	twitch: ['speed=', 'delay='],
	shake: ['speed=', 'delay='],
	spin: ['speed=', 'delay=', 'left', 'alternate', 'x', 'y'],
	jump: ['speed=', 'delay='],
	bounce: ['speed=', 'delay='],
	flip: ['h', 'v'],
	x2: [],
	x3: [],
	x4: [],
	scale: ['x=', 'y='],
	position: ['x=', 'y='],
	fg: ['color='],
	bg: ['color='],
	border: ['width=', 'style=', 'color=', 'radius=', 'noclip'],
	font: ['serif', 'monospace', 'cursive', 'fantasy', 'emoji', 'math'],
	blur: [],
	rainbow: ['speed=', 'delay='],
	rotate: ['deg='],
	ruby: [],
	unixtime: [],
};

/**
 * デフォルトの絵文字。UIの演出などでも使用されるため空にしてはいけない
 * （絵文字パレットのデフォルト絵文字を空にする等の場合は、preferenceのdefinition側の値を空にすること）
 */
export const DEFAULT_EMOJIS = ['👍', '❤️', '😆', '🤔', '😮', '🎉', '💢', '😥', '😇', '🍮'];
