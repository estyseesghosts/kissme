/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type PageVar = {
	name: string;
	type: 'string';
	value: string;
} | {
	name: string;
	type: 'number';
	value: number;
} | {
	name: string;
	type: 'boolean';
	value: boolean;
};

export type PageVarSource = {
	type: string;
	name?: string;
	default?: string | number | boolean | null;
	children?: PageVarSource[];
};

export function collectPageVars(content: PageVarSource[]): PageVar[] {
	const pageVars: PageVar[] = [];
	const collect = (xs: PageVarSource[]): void => {
		for (const x of xs) {
			const name = x.name ?? '';
			if (x.type === 'textInput' || x.type === 'textareaInput' || x.type === 'radioButton') {
				pageVars.push({ name, type: 'string', value: String(x.default || '') });
			} else if (x.type === 'numberInput') {
				pageVars.push({ name, type: 'number', value: Number(x.default || 0) });
			} else if (x.type === 'switch') {
				pageVars.push({ name, type: 'boolean', value: Boolean(x.default || false) });
			} else if (x.type === 'counter') {
				pageVars.push({ name, type: 'number', value: 0 });
			} else if (x.children) {
				collect(x.children);
			}
		}
	};
	collect(content);
	return pageVars;
}
