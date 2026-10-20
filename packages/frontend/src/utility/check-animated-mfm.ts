/*
 * SPDX-FileCopyrightText: marie and other Sharkey contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as mfm from 'mfm-js';

const ANIMATED_FN_NAMES = new Set([
	'tada', 'jelly', 'twitch', 'shake', 'spin', 'jump', 'bounce',
	'rainbow', 'sparkle', 'fade', 'followmouse',
]);

export function checkAnimationFromMfm(nodes: mfm.MfmNode[]): boolean {
	const animatedNodes = mfm.extract(nodes, (node) => node.type === 'fn' && ANIMATED_FN_NAMES.has(node.props.name));
	return animatedNodes.length > 0;
}
