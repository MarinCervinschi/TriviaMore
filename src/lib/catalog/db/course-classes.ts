import { and, asc, eq, exists, inArray, ne, not, or, sql } from "drizzle-orm";
import type { SQL } from "drizzle-orm";

import type { DbOrTx } from "@/db";
import {
	courseClasses,
	coursePlans,
	courses,
	departments,
	sections,
} from "@/db/schema";

import { academicYearOf } from "../academic-year";
import { EXAM_SIMULATION_SECTION } from "../constants";

type DepartmentArea = (typeof departments.$inferSelect)["area"];

// A class can belong to several courses; the one with the lowest `position` is
// the canonical parent for breadcrumbs, paths and notification routing.
// DISTINCT ON resolves it for every class in one pass, so this joins as well
// against a single section as against a whole listing.
//
// Every column is aliased explicitly. Three tables here have a `code` and two
// have a `name`; without the aliases the subquery would expose duplicates and
// the outer query would silently read the wrong one.
export function primaryCourseByClass(db: DbOrTx, classIds?: string[]) {
	return db
		.selectDistinctOn([courseClasses.classId], {
			classId: sql<string>`${courseClasses.classId}`.as("pc_class_id"),
			classCode: sql<string>`${courseClasses.code}`.as("pc_class_code"),
			classYear: sql<number>`${courseClasses.classYear}`.as("pc_class_year"),
			courseId: sql<string>`${courses.id}`.as("pc_course_id"),
			courseName: sql<string>`${courses.name}`.as("pc_course_name"),
			courseCode: sql<string>`${courses.code}`.as("pc_course_code"),
			departmentId: sql<string>`${departments.id}`.as("pc_department_id"),
			departmentName: sql<string>`${departments.name}`.as("pc_department_name"),
			departmentCode: sql<string>`${departments.code}`.as("pc_department_code"),
			departmentArea: sql<DepartmentArea>`${departments.area}`.as("pc_department_area"),
		})
		.from(courseClasses)
		.innerJoin(courses, eq(courses.id, courseClasses.courseId))
		.innerJoin(departments, eq(departments.id, courses.departmentId))
		.where(classIds ? inArray(courseClasses.classId, classIds) : undefined)
		.orderBy(asc(courseClasses.classId), asc(courseClasses.position))
		.as("primary_course");
}

function hasContentSql(db: DbOrTx): SQL {
	return exists(
		db
			.select({ one: sql`1` })
			.from(sections)
			.where(
				and(
					eq(sections.classId, courseClasses.classId),
					ne(sections.name, EXAM_SIMULATION_SECTION)
				)
			)
	);
}

/** A course-class the catalogue still lists this year, as the current cohort's plan or as a class taught to an earlier cohort; a course with no plan for the year keeps every row. */
export function offeredCourseClassSql(
	db: DbOrTx,
	year = academicYearOf(new Date())
): SQL {
	const planOfYear = db
		.select({ one: sql`1` })
		.from(coursePlans)
		.where(
			and(
				eq(coursePlans.courseId, courseClasses.courseId),
				eq(coursePlans.cohort, year)
			)
		);
	const listed = db
		.select({ one: sql`1` })
		.from(coursePlans)
		.where(
			and(
				eq(coursePlans.courseId, courseClasses.courseId),
				eq(coursePlans.classId, courseClasses.classId),
				or(
					eq(coursePlans.cohort, year),
					sql`${coursePlans.cohort} + ${coursePlans.classYear} - 1 = ${year}`
				)
			)
		);
	return or(hasContentSql(db), exists(listed), not(exists(planOfYear)))!;
}

/** A course-class a student can study: an offered teaching, or any class that already has content. */
export function studiableCourseClassSql(
	db: DbOrTx,
	year = academicYearOf(new Date())
): SQL {
	return and(
		offeredCourseClassSql(db, year),
		or(sql`coalesce(${courseClasses.isTeaching}, true)`, hasContentSql(db))
	)!;
}
