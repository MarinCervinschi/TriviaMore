import { and, asc, eq } from "drizzle-orm";

import type { DbOrTx } from "@/db";
import { courseCurricula } from "@/db/schema";

/** The cohorts a course has a plan for, newest first. */
export async function listCohorts(db: DbOrTx, courseId: string): Promise<number[]> {
	const rows = await db
		.selectDistinct({ cohort: courseCurricula.cohort })
		.from(courseCurricula)
		.where(eq(courseCurricula.courseId, courseId));
	return rows.map(row => row.cohort).sort((a, b) => b - a);
}

/** The curricula of one cohort's plan, the common trunk included. */
export function listCurricula(db: DbOrTx, courseId: string, cohort: number) {
	return db
		.select({
			id: courseCurricula.id,
			code: courseCurricula.code,
			name: courseCurricula.name,
			common: courseCurricula.common,
		})
		.from(courseCurricula)
		.where(
			and(eq(courseCurricula.courseId, courseId), eq(courseCurricula.cohort, cohort))
		)
		.orderBy(asc(courseCurricula.code));
}

export async function findCurriculum(db: DbOrTx, id: string) {
	const [row] = await db
		.select({
			id: courseCurricula.id,
			courseId: courseCurricula.courseId,
			cohort: courseCurricula.cohort,
			name: courseCurricula.name,
			common: courseCurricula.common,
		})
		.from(courseCurricula)
		.where(eq(courseCurricula.id, id))
		.limit(1);
	return row;
}
