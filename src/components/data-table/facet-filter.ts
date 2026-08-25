import { constructFilterFn } from "@tanstack/react-table";

/**
 * A faceted filter carries its operator inside the value array, so it survives
 * the existing string URL encoding (`join(",")` / `split(",")`) untouched — no
 * change to `use-data-table` is needed. "is any of" (include) is a plain value
 * list; "is not any of" (exclude) prefixes the FIRST token with `!`, glued so
 * the URL stays clean: `?insegnamento=!Algoritmi,Fisica`.
 *
 * The marker is safe because every facet value in the app is an enum or an id —
 * none begins with `!`. A value that did would be misread as an exclusion.
 */
export const FACET_NOT = "!";

export type FacetSelection = { exclude: boolean; values: string[] };

export function readFacet(value: unknown): FacetSelection {
	const arr = Array.isArray(value) ? (value as unknown[]).map(String) : [];
	if (arr.length === 0) return { exclude: false, values: [] };
	if (!arr[0].startsWith(FACET_NOT)) return { exclude: false, values: arr };
	const values = [arr[0].slice(FACET_NOT.length), ...arr.slice(1)].filter(Boolean);
	return { exclude: true, values };
}

/** The filter value for a selection, or `undefined` (no filter) when empty. */
export function writeFacet(exclude: boolean, values: string[]): string[] | undefined {
	if (values.length === 0) return undefined;
	if (!exclude) return values;
	return [FACET_NOT + values[0], ...values.slice(1)];
}

/**
 * `filterFn: "facet"` — a superset of `arrHas`: a bare value list keeps the same
 * "row value is one of the selected" semantics, while the `!` marker negates it.
 */
export const facetFilterFn = constructFilterFn({
	filter: (dataValue: unknown, filterValue: unknown) => {
		const { exclude, values } = readFacet(filterValue);
		if (values.length === 0) return true;
		const has = values.includes(String(dataValue ?? ""));
		return exclude ? !has : has;
	},
	autoRemove: (value: unknown) => !Array.isArray(value) || value.length === 0,
});
