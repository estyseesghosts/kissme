/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Inject, Injectable } from '@nestjs/common';
import { Endpoint } from '@/server/api/endpoint-base.js';
import type { NotesRepository } from '@/models/_.js';
import { DI } from '@/di-symbols.js';
import { ModerationLogService } from '@/core/ModerationLogService.js';
import { CacheService } from '@/core/CacheService.js';

export const meta = {
	tags: ['admin'],

	requireCredential: true,
	requireModerator: true,
	kind: 'write:admin:cw-note',
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		noteId: { type: 'string', format: 'misskey:id' },
		cw: { type: 'string', nullable: true },
	},
	required: ['noteId', 'cw'],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> { // eslint-disable-line import/no-default-export
	constructor(
		@Inject(DI.notesRepository)
		private readonly notesRepository: NotesRepository,

		private readonly cacheService: CacheService,
		private readonly moderationLogService: ModerationLogService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const note = await this.notesRepository.findOneByOrFail({ id: ps.noteId });
			const user = await this.cacheService.findUserById(note.userId);

			// Collapse empty strings to null
			const newCW = ps.cw?.trim() || null;
			const oldCW = note.mandatoryCW;

			// Skip if there's nothing to do
			if (oldCW === newCW) return;

			// NOTE: upstream Misskey has no note-edit flow (no NoteEditService),
			// so the mandatory CW is applied with a direct column update.
			await this.notesRepository.update(note.id, { mandatoryCW: newCW });

			await this.moderationLogService.log(me, 'setMandatoryCWForNote', {
				newCW,
				oldCW,
				noteId: note.id,
				noteUserId: user.id,
				noteUserUsername: user.username,
				noteUserHost: user.host,
			});
		});
	}
}
