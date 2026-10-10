import type { courseClasses } from "@/db/schema";

import { normaliseCatalogueCode } from "../codes";
import { type SourceActivity, pairKey } from "./diff";

export type Evaluation = NonNullable<(typeof courseClasses.$inferSelect)["evaluation"]>;

const EVALUATION: Record<string, Evaluation> = {
	"Voto Finale": "GRADED",
	"Giudizio Finale": "PASS_FAIL",
	Nessuno: "NONE",
};

export function mapEvaluation(label: string | null): Evaluation | null {
	return label ? (EVALUATION[label] ?? null) : null;
}

const PLAN_ACTIVITY =
	/(^|[^\p{L}])(prova finale|tirocini[oa]?|traineeship|internship|stage|final exam(ination)?|tesi|ofa|obblighi formativi|verifica (della )?preparazione|ulteriori (attività|conoscenze|competenze)|altre attività|a scelta)($|[^\p{L}])/iu;

/** Whether a plan row is a class to study: `null` when its evaluation is not known yet. */
export function classifyTeaching(
	name: string,
	evaluation: Evaluation | null
): boolean | null {
	if (PLAN_ACTIVITY.test(name)) return false;
	if (evaluation === null) return null;
	return evaluation === "GRADED";
}

/** The most frequent non-null value; `contested` when more than one was seen. */
export function consensus<T>(values: (T | null)[]): {
	value: T | null;
	contested: boolean;
} {
	const counts = new Map<T, number>();
	for (const value of values) {
		if (value !== null) counts.set(value, (counts.get(value) ?? 0) + 1);
	}
	let value: T | null = null;
	let best = 0;
	for (const [candidate, count] of counts) {
		if (count > best) {
			value = candidate;
			best = count;
		}
	}
	return { value, contested: counts.size > 1 };
}

/** The page of the first curriculum that lists the activity, so the pick does not depend on the order the plans arrive in. */
export function catalogueUrlOf(activities: SourceActivity[]): string | null {
	const listed = activities.filter(a => a.catalogueUrl);
	listed.sort((a, b) => (a.curriculum ?? "").localeCompare(b.curriculum ?? ""));
	return listed[0]?.catalogueUrl ?? null;
}

/** The consensus within the most recent year that has a value. */
export function latest<T>(observations: { academicYear: string; value: T | null }[]): {
	value: T | null;
	contested: boolean;
} {
	const withValue = observations.filter(o => o.value !== null);
	if (withValue.length === 0) return { value: null, contested: false };
	const year = withValue.reduce(
		(max, o) => (o.academicYear > max ? o.academicYear : max),
		""
	);
	return consensus(withValue.filter(o => o.academicYear === year).map(o => o.value));
}

function nameKey(name: string): string {
	return name.toLowerCase().replace(/\s+/g, " ").trim();
}

export type LocalDepartment = {
	id: string;
	name: string;
	catalogueCode: string | null;
};
export type LocalCourse = {
	id: string;
	code: string;
	nationalCode: string | null;
	degreeClass: string | null;
	teachingLanguage: string | null;
	restrictedAccess: boolean | null;
	catalogueUrl: string | null;
};
export type LocalClassRow = { id: string; name: string; ssd: string | null };
export type LocalCourseClass = {
	courseId: string;
	classId: string;
	courseCode: string;
	code: string;
	name: string;
	evaluation: Evaluation | null;
	taf: string | null;
	teachingPeriod: string | null;
	isTeaching: boolean | null;
	catalogueUrl: string | null;
};

export type SourceDepartment = { code: string; name: string };
export type SourceCourseFields = {
	code: string;
	codicione: string | null;
	degreeClass: string | null;
	teachingLanguage: string | null;
	restrictedAccess: boolean | null;
	url: string;
};
export type SourceAttributes = {
	academicYear: string;
	evaluation: string | null;
	ssd: string | null;
};

type CourseSet = Partial<Omit<LocalCourse, "id" | "code">>;
type CourseClassSet = Partial<
	Pick<
		LocalCourseClass,
		"evaluation" | "taf" | "teachingPeriod" | "isTeaching" | "catalogueUrl"
	>
>;

/** Each update carries the stored value it replaces, so a report can show both. */
export type CatalogueUpdates = {
	departments: {
		id: string;
		name: string;
		catalogueCode: string;
		before: string | null;
	}[];
	courses: { id: string; code: string; set: CourseSet; before: CourseSet }[];
	classes: {
		id: string;
		name: string;
		ssd: string;
		before: string | null;
		contested: boolean;
	}[];
	courseClasses: {
		courseId: string;
		classId: string;
		courseCode: string;
		code: string;
		name: string;
		set: CourseClassSet;
		before: CourseClassSet;
	}[];
	unmatched: { departments: number; courses: number; courseClasses: number };
};

/** The fields whose value would change; a `null` from the source never erases one. */
function changes<T extends object>(current: T, next: Partial<T>): Partial<T> {
	const out: Partial<T> = {};
	for (const field of Object.keys(next) as (keyof T)[]) {
		const value = next[field];
		if (value !== null && value !== undefined && value !== current[field]) {
			out[field] = value;
		}
	}
	return out;
}

function beforeOf<T extends object>(current: T, set: Partial<T>): Partial<T> {
	return Object.fromEntries(
		Object.keys(set).map(field => [field, current[field as keyof T]])
	) as Partial<T>;
}

/** The field values that differ from the source; a second run after applying returns none. */
export function planCatalogueUpdates(
	local: {
		departments: LocalDepartment[];
		courses: LocalCourse[];
		classes: LocalClassRow[];
		courseClasses: LocalCourseClass[];
	},
	source: {
		departments: SourceDepartment[];
		courses: SourceCourseFields[];
		activities: SourceActivity[];
		attributes: Map<string, SourceAttributes[]>;
	}
): CatalogueUpdates {
	const updates: CatalogueUpdates = {
		departments: [],
		courses: [],
		classes: [],
		courseClasses: [],
		unmatched: { departments: 0, courses: 0, courseClasses: 0 },
	};

	const departmentsByName = new Map(source.departments.map(d => [nameKey(d.name), d]));
	for (const department of local.departments) {
		const match = departmentsByName.get(nameKey(department.name));
		if (!match) {
			updates.unmatched.departments++;
			continue;
		}
		if (department.catalogueCode !== match.code) {
			updates.departments.push({
				id: department.id,
				name: department.name,
				catalogueCode: match.code,
				before: department.catalogueCode,
			});
		}
	}

	const coursesByCode = new Map(source.courses.map(c => [c.code, c]));
	for (const course of local.courses) {
		const match = coursesByCode.get(course.code);
		if (!match) {
			updates.unmatched.courses++;
			continue;
		}
		const set = changes(course, {
			nationalCode: match.codicione,
			degreeClass: match.degreeClass,
			teachingLanguage: match.teachingLanguage,
			restrictedAccess: match.restrictedAccess,
			catalogueUrl: match.url,
		});
		if (Object.keys(set).length > 0)
			updates.courses.push({
				id: course.id,
				code: course.code,
				set,
				before: beforeOf(course, set),
			});
	}

	const activitiesByPair = new Map<string, SourceActivity[]>();
	for (const activity of source.activities) {
		const k = pairKey(activity.courseCode, activity.code);
		const list = activitiesByPair.get(k) ?? [];
		list.push(activity);
		activitiesByPair.set(k, list);
	}

	const ssdByClass = new Map<
		string,
		{ academicYear: string; value: string | null }[]
	>();

	for (const row of local.courseClasses) {
		const k = pairKey(row.courseCode, normaliseCatalogueCode(row.code));
		const activities = activitiesByPair.get(k);
		const attributes = source.attributes.get(k);
		const sourced = Boolean(activities || attributes);
		if (!sourced) updates.unmatched.courseClasses++;

		const next: CourseClassSet = sourced
			? {
					evaluation: latest(
						(attributes ?? []).map(a => ({
							academicYear: a.academicYear,
							value: mapEvaluation(a.evaluation),
						}))
					).value,
					taf: consensus((activities ?? []).map(a => a.taf)).value,
					teachingPeriod: consensus((activities ?? []).map(a => a.teachingPeriod))
						.value,
				}
			: {};
		if (row.catalogueUrl === null && activities) {
			const url = catalogueUrlOf(activities);
			if (url) next.catalogueUrl = url;
		}
		if (row.isTeaching === null) {
			const classified = classifyTeaching(row.name, next.evaluation ?? row.evaluation);
			if (classified !== null) next.isTeaching = classified;
		}

		const set = changes(row, next);
		if (Object.keys(set).length > 0) {
			updates.courseClasses.push({
				courseId: row.courseId,
				classId: row.classId,
				courseCode: row.courseCode,
				code: row.code,
				name: row.name,
				set,
				before: beforeOf(row, set),
			});
		}

		const ssd = ssdByClass.get(row.classId) ?? [];
		ssd.push(
			...(attributes ?? []).map(a => ({ academicYear: a.academicYear, value: a.ssd }))
		);
		ssdByClass.set(row.classId, ssd);
	}

	for (const cls of local.classes) {
		const { value, contested } = latest(ssdByClass.get(cls.id) ?? []);
		if (value !== null && value !== cls.ssd) {
			updates.classes.push({
				id: cls.id,
				name: cls.name,
				ssd: value,
				before: cls.ssd,
				contested,
			});
		}
	}

	return updates;
}
