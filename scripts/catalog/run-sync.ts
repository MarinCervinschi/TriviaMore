// The catalogue sync as a function of the database it writes to, shared by `pnpm catalog:sync` and the console's worker.
import { and, eq, inArray, max } from "drizzle-orm";

import type { Db } from "../../src/db/index.ts";
import {
	classes,
	courseClasses,
	courseCurricula,
	coursePlans,
	courses,
	departments,
} from "../../src/db/schema/index.ts";
import { academicYearOf } from "../../src/lib/catalog/academic-year.ts";
import {
	type CatalogueAdditions,
	planCatalogueAdditions,
} from "../../src/lib/catalog/sync/additions.ts";
import {
	type CohortPlanChanges,
	type SourceCohort,
	planCohortPlans,
} from "../../src/lib/catalog/sync/cohort-plans.ts";
import { pairKey } from "../../src/lib/catalog/sync/diff.ts";
import { planCatalogueUpdates } from "../../src/lib/catalog/sync/plan.ts";
import type { CatalogueUpdates } from "../../src/lib/catalog/sync/plan.ts";
import {
	fetchActivityAttributes,
	fetchCourses,
	fetchDepartments,
	fetchYear,
	fetchYears,
} from "./source.ts";

const FIRST_COHORT = 2021;
const CURRENT = academicYearOf(new Date());

type Progress = (message: string) => void;

async function readLocal(db: Db) {
	const [
		departmentRows,
		courseRows,
		classRows,
		courseClassRows,
		curriculumRows,
		planRows,
	] = await Promise.all([
		db
			.select({
				id: departments.id,
				name: departments.name,
				catalogueCode: departments.catalogueCode,
			})
			.from(departments),
		db
			.select({
				id: courses.id,
				code: courses.code,
				nationalCode: courses.nationalCode,
				degreeClass: courses.degreeClass,
				teachingLanguage: courses.teachingLanguage,
				restrictedAccess: courses.restrictedAccess,
				catalogueUrl: courses.catalogueUrl,
			})
			.from(courses),
		db.select({ id: classes.id, name: classes.name, ssd: classes.ssd }).from(classes),
		db
			.select({
				courseId: courseClasses.courseId,
				classId: courseClasses.classId,
				courseCode: courses.code,
				code: courseClasses.code,
				name: classes.name,
				evaluation: courseClasses.evaluation,
				taf: courseClasses.taf,
				teachingPeriod: courseClasses.teachingPeriod,
				isTeaching: courseClasses.isTeaching,
				catalogueUrl: courseClasses.catalogueUrl,
			})
			.from(courseClasses)
			.innerJoin(courses, eq(courses.id, courseClasses.courseId))
			.innerJoin(classes, eq(classes.id, courseClasses.classId)),
		db
			.select({
				id: courseCurricula.id,
				courseId: courseCurricula.courseId,
				cohort: courseCurricula.cohort,
				code: courseCurricula.code,
				name: courseCurricula.name,
				common: courseCurricula.common,
			})
			.from(courseCurricula),
		db
			.select({
				id: coursePlans.id,
				courseId: coursePlans.courseId,
				cohort: coursePlans.cohort,
				curriculum: courseCurricula.code,
				code: coursePlans.code,
				classId: coursePlans.classId,
				name: coursePlans.name,
				cfu: coursePlans.cfu,
				classYear: coursePlans.classYear,
				mandatory: coursePlans.mandatory,
				groupCode: coursePlans.groupCode,
				groupLabel: coursePlans.groupLabel,
				groupPosition: coursePlans.groupPosition,
				evaluation: coursePlans.evaluation,
				taf: coursePlans.taf,
				teachingPeriod: coursePlans.teachingPeriod,
			})
			.from(coursePlans)
			.innerJoin(courseCurricula, eq(courseCurricula.id, coursePlans.curriculumId)),
	]);
	return {
		departments: departmentRows,
		courses: courseRows,
		classes: classRows,
		courseClasses: courseClassRows,
		curricula: curriculumRows,
		plans: planRows,
	};
}

/** Our code for each year's course code, through the national code; a year's code that reaches two of our courses is dropped. */
async function localCourseCodes(
	local: { code: string; nationalCode: string | null }[]
) {
	const byNational = new Map(
		local.filter(c => c.nationalCode).map(c => [c.nationalCode!, c.code])
	);
	const seen = new Map<string, Set<string>>();
	for (let year = FIRST_COHORT; year <= CURRENT; year++) {
		for (const course of await fetchCourses(String(year))) {
			const ours = course.codicione ? byNational.get(course.codicione) : undefined;
			if (!ours) continue;
			const codes = seen.get(course.code) ?? new Set<string>();
			codes.add(ours);
			seen.set(course.code, codes);
		}
	}
	return new Map(
		[...seen]
			.filter(([, codes]) => codes.size === 1)
			.map(([code, codes]) => [code, [...codes][0]!])
	);
}

function rekey<T>(index: Map<string, T[]>, toLocal: (code: string) => string) {
	const out = new Map<string, T[]>();
	for (const [k, values] of index) {
		const [courseCode, code] = k.split("\u0000") as [string, string];
		const key = pairKey(toLocal(courseCode), code);
		out.set(key, [...(out.get(key) ?? []), ...values]);
	}
	return out;
}

async function readSource(db: Db, yearCode: string, progress: Progress) {
	const year = await fetchYear(yearCode, (done, total) =>
		progress(`piani ${done}/${total}`)
	);
	const [courseRows, attributes, departmentRows, codes] = await Promise.all([
		fetchCourses(yearCode),
		fetchActivityAttributes(),
		fetchDepartments(),
		localCourseCodes((await readLocal(db)).courses),
	]);
	// The planners match courses by our code, and a course's code in the catalogue changes between years.
	const toLocal = (code: string) => codes.get(code) ?? code;
	return {
		departments: departmentRows,
		courses: courseRows.map(c => ({ ...c, code: toLocal(c.code) })),
		activities: year.activities.map(a => ({ ...a, courseCode: toLocal(a.courseCode) })),
		mandatory: rekey(year.mandatory, toLocal),
		attributes: rekey(attributes, toLocal),
		rawAttributes: attributes,
	};
}

async function readCohorts(progress: Progress): Promise<SourceCohort[]> {
	const years = (await fetchYears())
		.map(Number)
		.filter(year => year >= FIRST_COHORT && year <= CURRENT);
	const cohorts: SourceCohort[] = [];
	for (const year of years) {
		const source = await fetchYear(String(year), (done, total) =>
			progress(`coorte ${year} ${done}/${total}`)
		);
		cohorts.push({
			cohort: year,
			courses: source.courses,
			activities: source.activities,
			curricula: source.curricula,
		});
	}
	return cohorts;
}

const planChanges = ({ curricula, plans }: CohortPlanChanges) =>
	[curricula, plans].reduce(
		(n, c) => n + c.inserts.length + c.updates.length + c.deletes.length,
		0
	);

async function applyPlans(db: Db, plan: CohortPlanChanges) {
	const { curricula, plans } = plan;
	await db.transaction(async tx => {
		if (curricula.deletes.length > 0) {
			await tx
				.delete(courseCurricula)
				.where(inArray(courseCurricula.id, curricula.deletes));
		}
		for (let i = 0; i < curricula.inserts.length; i += 500) {
			await tx.insert(courseCurricula).values(curricula.inserts.slice(i, i + 500));
		}
		for (const row of curricula.updates) {
			await tx
				.update(courseCurricula)
				.set(row.set)
				.where(eq(courseCurricula.id, row.id));
		}

		const ids = new Map(
			(
				await tx
					.select({
						id: courseCurricula.id,
						courseId: courseCurricula.courseId,
						cohort: courseCurricula.cohort,
						code: courseCurricula.code,
					})
					.from(courseCurricula)
			).map(c => [`${c.courseId}\u0000${c.cohort}\u0000${c.code}`, c.id])
		);

		if (plans.deletes.length > 0) {
			await tx.delete(coursePlans).where(inArray(coursePlans.id, plans.deletes));
		}
		const rows = plans.inserts.map(({ curriculum, ...row }) => ({
			...row,
			curriculumId: ids.get(`${row.courseId}\u0000${row.cohort}\u0000${curriculum}`)!,
		}));
		for (let i = 0; i < rows.length; i += 500) {
			await tx.insert(coursePlans).values(rows.slice(i, i + 500));
		}
		for (const row of plans.updates) {
			await tx.update(coursePlans).set(row.set).where(eq(coursePlans.id, row.id));
		}
	});
}

async function applyAdditions(db: Db, plan: CatalogueAdditions) {
	await db.transaction(async tx => {
		const created = new Map<string, string>();
		for (const row of plan.additions) {
			if (row.classId || created.has(row.code)) continue;
			const [inserted] = await tx
				.insert(classes)
				.values({ name: row.name, cfu: row.cfu, ssd: row.ssd })
				.returning({ id: classes.id });
			created.set(row.code, inserted!.id);
		}

		const next = new Map<string, number>();
		for (const row of plan.additions) {
			if (!next.has(row.courseId)) {
				const [top] = await tx
					.select({ value: max(courseClasses.position) })
					.from(courseClasses)
					.where(eq(courseClasses.courseId, row.courseId));
				next.set(row.courseId, (top?.value ?? -1) + 1);
			}
			const position = next.get(row.courseId)!;
			next.set(row.courseId, position + 1);

			await tx.insert(courseClasses).values({
				courseId: row.courseId,
				classId: row.classId ?? created.get(row.code)!,
				code: row.code,
				classYear: row.classYear,
				mandatory: row.mandatory,
				evaluation: row.evaluation,
				taf: row.taf,
				teachingPeriod: row.teachingPeriod,
				isTeaching: row.isTeaching,
				catalogueUrl: row.catalogueUrl,
				position,
			});
		}
	});
}

async function apply(db: Db, plan: CatalogueUpdates) {
	await db.transaction(async tx => {
		for (const row of plan.departments) {
			await tx
				.update(departments)
				.set({ catalogueCode: row.catalogueCode })
				.where(eq(departments.id, row.id));
		}
		for (const row of plan.courses) {
			await tx.update(courses).set(row.set).where(eq(courses.id, row.id));
		}
		for (const row of plan.classes) {
			await tx.update(classes).set({ ssd: row.ssd }).where(eq(classes.id, row.id));
		}
		for (const row of plan.courseClasses) {
			await tx
				.update(courseClasses)
				.set(row.set)
				.where(
					and(
						eq(courseClasses.courseId, row.courseId),
						eq(courseClasses.classId, row.classId)
					)
				);
		}
	});
}

const total = (plan: CatalogueUpdates) =>
	plan.departments.length +
	plan.courses.length +
	plan.classes.length +
	plan.courseClasses.length;

export type SyncReport = {
	additions: CatalogueAdditions;
	updates: CatalogueUpdates;
	plans: CohortPlanChanges;
	cohorts: number[];
	applied: boolean;
	/** Rows a second plan still finds after applying; anything above zero means the apply missed something. */
	left: number;
};

/** Plans the sync against the catalogue for `year`, and applies it when `apply` is set. */
export async function syncCatalog(
	db: Db,
	{
		year,
		apply: write,
		progress = () => undefined,
	}: { year: string; apply: boolean; progress?: Progress }
): Promise<SyncReport> {
	progress(`Catalogo ufficiale ${year}…`);
	const source = await readSource(db, year, progress);
	const additions = planCatalogueAdditions(await readLocal(db), source);
	const updates = planCatalogueUpdates(await readLocal(db), source);

	progress("Piani di studio per coorte…");
	const cohorts = await readCohorts(progress);
	const cohortSource = { cohorts, attributes: source.rawAttributes };
	const plans = planCohortPlans(await readLocal(db), cohortSource);
	const report = {
		additions,
		updates,
		plans,
		cohorts: cohorts.map(c => c.cohort),
		applied: false,
		left: 0,
	};

	if (!write || additions.additions.length + total(updates) + planChanges(plans) === 0)
		return report;

	await applyAdditions(db, additions);
	const appliedUpdates = planCatalogueUpdates(await readLocal(db), source);
	await apply(db, appliedUpdates);
	// The classes the additions created are only linkable once they exist.
	const appliedPlans = planCohortPlans(await readLocal(db), cohortSource);
	await applyPlans(db, appliedPlans);
	// A re-plan after applying must be empty, or the apply missed something.
	const local = await readLocal(db);
	const left =
		planCatalogueAdditions(local, source).additions.length +
		total(planCatalogueUpdates(local, source)) +
		planChanges(planCohortPlans(local, cohortSource));
	return {
		...report,
		updates: appliedUpdates,
		plans: appliedPlans,
		applied: true,
		left,
	};
}

export const catalogueRowCount = total;
export const planRowCount = planChanges;
