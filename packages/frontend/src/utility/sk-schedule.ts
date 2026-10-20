/*
 * SPDX-FileCopyrightText: syuilo and other misskey contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

// Pure date/time helpers for MkScheduleEditor. The donor builds the timestamp with
// `new Date('yyyy-MM-dd HH:mm')`, which not every engine parses; these use explicit parts.

const pad = (n: number) => n.toString().padStart(2, '0');

export type ScheduleParts = {
	/** `yyyy-MM-dd`, the value format of `<input type="date">` */
	date: string;
	/** `HH:mm`, the value format of `<input type="time">` */
	time: string;
};

/** Default when nothing is scheduled yet: tomorrow at 00:00 local time. */
export function defaultScheduleParts(now: Date): ScheduleParts {
	const t = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
	return { date: `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`, time: '00:00' };
}

export function splitScheduledAt(ms: number): ScheduleParts {
	const d = new Date(ms);
	return {
		date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
		time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
	};
}

/** Local `date` + `time` -> epoch ms, or null when either is empty or not a real date. */
export function joinScheduledAt(date: string, time: string): number | null {
	const d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
	const t = /^(\d{2}):(\d{2})$/.exec(time);
	if (d == null || t == null) return null;
	const [y, mo, da, h, mi] = [d[1], d[2], d[3], t[1], t[2]].map(Number);
	const result = new Date(y, mo - 1, da, h, mi);
	// Reject overflow such as 2025-02-31 (which Date silently rolls into March).
	if (result.getFullYear() !== y || result.getMonth() !== mo - 1 || result.getDate() !== da) return null;
	if (h > 23 || mi > 59) return null;
	return result.getTime();
}
