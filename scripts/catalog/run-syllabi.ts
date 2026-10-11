// The syllabus import as a function of the database it writes to, shared by `pnpm catalog:syllabi` and the console's worker.
import { eq, isNotNull } from "drizzle-orm";

import type { Db } from "../../src/db/index.ts";
import {
	classSyllabi,
	classes,
	courseCurricula,
	coursePlans,
	courses,
} from "../../src/db/schema/index.ts";
import { academicYearOf } from "../../src/lib/catalog/academic-year.ts";
import type { SyllabusRef } from "../../src/lib/catalog/sync/diff.ts";
import {
	type Syllabus,
	type SyllabusChanges,
	planSyllabi,
	readSyllabus,
} from "../../src/lib/catalog/sync/syllabi.ts";
import { fetchSyllabus, fetchYear, fetchYears } from "./source.ts";

const FIRST_COHORT = 2021;
const CURRENT = academicYearOf(new Date());
// Most classes publish within two offerings; the cap bounds the requests for one that never does.
const MAX_TRIES = 6;

type Candidate = { ref: SyllabusRef; catalogueUrl: string | null };

type Progress = (message: string) => void;

async function readLocal(db: Db) {
	const [classRows, syllabusRows, planRows, courseRows] = await Promise.all([
		db.select({ id: classes.id, description: classes.description }).from(classes),
		db.select().from(classSyllabi),
		db
			.select({
				classId: coursePlans.classId,
				courseId: coursePlans.courseId,
				cohort: coursePlans.cohort,
				curriculum: courseCurricula.code,
				code: coursePlans.code,
			})
			.from(coursePlans)
			.innerJoin(courseCurricula, eq(courseCurricula.id, coursePlans.curriculumId))
			.where(isNotNull(coursePlans.classId)),
		db
			.select({ id: courses.id, nationalCode: courses.nationalCode })
			.from(courses)
			.where(isNotNull(courses.nationalCode)),
	]);
	return {
		classes: classRows,
		syllabi: syllabusRows.map(({ createdAt: _c, updatedAt: _u, ...row }) => row),
		plans: planRows,
		courseByNational: new Map(courseRows.map(row => [row.nationalCode!, row.id])),
	};
}

// A curriculum code is shared by many courses, so the course is part of the key.
const planKey = (cohort: number, courseId: string, curriculum: string, code: string) =>
	[cohort, courseId, curriculum, code].join("\u0000");

async function readCandidates(
	{ plans, courseByNational }: Awaited<ReturnType<typeof readLocal>>,
	progress: Progress
) {
	const classOf = new Map(
		plans.map(p => [planKey(p.cohort, p.courseId, p.curriculum, p.code), p.classId!])
	);
	const years = (await fetchYears())
		.map(Number)
		.filter(year => year >= FIRST_COHORT && year <= CURRENT);

	const candidates = new Map<string, Candidate[]>();
	for (const year of years) {
		const { activities } = await fetchYear(String(year), (done, total) =>
			progress(`piani ${year} ${done}/${total}`)
		);
		for (const activity of activities) {
			const ref = activity.syllabusRef;
			if (!ref || ref.offerYear > CURRENT || !activity.curriculum) continue;
			const courseId = activity.codicione && courseByNational.get(activity.codicione);
			if (!courseId) continue;
			const classId = classOf.get(
				planKey(year, courseId, activity.curriculum, activity.code)
			);
			if (!classId) continue;
			const list = candidates.get(classId) ?? [];
			const seen = list.some(
				c =>
					c.ref.offerYear === ref.offerYear &&
					c.ref.activityId === ref.activityId &&
					c.ref.curriculumId === ref.curriculumId
			);
			if (!seen) list.push({ ref, catalogueUrl: activity.catalogueUrl });
			candidates.set(classId, list);
		}
	}
	return candidates;
}

async function readSyllabi(candidates: Map<string, Candidate[]>, progress: Progress) {
	const found = new Map<string, Syllabus>();
	let done = 0;
	for (const [classId, list] of candidates) {
		list.sort((a, b) => b.ref.offerYear - a.ref.offerYear);
		for (const { ref, catalogueUrl } of list.slice(0, MAX_TRIES)) {
			const syllabus = readSyllabus(
				await fetchSyllabus(ref),
				ref.offerYear,
				catalogueUrl
			);
			if (syllabus) {
				found.set(classId, syllabus);
				break;
			}
		}
		progress(`syllabi ${++done}/${candidates.size}`);
	}
	return found;
}

const total = (plan: SyllabusChanges) =>
	plan.inserts.length + plan.updates.length + plan.descriptions.length;

async function apply(db: Db, plan: SyllabusChanges) {
	await db.transaction(async tx => {
		for (let i = 0; i < plan.inserts.length; i += 200) {
			await tx.insert(classSyllabi).values(plan.inserts.slice(i, i + 200));
		}
		for (const row of plan.updates) {
			await tx
				.update(classSyllabi)
				.set(row.set)
				.where(eq(classSyllabi.classId, row.classId));
		}
		for (const row of plan.descriptions) {
			await tx
				.update(classes)
				.set({ description: row.description })
				.where(eq(classes.id, row.classId));
		}
	});
}

export type SyllabiReport = {
	plan: SyllabusChanges;
	classCount: number;
	found: number;
	applied: boolean;
	/** Rows a second plan still finds after applying; anything above zero means the apply missed something. */
	left: number;
};

/** Plans the import of every class's official syllabus, and applies it when `apply` is set. */
export async function importSyllabi(
	db: Db,
	{ apply: write, progress = () => undefined }: { apply: boolean; progress?: Progress }
): Promise<SyllabiReport> {
	progress("Syllabi dal catalogo ufficiale…");
	const local = await readLocal(db);
	const found = await readSyllabi(await readCandidates(local, progress), progress);
	const plan = planSyllabi(local, found);
	const report = {
		plan,
		classCount: local.classes.length,
		found: found.size,
		applied: false,
		left: 0,
	};
	if (!write || total(plan) === 0) return report;

	progress("Scrittura…");
	await apply(db, plan);
	// A re-plan after applying must be empty, or the apply missed something.
	return {
		...report,
		applied: true,
		left: total(planSyllabi(await readLocal(db), found)),
	};
}

export const syllabusRowCount = total;
