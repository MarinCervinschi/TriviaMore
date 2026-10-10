import { and, eq } from "drizzle-orm";
import { afterAll, describe, expect, it } from "vitest";

import {
	classes,
	courseClasses,
	courseCurricula,
	coursePlans,
	sections,
} from "@/db/schema";
import { type TestTx, closeTestDb, withRollback } from "@/lib/testing/db";
import { createCourse, createDepartment } from "@/lib/testing/fixtures";

import { offeredCourseClassSql, studiableCourseClassSql } from "./course-classes";

afterAll(() => closeTestDb());

const YEAR = 2026;

async function addClass(tx: TestTx, courseId: string, classYear: number) {
	const [row] = await tx
		.insert(classes)
		.values({ name: `Insegnamento ${crypto.randomUUID().slice(0, 8)}` })
		.returning({ id: classes.id });
	await tx.insert(courseClasses).values({
		courseId,
		classId: row.id,
		code: `CC-${crypto.randomUUID().slice(0, 8)}`,
		classYear,
	});
	return row.id;
}

async function plan(
	tx: TestTx,
	courseId: string,
	classId: string | null,
	cohort: number,
	classYear: number
) {
	const [curriculum] = await tx
		.insert(courseCurricula)
		.values({
			courseId,
			cohort,
			code: `PDS-${crypto.randomUUID().slice(0, 8)}`,
			name: "Generale",
		})
		.returning({ id: courseCurricula.id });
	await tx.insert(coursePlans).values({
		courseId,
		cohort,
		curriculumId: curriculum.id,
		classId,
		classYear,
		code: `P-${crypto.randomUUID().slice(0, 8)}`,
		name: "Piano",
	});
}

async function offered(tx: TestTx, courseId: string) {
	const rows = await tx
		.select({ classId: courseClasses.classId })
		.from(courseClasses)
		.where(and(eq(courseClasses.courseId, courseId), offeredCourseClassSql(tx, YEAR)));
	return new Set(rows.map(row => row.classId));
}

describe("offeredCourseClassSql", () => {
	it("keeps the current cohort's plan and the classes taught to earlier cohorts", () =>
		withRollback(async tx => {
			const courseId = await createCourse(tx, await createDepartment(tx));
			const firstYear = await addClass(tx, courseId, 1);
			const thirdYear = await addClass(tx, courseId, 3);
			const retired = await addClass(tx, courseId, 2);
			await plan(tx, courseId, firstYear, YEAR, 1);
			await plan(tx, courseId, thirdYear, YEAR - 2, 3);
			await plan(tx, courseId, retired, YEAR - 2, 2);

			expect(await offered(tx, courseId)).toEqual(new Set([firstYear, thirdYear]));
		}));

	it("keeps a retired class that has content", () =>
		withRollback(async tx => {
			const courseId = await createCourse(tx, await createDepartment(tx));
			const current = await addClass(tx, courseId, 1);
			const retired = await addClass(tx, courseId, 2);
			await plan(tx, courseId, current, YEAR, 1);
			await tx
				.insert(sections)
				.values({ name: "Appunti", classId: retired, isPublic: true });

			expect(await offered(tx, courseId)).toEqual(new Set([current, retired]));
		}));

	it("keeps every row of a course with no plan for the year", () =>
		withRollback(async tx => {
			const courseId = await createCourse(tx, await createDepartment(tx));
			const a = await addClass(tx, courseId, 1);
			const b = await addClass(tx, courseId, 2);
			await plan(tx, courseId, a, YEAR - 1, 1);

			expect(await offered(tx, courseId)).toEqual(new Set([a, b]));
		}));
});

describe("studiableCourseClassSql", () => {
	it("drops a teaching the year no longer offers", () =>
		withRollback(async tx => {
			const courseId = await createCourse(tx, await createDepartment(tx));
			const current = await addClass(tx, courseId, 1);
			const retired = await addClass(tx, courseId, 2);
			await plan(tx, courseId, current, YEAR, 1);

			const rows = await tx
				.select({ classId: courseClasses.classId })
				.from(courseClasses)
				.where(
					and(eq(courseClasses.courseId, courseId), studiableCourseClassSql(tx, YEAR))
				);
			const ids = rows.map(row => row.classId);
			expect(ids).toContain(current);
			expect(ids).not.toContain(retired);
		}));
});
