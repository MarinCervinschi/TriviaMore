/**
 * Compares our catalogue against the one the university publishes. Pure — the
 * fetching, the database read and the printing live in `scripts/catalog/`.
 */

/** One activity of one course plan, projected from the official catalogue. */
export type SourceActivity = {
	academicYear: string;
	courseCode: string;
	courseName: string;
	codicione: string | null;
	code: string;
	name: string;
	cfu: number | null;
	classYear: number | null;
	taf: string | null;
	ssd: string | null;
	evaluation: string | null;
	curriculum: string | null;
};

export type LocalClass = {
	courseCode: string;
	courseName: string;
	code: string;
	name: string;
	cfu: number | null;
	classYear: number;
	mandatory: boolean;
	curriculum: string | null;
};

export type FindingKind =
	| "added"
	| "removed"
	| "renamed"
	| "cfu"
	| "classYear"
	| "mandatory";

export type Finding = {
	kind: FindingKind;
	courseCode: string;
	courseName: string;
	code: string;
	name: string;
	ours?: string | number | boolean | null;
	theirs?: string;
};

export type DiffSummary = {
	academicYear: string;
	localRows: number;
	sourceRows: number;
	sourcePairs: number;
	matched: number;
	added: number;
	removed: number;
	changed: number;
};

export type CatalogDiff = { summary: DiffSummary; findings: Finding[] };

/**
 * The compulsory flags the plans file a pair under — plural, because a class can
 * be compulsory in one curriculum and optional in another. Not derivable from the
 * TAF, so without this the comparison is skipped rather than guessed.
 */
export type MandatoryIndex = Map<string, boolean[]>;

export const pairKey = (courseCode: string, code: string) =>
	`${courseCode}\u0000${code}`;

const key = pairKey;

function normaliseName(value: string): string {
	return value
		.normalize("NFKD")
		.replace(/[̀-ͯ]/g, "")
		.replace(/[^a-zA-Z0-9]+/g, " ")
		.trim()
		.toLowerCase();
}

/**
 * A pair appears once per curriculum and the curricula disagree — 3 CFU in one,
 * 9 in another — so a field is reported only when our value matches none of them.
 */
function collapse(activities: SourceActivity[]) {
	const groups = new Map<string, SourceActivity[]>();
	for (const activity of activities) {
		const k = key(activity.courseCode, activity.code);
		const group = groups.get(k);
		if (group) group.push(activity);
		else groups.set(k, [activity]);
	}
	return groups;
}

function describe(values: Set<string | number | boolean | null>): string {
	return [...values].map(value => (value === null ? "—" : String(value))).join(" | ");
}

function compareField<T extends string | number | boolean | null>(
	ours: T,
	theirs: T[],
	equal: (a: T, b: T) => boolean = (a, b) => a === b
): string | null {
	if (theirs.length === 0) return null;
	if (theirs.some(value => equal(ours, value))) return null;
	return describe(new Set(theirs));
}

export function diffCatalog(
	local: LocalClass[],
	source: SourceActivity[],
	academicYear: string,
	mandatoryIndex?: MandatoryIndex
): CatalogDiff {
	const groups = collapse(source);
	const findings: Finding[] = [];
	const seen = new Set<string>();
	let matched = 0;

	for (const row of local) {
		const k = key(row.courseCode, row.code);
		const group = groups.get(k);

		if (!group) {
			findings.push({
				kind: "removed",
				courseCode: row.courseCode,
				courseName: row.courseName,
				code: row.code,
				name: row.name,
				ours: row.name,
			});
			continue;
		}

		seen.add(k);
		matched++;

		const name = compareField(
			row.name,
			[...new Set(group.map(a => a.name))],
			(a, b) => normaliseName(a) === normaliseName(b)
		);
		if (name) {
			findings.push({ ...base(row), kind: "renamed", ours: row.name, theirs: name });
		}

		const cfu = compareField(row.cfu, [...new Set(group.map(a => a.cfu))]);
		if (cfu) findings.push({ ...base(row), kind: "cfu", ours: row.cfu, theirs: cfu });

		const classYear = compareField(row.classYear as number | null, [
			...new Set(group.map(a => a.classYear)),
		]);
		if (classYear) {
			findings.push({
				...base(row),
				kind: "classYear",
				ours: row.classYear,
				theirs: classYear,
			});
		}

		const mandatory = compareField(row.mandatory, mandatoryIndex?.get(k) ?? []);
		if (mandatory) {
			findings.push({
				...base(row),
				kind: "mandatory",
				ours: row.mandatory,
				theirs: mandatory,
			});
		}
	}

	for (const [k, group] of groups) {
		if (seen.has(k)) continue;
		const first = group[0]!;
		findings.push({
			kind: "added",
			courseCode: first.courseCode,
			courseName: first.courseName,
			code: first.code,
			name: first.name,
			theirs: first.name,
		});
	}

	const removed = findings.filter(f => f.kind === "removed").length;
	const added = findings.filter(f => f.kind === "added").length;

	return {
		summary: {
			academicYear,
			localRows: local.length,
			sourceRows: source.length,
			sourcePairs: groups.size,
			matched,
			added,
			removed,
			changed: findings.length - added - removed,
		},
		findings,
	};
}

export type Coverage = {
	/** Our rows the catalogue knows in at least one year. */
	known: number;
	/** Our rows no published year carries — the ones a sync has to decide about. */
	unknown: LocalClass[];
	/** How many of our rows each year accounts for; they overlap on purpose. */
	byYear: { academicYear: string; matched: number }[];
};

/**
 * Our catalogue has no year of its own, so what we hold is measured against *any*
 * published year. The per-year figures are the spread, not a score.
 */
export function coverage(local: LocalClass[], source: SourceActivity[]): Coverage {
	const years = [...new Set(source.map(activity => activity.academicYear))].sort();
	const byYear = new Map<string, Set<string>>(years.map(year => [year, new Set()]));

	for (const activity of source) {
		byYear.get(activity.academicYear)?.add(key(activity.courseCode, activity.code));
	}

	const unknown = local.filter(row =>
		years.every(year => !byYear.get(year)!.has(key(row.courseCode, row.code)))
	);

	return {
		known: local.length - unknown.length,
		unknown,
		byYear: years.map(year => ({
			academicYear: year,
			matched: local.filter(row => byYear.get(year)!.has(key(row.courseCode, row.code)))
				.length,
		})),
	};
}

function base(row: LocalClass) {
	return {
		courseCode: row.courseCode,
		courseName: row.courseName,
		code: row.code,
		name: row.name,
	};
}
