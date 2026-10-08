import { and, eq } from "drizzle-orm";

import type { DbOrTx } from "@/db";
import { getDb } from "@/db";
import { courseCurricula, courses, departments, enrollments } from "@/db/schema";
import { evaluateAchievementsInBackground } from "@/lib/achievements/service";
import { findCurriculum, listCurricula } from "@/lib/catalog/db/course-curricula";
import { Invalid, NotFound } from "@/lib/server/errors";

import {
	findCurrentEnrollment,
	findEnrollmentByCourse,
	insertEnrollment,
	setEnrollmentCurrent,
	updateEnrollmentDetails,
} from "../db/enrollments";
import type { SetEnrollmentInput } from "../schemas";
import type { CurrentEnrollment, CurriculumOption } from "../types";

async function selectCurrentEnrollment(
	db: DbOrTx,
	userId: string
): Promise<CurrentEnrollment | null> {
	const [row] = await db
		.select({
			id: enrollments.id,
			courseId: courses.id,
			courseName: courses.name,
			courseCode: courses.code,
			courseType: courses.courseType,
			courseCfu: courses.cfu,
			departmentId: departments.id,
			departmentName: departments.name,
			departmentCode: departments.code,
			curriculumId: enrollments.curriculumId,
			curriculumName: courseCurricula.name,
			startYear: enrollments.startYear,
		})
		.from(enrollments)
		.innerJoin(courses, eq(courses.id, enrollments.courseId))
		.leftJoin(courseCurricula, eq(courseCurricula.id, enrollments.curriculumId))
		.innerJoin(departments, eq(departments.id, courses.departmentId))
		.where(and(eq(enrollments.userId, userId), eq(enrollments.isCurrent, true)))
		.limit(1);

	return row ?? null;
}

export async function getCurrentEnrollment(
	userId: string
): Promise<CurrentEnrollment | null> {
	return selectCurrentEnrollment(getDb(), userId);
}

export async function hasEnrollment(userId: string): Promise<boolean> {
	return (await findCurrentEnrollment(getDb(), userId)) !== undefined;
}

/** The curricula a student of this course and cohort can pick; empty when the plan has only the common trunk. */
export async function getCurriculumOptions(
	courseId: string,
	startYear: number
): Promise<CurriculumOption[]> {
	const curricula = await listCurricula(getDb(), courseId, startYear);
	const options = curricula.filter(curriculum => !curriculum.common);
	return options.length > 1
		? options.map(({ id, code, name }) => ({ id, code, name }))
		: [];
}

/** A curriculum must belong to the course's plan for the enrolment's cohort; a cohort change drops a stale one. */
async function resolveCurriculum(
	db: DbOrTx,
	courseId: string,
	startYear: number | null | undefined,
	requested: string | null | undefined,
	held: string | null | undefined
): Promise<string | null | undefined> {
	const id = requested === undefined ? held : requested;
	if (!id) return requested === undefined && !held ? undefined : null;
	const curriculum = await findCurriculum(db, id);
	const matches =
		curriculum &&
		curriculum.courseId === courseId &&
		!curriculum.common &&
		(startYear == null || curriculum.cohort === startYear);
	if (matches) return id;
	if (requested !== undefined) {
		throw new Invalid("Il curriculum non fa parte del piano di questo corso e anno");
	}
	return null;
}

/** Re-selecting a course held before promotes that row instead of inserting another. */
export async function setEnrollment(
	userId: string,
	input: SetEnrollmentInput
): Promise<CurrentEnrollment> {
	const enrollment = await getDb().transaction(async tx => {
		const [course] = await tx
			.select({ id: courses.id })
			.from(courses)
			.where(eq(courses.id, input.courseId))
			.limit(1);
		if (!course) throw new NotFound("Corso di studi non trovato");

		const current = await findCurrentEnrollment(tx, userId);
		const previous = await findEnrollmentByCourse(tx, userId, input.courseId);
		const held = previous ?? undefined;
		const startYear = input.startYear === undefined ? held?.startYear : input.startYear;
		const details = {
			startYear: input.startYear,
			curriculumId: await resolveCurriculum(
				tx,
				input.courseId,
				startYear,
				input.curriculumId,
				held?.curriculumId
			),
		};

		if (current?.courseId === input.courseId) {
			await updateEnrollmentDetails(tx, current.id, details);
		} else {
			if (current) await setEnrollmentCurrent(tx, current.id, false);

			if (previous) {
				await setEnrollmentCurrent(tx, previous.id, true);
				await updateEnrollmentDetails(tx, previous.id, details);
			} else {
				await insertEnrollment(tx, { userId, courseId: input.courseId, ...details });
			}
		}

		const saved = await selectCurrentEnrollment(tx, userId);
		if (!saved) throw new NotFound("Iscrizione non trovata");
		return saved;
	});

	// After the commit, so the evaluation sees the row and a failed unlock cannot roll it back.
	evaluateAchievementsInBackground(userId);

	return enrollment;
}
