/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { MiNote } from '@/models/Note.js';
import type { Packed } from '@/misc/json-schema.js';

// NoteEntityService.isPureRenote とよしなにリンク

type Renote =
	MiNote & {
		renoteId: NonNullable<MiNote['renoteId']>
	};

type Quote =
	Renote & ({
		text: NonNullable<MiNote['text']>
	} | {
		cw: NonNullable<MiNote['cw']>
	} | {
		replyId: NonNullable<MiNote['replyId']>
		reply: NonNullable<MiNote['reply']>
	} | {
		hasPoll: true
	});

export function isRenote(note: MiNote): note is Renote;
export function isRenote(note: MinimalNote): note is MinimalRenote;
export function isRenote(note: MiNote | MinimalNote): note is Renote | MinimalRenote {
	return note.renoteId != null;
}

export function isQuote(note: Renote): note is Quote;
export function isQuote(note: MinimalRenote): note is MinimalQuote;
export function isQuote(note: Renote | MinimalRenote): note is Quote | MinimalQuote {
	// NOTE: SYNC WITH NoteCreateService.isQuote
	return note.text != null ||
		note.cw != null ||
		note.replyId != null ||
		note.hasPoll ||
		note.fileIds.length > 0;
}

export function isPureRenote(note: MiNote): note is PureRenote;
export function isPureRenote(note: MinimalNote): note is MinimalPureRenote;
export function isPureRenote(note: MiNote | MinimalNote): note is PureRenote | MinimalPureRenote {
	return isRenote(note) && !isQuote(note as Renote & MinimalRenote);
}

export type MinimalNote = Pick<MiNote, 'id' | 'visibility' | 'userId' | 'replyId' | 'renoteId' | 'text' | 'cw' | 'hasPoll' | 'fileIds'>;

export type MinimalRenote = MinimalNote & {
	renoteId: string;
};

export type MinimalQuote = MinimalRenote & ({
	text: NonNullable<MinimalNote['text']>
} | {
	cw: NonNullable<MinimalNote['cw']>
} | {
	replyId: NonNullable<MinimalNote['replyId']>
} | {
	hasPoll: true
} | {
	fileIds: [string, ...string[]],
});

export type MinimalPureRenote = MinimalRenote & {
	text: null,
	cw: null,
	replyId: null,
	hasPoll: false,
	fileIds: [],
};

type PureRenote =
	Renote & {
		text: null,
		cw: null,
		replyId: null,
		hasPoll: false,
		fileIds: [],
	};

type PackedRenote =
	Packed<'Note'> & {
		renoteId: NonNullable<Packed<'Note'>['renoteId']>
	};

type PackedQuote =
	PackedRenote & ({
		text: NonNullable<Packed<'Note'>['text']>
	} | {
		cw: NonNullable<Packed<'Note'>['cw']>
	} | {
		replyId: NonNullable<Packed<'Note'>['replyId']>
	} | {
		poll: NonNullable<Packed<'Note'>['poll']>
	} | {
		fileIds: NonNullable<Packed<'Note'>['fileIds']>
	});

export function isRenotePacked(note: Packed<'Note'>): note is PackedRenote {
	return note.renoteId != null;
}

type PackedPureRenote = PackedRenote & {
	text: null;
	cw: null;
	replyId: null;
	reply: null;
	poll: null;
	fileIds: [];
};

export function isPackedPureRenote(note: Packed<'Note'>): note is PackedPureRenote {
	return isRenotePacked(note) && !isQuotePacked(note);
}

export function isQuotePacked(note: PackedRenote): note is PackedQuote {
	return note.text != null ||
		note.cw != null ||
		note.replyId != null ||
		note.poll != null ||
		(note.fileIds != null && note.fileIds.length > 0);
}
