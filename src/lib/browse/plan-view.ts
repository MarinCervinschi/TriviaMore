import { COMPULSORY_GROUP } from "@/lib/catalog/constants";
import { type Evaluation, classifyTeaching } from "@/lib/catalog/sync/plan";

import type { CourseCurriculum, PlanActivity, PlanClass, PlanGroup } from "./types";

export type PlanViewRow = {
	code: string;
	name: string;
	cfu: number | null;
	classYear: number;
	mandatory: boolean;
	groupCode: string | null;
	groupLabel: string | null;
	groupPosition: number | null;
	evaluation: Evaluation | null;
	curriculum: string;
	classId: string | null;
	link: string | null;
	description: string | null;
	isTeaching: boolean | null;
	hasContent: boolean;
	position: number | null;
};

export type PlanViewCurriculum = CourseCurriculum & { common: boolean };

/** The requested cohort when the course has it, else the student's own, else the current one, else the latest before it. */
export function pickCohort(
	cohorts: number[],
	{
		requested,
		enrolled,
		current,
	}: { requested?: number; enrolled?: number | null; current: number }
): number | null {
	const available = new Set(cohorts);
	for (const candidate of [requested, enrolled, current]) {
		if (candidate != null && available.has(candidate)) return candidate;
	}
	const earlier = cohorts.filter(cohort => cohort <= current);
	const pool = earlier.length > 0 ? earlier : cohorts;
	return pool.length > 0 ? Math.max(...pool) : null;
}

function groupOf(row: PlanViewRow): PlanGroup | null {
	return row.groupLabel === null
		? null
		: { code: row.groupCode, label: row.groupLabel, position: row.groupPosition ?? 0 };
}

function sharedGroup(rows: PlanViewRow[]): PlanGroup | null {
	const labels = new Set(rows.map(row => row.groupLabel));
	return labels.size === 1 ? groupOf(rows[0]!) : null;
}

/** One entry per plan code across the curricula; the common trunk is left out when the course has curricula proper. */
export function buildPlanView(
	rows: PlanViewRow[],
	curricula: PlanViewCurriculum[],
	sectionCounts: Map<string, number>
): { curricula: CourseCurriculum[]; classes: PlanClass[]; activities: PlanActivity[] } {
	const proper = curricula.filter(c => !c.common);
	const shown = proper.length > 0 ? proper : curricula;
	const shownCodes = new Set(shown.map(c => c.code));

	const byCode = new Map<string, PlanViewRow[]>();
	for (const row of rows) {
		if (!shownCodes.has(row.curriculum)) continue;
		byCode.set(row.code, [...(byCode.get(row.code) ?? []), row]);
	}

	const entries = [...byCode.values()]
		.map(group => ({ first: group[0]!, group }))
		.sort(
			(a, b) =>
				a.first.classYear - b.first.classYear ||
				(a.first.position ?? Number.MAX_SAFE_INTEGER) -
					(b.first.position ?? Number.MAX_SAFE_INTEGER) ||
				a.first.name.localeCompare(b.first.name)
		);

	const classes: PlanClass[] = [];
	const activities: PlanActivity[] = [];
	for (const { first, group } of entries) {
		const studiable =
			first.hasContent ||
			(first.isTeaching ?? classifyTeaching(first.name, first.evaluation) ?? true);
		if (studiable) {
			classes.push({
				id: first.code,
				code: first.code,
				link: first.link,
				name: first.name,
				description: first.description,
				cfu: first.cfu,
				classYear: first.classYear,
				sectionCount: first.classId ? (sectionCounts.get(first.classId) ?? 0) : 0,
				mandatory: group.every(row => row.mandatory),
				group: sharedGroup(group),
				curricula: group.map(row => ({
					code: row.curriculum,
					mandatory: row.mandatory,
					group: groupOf(row),
				})),
			});
		} else {
			activities.push({
				id: first.code,
				name: first.name,
				cfu: first.cfu,
				classYear: first.classYear,
				group: sharedGroup(group),
				curricula: group.map(row => row.curriculum),
			});
		}
	}

	// Activities of one choice group are alternatives, so they stay next to each other.
	activities.sort(
		(a, b) =>
			a.classYear - b.classYear ||
			(a.group?.position ?? Number.MAX_SAFE_INTEGER) -
				(b.group?.position ?? Number.MAX_SAFE_INTEGER)
	);

	return {
		curricula: shown.map(({ code, name }) => ({ code, name })),
		classes,
		activities,
	};
}

const COMPULSORY: PlanGroup = {
	code: COMPULSORY_GROUP,
	label: "Obbligatori",
	position: -1,
};
const ELECTIVE: PlanGroup = {
	code: null,
	label: "A scelta",
	position: Number.MAX_SAFE_INTEGER,
};

/** The group a class falls in under the curriculum filter; without a group from the plan, compulsory or elective. */
export function groupFor(entry: PlanClass, curriculum?: string): PlanGroup {
	const group =
		curriculum === undefined
			? entry.group
			: (entry.curricula.find(c => c.code === curriculum)?.group ?? null);
	return group ?? (isMandatory(entry, curriculum) ? COMPULSORY : ELECTIVE);
}

export function isMandatory(entry: PlanClass, curriculum?: string): boolean {
	if (curriculum === undefined) return entry.mandatory;
	return entry.curricula.some(c => c.code === curriculum && c.mandatory);
}

export function inCurriculum(
	entry: { curricula: (string | { code: string })[] },
	curriculum?: string
) {
	return (
		curriculum === undefined ||
		entry.curricula.some(c => (typeof c === "string" ? c : c.code) === curriculum)
	);
}
