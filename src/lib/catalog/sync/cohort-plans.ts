import { normaliseCatalogueCode } from "../codes";
import { COMPULSORY_GROUP } from "../constants";
import { toCatalogueTitle } from "./additions";
import { curriculumName } from "./curricula";
import { type SourceActivity, pairKey } from "./diff";
import {
	type Evaluation,
	type SourceAttributes,
	consensus,
	latest,
	mapEvaluation,
} from "./plan";

export type CurriculumRow = {
	courseId: string;
	cohort: number;
	code: string;
	name: string;
	common: boolean;
};

export type StoredCurriculum = CurriculumRow & { id: string };

export type PlanRow = {
	courseId: string;
	cohort: number;
	curriculum: string;
	code: string;
	classId: string | null;
	name: string;
	cfu: number | null;
	classYear: number;
	mandatory: boolean;
	groupCode: string | null;
	groupLabel: string | null;
	groupPosition: number | null;
	evaluation: Evaluation | null;
	taf: string | null;
	teachingPeriod: string | null;
};

export type StoredPlanRow = PlanRow & { id: string };

export type SourceCohort = {
	cohort: number;
	courses: { code: string; codicione: string | null; name: string }[];
	activities: SourceActivity[];
	curricula: { courseCode: string; code: string; labels: string[]; common: boolean }[];
};

type Changes<Row> = {
	inserts: Row[];
	updates: { id: string; set: Partial<Row> }[];
	deletes: string[];
};

export type CohortPlanChanges = {
	curricula: Changes<CurriculumRow>;
	plans: Changes<PlanRow>;
	unmatchedCourses: number;
};

const PLAN_FIELDS = [
	"classId",
	"name",
	"cfu",
	"classYear",
	"mandatory",
	"groupCode",
	"groupLabel",
	"groupPosition",
	"evaluation",
	"taf",
	"teachingPeriod",
] as const;

const CURRICULUM_FIELDS = ["name", "common"] as const;

const nameKey = (name: string) => name.toLowerCase().replace(/\s+/g, " ").trim();
const key = (...parts: (string | number)[]) => parts.join("\u0000");

function diff<Row, Stored extends Row & { id: string }>(
	desired: Map<string, Row>,
	stored: Map<string, Stored>,
	fields: readonly (keyof Row)[],
	isCovered: (row: Stored) => boolean
): Changes<Row> {
	const changes: Changes<Row> = { inserts: [], updates: [], deletes: [] };
	for (const [k, row] of desired) {
		const current = stored.get(k);
		if (!current) {
			changes.inserts.push(row);
			continue;
		}
		const set: Partial<Row> = {};
		for (const field of fields) {
			if ((row[field] as unknown) !== current[field]) set[field] = row[field];
		}
		if (Object.keys(set).length > 0) changes.updates.push({ id: current.id, set });
	}
	for (const [k, row] of stored) {
		if (!desired.has(k) && isCovered(row)) changes.deletes.push(row.id);
	}
	return changes;
}

/** The curricula and plan rows each cohort needs, against those stored; a course the source returned nothing for is left alone. */
export function planCohortPlans(
	local: {
		courses: { id: string; nationalCode: string | null }[];
		courseClasses: { courseId: string; classId: string; code: string; name: string }[];
		curricula: StoredCurriculum[];
		plans: StoredPlanRow[];
	},
	source: { cohorts: SourceCohort[]; attributes: Map<string, SourceAttributes[]> }
): CohortPlanChanges {
	const courseIdByNational = new Map(
		local.courses.filter(c => c.nationalCode).map(c => [c.nationalCode!, c.id])
	);

	const classInCourse = new Map<string, string>();
	const classIdsByName = new Map<string, Set<string>>();
	const classIdsByCode = new Map<string, Set<string>>();
	for (const row of local.courseClasses) {
		const code = normaliseCatalogueCode(row.code);
		classInCourse.set(key(row.courseId, code), row.classId);
		const nameKeyOf = key(row.courseId, nameKey(row.name));
		const named = classIdsByName.get(nameKeyOf) ?? new Set<string>();
		named.add(row.classId);
		classIdsByName.set(nameKeyOf, named);
		const ids = classIdsByCode.get(code) ?? new Set<string>();
		ids.add(row.classId);
		classIdsByCode.set(code, ids);
	}

	const resolveClass = (courseId: string, code: string, name: string) => {
		const sameCourse = classInCourse.get(key(courseId, code));
		if (sameCourse) return sameCourse;
		const elsewhere = classIdsByCode.get(code);
		if (elsewhere?.size === 1) return [...elsewhere][0]!;
		const named = classIdsByName.get(key(courseId, nameKey(name)));
		return named?.size === 1 ? [...named][0]! : null;
	};

	const matchCourses = (cohort: SourceCohort) => {
		const byCode = new Map<string, { id: string; name: string }>();
		for (const course of cohort.courses) {
			const id = course.codicione
				? courseIdByNational.get(course.codicione)
				: undefined;
			if (id) byCode.set(course.code, { id, name: course.name });
		}
		return byCode;
	};

	// The attributes are keyed by the year's course code, which changes between years.
	const codesByCourse = new Map<string, Set<string>>();
	for (const cohort of source.cohorts) {
		for (const [code, { id }] of matchCourses(cohort)) {
			const codes = codesByCourse.get(id) ?? new Set<string>();
			codes.add(code);
			codesByCourse.set(id, codes);
		}
	}
	const attributesOf = (courseId: string, code: string) =>
		[...(codesByCourse.get(courseId) ?? [])].flatMap(
			courseCode => source.attributes.get(pairKey(courseCode, code)) ?? []
		);

	const curricula = new Map<string, CurriculumRow>();
	const plans = new Map<string, PlanRow>();
	const covered = new Set<string>();
	let unmatchedCourses = 0;

	for (const cohort of source.cohorts) {
		const courseByCode = matchCourses(cohort);
		unmatchedCourses += cohort.courses.length - courseByCode.size;

		const groups = new Map<string, SourceActivity[]>();
		for (const activity of cohort.activities) {
			if (!activity.curriculum || !courseByCode.has(activity.courseCode)) continue;
			const k = key(activity.courseCode, activity.curriculum, activity.code);
			const list = groups.get(k) ?? [];
			list.push(activity);
			groups.set(k, list);
		}

		const offered = new Set<string>();
		for (const activities of groups.values()) {
			const first = activities[0]!;
			const curriculum = first.curriculum!;
			const classYear = consensus(activities.map(a => a.classYear)).value;
			if (classYear === null) continue;
			const courseId = courseByCode.get(first.courseCode)!.id;
			covered.add(key(courseId, cohort.cohort));
			offered.add(key(first.courseCode, curriculum));

			const name = toCatalogueTitle(
				consensus(activities.map(a => a.name)).value ?? first.name
			);
			plans.set(key(courseId, cohort.cohort, curriculum, first.code), {
				courseId,
				cohort: cohort.cohort,
				curriculum,
				code: first.code,
				classId: resolveClass(courseId, first.code, name),
				name,
				cfu: consensus(activities.map(a => a.cfu)).value,
				classYear,
				mandatory:
					consensus(activities.map(a => a.group === COMPULSORY_GROUP)).value ?? false,
				groupCode: consensus(activities.map(a => a.group)).value,
				groupLabel: consensus(activities.map(a => a.groupLabel)).value,
				groupPosition: consensus(activities.map(a => a.groupPosition)).value,
				evaluation: latest(
					attributesOf(courseId, first.code).map(a => ({
						academicYear: a.academicYear,
						value: mapEvaluation(a.evaluation),
					}))
				).value,
				taf: consensus(activities.map(a => a.taf)).value,
				teachingPeriod: consensus(activities.map(a => a.teachingPeriod)).value,
			});
		}

		for (const curriculum of cohort.curricula) {
			const course = courseByCode.get(curriculum.courseCode);
			if (!course || !offered.has(key(curriculum.courseCode, curriculum.code)))
				continue;
			curricula.set(key(course.id, cohort.cohort, curriculum.code), {
				courseId: course.id,
				cohort: cohort.cohort,
				code: curriculum.code,
				name: curriculumName(
					curriculum.labels,
					course.name,
					curriculum.code,
					curriculum.common
				),
				common: curriculum.common,
			});
		}
	}

	const isCovered = (row: { courseId: string; cohort: number }) =>
		covered.has(key(row.courseId, row.cohort));

	const curriculumChanges = diff(
		curricula,
		new Map(local.curricula.map(c => [key(c.courseId, c.cohort, c.code), c])),
		CURRICULUM_FIELDS,
		isCovered
	);

	const planChanges = diff(
		plans,
		new Map(local.plans.map(p => [key(p.courseId, p.cohort, p.curriculum, p.code), p])),
		PLAN_FIELDS,
		isCovered
	);
	// A dropped curriculum takes its plan rows with it.
	const dropped = new Set(
		local.curricula
			.filter(c => curriculumChanges.deletes.includes(c.id))
			.map(c => key(c.courseId, c.cohort, c.code))
	);
	const deleted = new Set(planChanges.deletes);
	planChanges.deletes = local.plans
		.filter(
			p => deleted.has(p.id) && !dropped.has(key(p.courseId, p.cohort, p.curriculum))
		)
		.map(p => p.id);

	return { curricula: curriculumChanges, plans: planChanges, unmatchedCourses };
}
