import { constructFilterFn } from "@tanstack/react-table";

/** Prefixes the first value of an exclude filter, as in `?insegnamento=!Algoritmi,Fisica`. */
export const FACET_NOT = "!";

export type FacetSelection = { exclude: boolean; values: string[] };

export function readFacet(value: unknown): FacetSelection {
	const arr = Array.isArray(value) ? (value as unknown[]).map(String) : [];
	if (arr.length === 0) return { exclude: false, values: [] };
	if (!arr[0].startsWith(FACET_NOT)) return { exclude: false, values: arr };
	const values = [arr[0].slice(FACET_NOT.length), ...arr.slice(1)].filter(Boolean);
	return { exclude: true, values };
}

/** `undefined`, meaning no filter, when nothing is selected. */
export function writeFacet(exclude: boolean, values: string[]): string[] | undefined {
	if (values.length === 0) return undefined;
	if (!exclude) return values;
	return [FACET_NOT + values[0], ...values.slice(1)];
}

/** Matches a row whose value is one of the selected, negated by the `!` marker. */
export const facetFilterFn = constructFilterFn({
	filter: (dataValue: unknown, filterValue: unknown) => {
		const { exclude, values } = readFacet(filterValue);
		if (values.length === 0) return true;
		const has = values.includes(String(dataValue ?? ""));
		return exclude ? !has : has;
	},
	autoRemove: (value: unknown) => !Array.isArray(value) || value.length === 0,
});
