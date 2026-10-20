/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Injectable } from '@nestjs/common';
import { Endpoint } from '@/server/api/endpoint-base.js';
import { GetterService } from '@/server/api/GetterService.js';
import { ReactionService } from '@/core/ReactionService.js';
import { ApiError } from '../../error.js';

// Upstream MiMeta has no defaultLike column (cf. Sharkey's Meta.defaultLike,
// whose DB default is '❤️'). Keep the donor instance default as a constant
// until such a setting exists upstream.
const DEFAULT_LIKE = '❤️';

export const meta = {
	tags: ['notes'],

	requireCredential: true,

	prohibitMoved: true,

	kind: 'write:reactions',

	errors: {
		noSuchNote: {
			message: 'No such note.',
			code: 'NO_SUCH_NOTE',
			id: '38db3e17-916b-48ad-883c-f8ed8271c64f',
		},

		youHaveBeenBlocked: {
			message: 'You cannot like this note because you have been blocked by this user.',
			code: 'YOU_HAVE_BEEN_BLOCKED',
			id: '0acec152-d6dd-40ee-bee4-c0c6b86804de',
		},

		cannotReactToRenote: {
			message: 'You cannot like a Renote.',
			code: 'CANNOT_REACT_TO_RENOTE',
			id: 'd3cba983-97b3-401b-9b33-c207c9a9cbf1',
		},
	},

	// 2 calls per second
	limit: {
		duration: 1000,
		max: 2,
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		noteId: { type: 'string', format: 'misskey:id' },
		override: { type: 'string', nullable: true },
	},
	required: ['noteId'],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> { // eslint-disable-line import/no-default-export
	constructor(
		private getterService: GetterService,
		private reactionService: ReactionService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const like = ps.override ?? DEFAULT_LIKE;
			const note = await this.getterService.getNote(ps.noteId).catch(err => {
				if (err.id === '9725d0ce-ba28-4dde-95a7-2cbb2c15de24') throw new ApiError(meta.errors.noSuchNote);
				throw err;
			});
			await this.reactionService.create(me, note, like).catch(async err => {
				if (err.id === '51c42bb4-931a-456b-bff7-e5a8a70dd298') {
					await this.reactionService.delete(me, note);
					return;
				}
				if (err.id === 'e70412a4-7197-4726-8e74-f3e0deb92aa7') throw new ApiError(meta.errors.youHaveBeenBlocked);
				if (err.id === '12c35529-3c79-4327-b1cc-e2cf63a71925') throw new ApiError(meta.errors.cannotReactToRenote);
				throw err;
			});
			return;
		});
	}
}
