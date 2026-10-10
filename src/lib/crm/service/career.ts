import { and, asc, eq, inArray } from "drizzle-orm";

import type { DbOrTx } from "@/db";
import { getDb } from "@/db";
import { careerExams, classes, coursePlans, courses, departments } from "@/db/schema";
import { evaluateAchievementsInBackground } from "@/lib/achievements/service";
import { listCurricula } from "@/lib/catalog/db/course-curricula";
import { Invalid, NotFound } from "@/lib/server/errors";

import { findCurrentEnrollment, updateEnrollmentSettings } from "../db/enrollments";
import {
	type AddCareerExamInput,
	type CareerSettings,
	type SetCareerChoicesInput,
	type UpdateCareerExamInput,
	careerSettingsSchema,
} from "../schemas";
import type { Career, CareerChoiceGroup, CareerExam, Enrollment } from "../types";

type PlanRow = {
	code: string;
	classId: string | null;
	name: string;
	cfu: number | null;
	classYear: number;
	mandatory: boolean;
	groupCode: string | null;
	groupLabel: string | null;
	groupPosition: number | null;
	graded: boolean;
};

async function requireCurrentEnrollment(
	db: DbOrTx,
	userId: string
): Promise<Enrollment> {
	const enrollment = await findCurrentEnrollment(db, userId);
	if (!enrollment) throw new NotFound("Collega prima un corso di studi");
	return enrollment;
}

const settingsOf = (enrollment: Enrollment): CareerSettings =>
	careerSettingsSchema.parse(enrollment.careerSettings ?? {});

/** The plan rows of the enrolment's cohort: the common trunk and its curriculum, or why there are none. */
async function planOf(
	db: DbOrTx,
	enrollment: Enrollment
): Promise<{ rows: PlanRow[]; gap: Career["planGap"]; curriculumName: string | null }> {
	if (enrollment.startYear === null)
		return { rows: [], gap: "no-cohort", curriculumName: null };
	const curricula = await listCurricula(db, enrollment.courseId, enrollment.startYear);
	if (curricula.length === 0) return { rows: [], gap: "no-plan", curriculumName: null };

	const tracks = curricula.filter(curriculum => !curriculum.common);
	// A cohort with a single curriculum besides the trunk needs no choice from the student.
	const track =
		tracks.find(curriculum => curriculum.id === enrollment.curriculumId) ??
		(tracks.length === 1 ? tracks[0] : undefined);
	const ids = [
		...curricula.filter(c => c.common).map(c => c.id),
		...(track ? [track.id] : []),
	];

	const rows = await db
		.select({
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
		})
		.from(coursePlans)
		.where(inArray(coursePlans.curriculumId, ids))
		.orderBy(
			asc(coursePlans.classYear),
			asc(coursePlans.groupPosition),
			asc(coursePlans.name)
		);

	// The same activity can sit in the trunk and in a curriculum; the first one listed wins.
	const unique = [...new Map(rows.map(row => [row.code, row])).values()];
	return {
		rows: unique.map(({ evaluation, ...row }) => ({
			...row,
			graded: evaluation !== "PASS_FAIL",
		})),
		gap: tracks.length > 1 && !track ? "no-curriculum" : null,
		curriculumName: track?.name ?? null,
	};
}

/** A plan reuses one group code for every choice group of a year, so the position tells them apart. */
const groupKeyOf = (row: Pick<PlanRow, "groupCode" | "groupPosition">) =>
	`${row.groupCode}:${row.groupPosition ?? 0}`;

function choiceGroupsOf(rows: PlanRow[], exams: CareerExam[]): CareerChoiceGroup[] {
	const groups = new Map<string, CareerChoiceGroup>();
	for (const row of rows) {
		if (row.mandatory || !row.groupCode || !row.cfu) continue;
		const key = groupKeyOf(row);
		const group = groups.get(key) ?? {
			code: key,
			label: row.groupLabel,
			classYear: row.classYear,
			options: [],
			chosen: exams.filter(exam => exam.groupCode === key).map(exam => exam.id),
		};
		group.options.push({
			planCode: row.code,
			name: row.name,
			cfu: row.cfu,
			graded: row.graded,
		});
		groups.set(key, group);
	}
	return [...groups.values()];
}

const listExams = (db: DbOrTx, enrollmentId: string) =>
	db
		.select()
		.from(careerExams)
		.where(eq(careerExams.enrollmentId, enrollmentId))
		.orderBy(
			asc(careerExams.classYear),
			asc(careerExams.position),
			asc(careerExams.name)
		);

const missingMandatoryOf = (rows: PlanRow[], exams: CareerExam[]) => {
	const present = new Set(exams.map(exam => exam.planCode));
	return rows.filter(row => row.mandatory && row.cfu && !present.has(row.code));
};

export async function getCareer(userId: string): Promise<Career> {
	const db = getDb();
	const enrollment = await requireCurrentEnrollment(db, userId);
	const [[course], plan, exams] = await Promise.all([
		db
			.select({
				id: courses.id,
				name: courses.name,
				cfu: courses.cfu,
				courseType: courses.courseType,
				location: courses.location,
				degreeClass: courses.degreeClass,
				teachingLanguage: courses.teachingLanguage,
				catalogueUrl: courses.catalogueUrl,
				department: {
					id: departments.id,
					name: departments.name,
					code: departments.code,
				},
			})
			.from(courses)
			.innerJoin(departments, eq(departments.id, courses.departmentId))
			.where(eq(courses.id, enrollment.courseId)),
		planOf(db, enrollment),
		listExams(db, enrollment.id),
	]);

	if (!course) throw new NotFound("Corso non trovato");
	return {
		course,
		cohort: enrollment.startYear,
		curriculumName: plan.curriculumName,
		planGap: plan.gap,
		missingMandatory: missingMandatoryOf(plan.rows, exams).length,
		exams,
		choiceGroups: choiceGroupsOf(plan.rows, exams),
		settings: settingsOf(enrollment),
		settingsSaved: Object.keys(enrollment.careerSettings ?? {}).length > 0,
	};
}

/** Adds the plan's mandatory exams the record lacks; safe to repeat, and it never touches an existing row. */
export async function prefillCareer(userId: string): Promise<{ added: number }> {
	return getDb().transaction(async tx => {
		const enrollment = await requireCurrentEnrollment(tx, userId);
		const plan = await planOf(tx, enrollment);
		if (plan.gap === "no-cohort")
			throw new Invalid("Indica prima l'anno di immatricolazione");
		if (plan.gap === "no-plan")
			throw new Invalid("Per la tua coorte non c'è un piano ufficiale");

		const missing = missingMandatoryOf(plan.rows, await listExams(tx, enrollment.id));
		if (missing.length > 0) {
			await tx.insert(careerExams).values(
				missing.map((row, position) => ({
					enrollmentId: enrollment.id,
					classId: row.classId,
					planCode: row.code,
					name: row.name,
					cfu: row.cfu!,
					classYear: row.classYear,
					graded: row.graded,
					position,
				}))
			);
		}
		return { added: missing.length };
	});
}

export async function addCareerExam(
	userId: string,
	input: AddCareerExamInput
): Promise<CareerExam> {
	const db = getDb();
	const enrollment = await requireCurrentEnrollment(db, userId);

	let values: typeof careerExams.$inferInsert;
	if ("planCode" in input) {
		const { rows } = await planOf(db, enrollment);
		const row = rows.find(
			r =>
				r.code === input.planCode && !r.mandatory && groupKeyOf(r) === input.groupCode
		);
		if (!row || !row.cfu) throw new Invalid("Questo insegnamento non è nel tuo piano");
		values = {
			enrollmentId: enrollment.id,
			classId: row.classId,
			planCode: row.code,
			groupCode: groupKeyOf(row),
			name: row.name,
			cfu: row.cfu,
			classYear: row.classYear,
			graded: row.graded,
		};
	} else {
		if (input.classId) {
			const [known] = await db
				.select({ id: classes.id })
				.from(classes)
				.where(eq(classes.id, input.classId));
			if (!known) throw new NotFound("Insegnamento non trovato");
		}
		values = {
			enrollmentId: enrollment.id,
			classId: input.classId ?? null,
			name: input.name,
			cfu: input.cfu,
			classYear: input.classYear ?? null,
			graded: input.graded,
			external: !input.classId && input.external,
		};
	}

	const [exam] = await db.insert(careerExams).values(values).returning();
	return exam!;
}

/** Makes each listed choice group hold exactly the given plan exams; a removed one leaves the record with its grade. */
export async function setCareerChoices(
	userId: string,
	input: SetCareerChoicesInput
): Promise<{ added: number; removed: number }> {
	return getDb().transaction(async tx => {
		const enrollment = await requireCurrentEnrollment(tx, userId);
		const { rows } = await planOf(tx, enrollment);
		const exams = await listExams(tx, enrollment.id);
		let added = 0;
		let removed = 0;

		for (const choice of input.choices) {
			const options = rows.filter(
				row => !row.mandatory && row.cfu && groupKeyOf(row) === choice.groupCode
			);
			if (options.length === 0) throw new Invalid("Questo gruppo non è nel tuo piano");
			const wanted = new Set(choice.planCodes);
			if ([...wanted].some(code => !options.some(row => row.code === code))) {
				throw new Invalid("Questo insegnamento non è nel gruppo");
			}

			const held = exams.filter(exam => exam.groupCode === choice.groupCode);
			const drop = held.filter(exam => !exam.planCode || !wanted.has(exam.planCode));
			if (drop.length > 0) {
				await tx.delete(careerExams).where(
					inArray(
						careerExams.id,
						drop.map(exam => exam.id)
					)
				);
			}
			const missing = options.filter(
				row => wanted.has(row.code) && !held.some(exam => exam.planCode === row.code)
			);
			if (missing.length > 0) {
				await tx.insert(careerExams).values(
					missing.map(row => ({
						enrollmentId: enrollment.id,
						classId: row.classId,
						planCode: row.code,
						groupCode: choice.groupCode,
						name: row.name,
						cfu: row.cfu!,
						classYear: row.classYear,
						graded: row.graded,
					}))
				);
			}
			added += missing.length;
			removed += drop.length;
		}
		return { added, removed };
	});
}

/** The rules a row must keep after any change: a grade only on a passed or rejected graded exam, honours only on a 30. */
function checkExam(exam: CareerExam): void {
	if (!exam.graded && (exam.grade !== null || exam.honours)) {
		throw new Invalid("Un'idoneità non ha voto");
	}
	if (exam.status === "PLANNED" && exam.grade !== null) {
		throw new Invalid("Un esame da sostenere non ha ancora un voto");
	}
	if (exam.status === "PASSED" && exam.graded && exam.grade === null) {
		throw new Invalid("Indica il voto dell'esame superato");
	}
	if (exam.honours && exam.grade !== 30) throw new Invalid("La lode si dà solo con 30");
}

export async function updateCareerExam(
	userId: string,
	{ id, ...patch }: UpdateCareerExamInput
): Promise<CareerExam> {
	const exam = await getDb().transaction(async tx => {
		const enrollment = await requireCurrentEnrollment(tx, userId);
		const [current] = await tx
			.select()
			.from(careerExams)
			.where(and(eq(careerExams.id, id), eq(careerExams.enrollmentId, enrollment.id)));
		if (!current) throw new NotFound("Esame non trovato");

		const changes = Object.fromEntries(
			Object.entries(patch).filter(([, value]) => value !== undefined)
		) as Partial<CareerExam>;
		const next = { ...current, ...changes };
		// Name, CFU and kind come from the plan or the catalogue unless the student typed the exam.
		if (current.planCode !== null || current.classId !== null) {
			next.name = current.name;
			next.cfu = current.cfu;
			next.graded = current.graded;
			next.external = current.external;
		}
		// Leaving the passed state, or the graded kind, takes the grade with it.
		if (next.status === "PLANNED" || !next.graded) {
			next.grade = null;
			next.honours = false;
		}
		if (patch.honours && next.grade !== 30)
			throw new Invalid("La lode si dà solo con 30");
		if (next.grade !== 30) next.honours = false;
		checkExam(next);

		const [saved] = await tx
			.update(careerExams)
			.set({
				name: next.name,
				cfu: next.cfu,
				classYear: next.classYear,
				graded: next.graded,
				external: next.external,
				status: next.status,
				grade: next.grade,
				honours: next.honours,
				examDate: next.examDate,
			})
			.where(eq(careerExams.id, id))
			.returning();
		return saved!;
	});

	// After the commit, as for the enrolment: a passed exam can unlock a Carriera badge.
	evaluateAchievementsInBackground(userId);
	return exam;
}

export async function removeCareerExam(userId: string, id: string): Promise<void> {
	const db = getDb();
	const enrollment = await requireCurrentEnrollment(db, userId);
	const removed = await db
		.delete(careerExams)
		.where(and(eq(careerExams.id, id), eq(careerExams.enrollmentId, enrollment.id)))
		.returning({ id: careerExams.id });
	if (removed.length === 0) throw new NotFound("Esame non trovato");
}

export async function updateCareerSettings(
	userId: string,
	settings: CareerSettings
): Promise<CareerSettings> {
	return getDb().transaction(async tx => {
		const enrollment = await requireCurrentEnrollment(tx, userId);
		const parsed = careerSettingsSchema.parse(settings);
		await updateEnrollmentSettings(tx, enrollment.id, parsed);
		return parsed;
	});
}
