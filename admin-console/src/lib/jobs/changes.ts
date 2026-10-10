import type { JobChangeRow, JobChangeValue, JobChanges } from "@/db/schema";

/** Enough to read a run row by row; past it the section only counts. */
const ROW_CAP = 500;

export function section(
	key: string,
	title: string,
	rows: JobChangeRow[]
): JobChanges[number] {
	const count = (kind: JobChangeRow["kind"]) =>
		rows.filter(row => row.kind === kind).length;
	return {
		key,
		title,
		counts: {
			added: count("added"),
			updated: count("updated"),
			removed: count("removed"),
		},
		rows: rows.slice(0, ROW_CAP),
		omitted: Math.max(0, rows.length - ROW_CAP),
	};
}

/** The non-empty sections, in the order given. */
export const changesOf = (...sections: JobChanges): JobChanges =>
	sections.filter(entry => entry.rows.length > 0 || entry.omitted > 0);

const valueOf = (value: unknown): JobChangeValue =>
	value === undefined
		? null
		: typeof value === "object" && value !== null
			? JSON.stringify(value)
			: (value as JobChangeValue);

/** Each field of `after` beside its value in `before`, named through `labels` where it has one. */
export function fieldsOf(
	before: Record<string, unknown>,
	after: Record<string, unknown>,
	labels: Record<string, string> = {}
): NonNullable<JobChangeRow["fields"]> {
	return Object.keys(after).map(field => ({
		name: labels[field] ?? field,
		before: valueOf(before[field]),
		after: valueOf(after[field]),
	}));
}

/** A row's own values, for an addition (`after`) or a removal (`before`). */
export function valuesOf(
	row: Record<string, unknown>,
	labels: Record<string, string>,
	side: "before" | "after"
): NonNullable<JobChangeRow["fields"]> {
	return Object.entries(labels)
		.filter(([field]) => row[field] !== undefined && row[field] !== null)
		.map(([field, name]) => ({
			name,
			before: side === "before" ? valueOf(row[field]) : null,
			after: side === "after" ? valueOf(row[field]) : null,
		}));
}
