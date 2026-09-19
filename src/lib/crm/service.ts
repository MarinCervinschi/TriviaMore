import { and, eq } from "drizzle-orm";

import type { DbOrTx } from "@/db";
import { getDb } from "@/db";
import { courses, departments, enrollments } from "@/db/schema";
import { evaluateAchievementsInBackground } from "@/lib/achievements/service";
import { NotFound } from "@/lib/server/errors";

import {
	findCurrentEnrollment,
	findEnrollmentByCourse,
	insertEnrollment,
	setEnrollmentCurrent,
	updateEnrollmentDetails,
} from "./db/enrollments";
import type { SetEnrollmentInput } from "./schemas";
import type { CurrentEnrollment } from "./types";

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
			curriculum: enrollments.curriculum,
			startYear: enrollments.startYear,
		})
		.from(enrollments)
		.innerJoin(courses, eq(courses.id, enrollments.courseId))
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

/** Re-selecting a course held before promotes that row rather than inserting a
 *  second one, so what hangs off its id survives switching back and forth. */
export async function setEnrollment(
	userId: string,
	input: SetEnrollmentInput
): Promise<CurrentEnrollment> {
	const details = { curriculum: input.curriculum, startYear: input.startYear };

	const enrollment = await getDb().transaction(async tx => {
		const [course] = await tx
			.select({ id: courses.id })
			.from(courses)
			.where(eq(courses.id, input.courseId))
			.limit(1);
		if (!course) throw new NotFound("Corso di studi non trovato");

		const current = await findCurrentEnrollment(tx, userId);

		if (current?.courseId === input.courseId) {
			await updateEnrollmentDetails(tx, current.id, details);
		} else {
			if (current) await setEnrollmentCurrent(tx, current.id, false);

			const previous = await findEnrollmentByCourse(tx, userId, input.courseId);
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

	// After the commit, never inside it: the evaluation has to see the row, and a
	// failed unlock must not roll back the enrolment that earned it.
	evaluateAchievementsInBackground(userId);

	return enrollment;
}
