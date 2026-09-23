import { and, count, eq, ilike, inArray, ne } from "drizzle-orm";

import { getDb } from "@/db";
import type { DbOrTx } from "@/db";
import { classes, courseClasses, courses, departments, sections } from "@/db/schema";
import { accessibleSectionsSql, readsPrivateSections } from "@/lib/auth/checks";
import { EXAM_SIMULATION_SECTION } from "@/lib/catalog/constants";

import {
	classColumns,
	courseClassColumns,
	courseColumns,
	departmentColumns,
} from "../columns";

const DEFAULT_PAGE_SIZE = 10;

// Turns free text into a prefix tsquery. Anything that is not a letter or a
// digit is dropped, so a stray quote cannot break the query.
export function toFtsQuery(input: string): string {
	return input
		.trim()
		.split(/\s+/)
		.map(term => term.replace(/[^a-zA-Z0-9À-ɏ]/g, ""))
		.filter(Boolean)
		.map(term => `${term}:*`)
		.join(" & ");
}

/**
 * The sections of each class that this viewer could actually open — the figure a
 * catalogue list shows, which has to agree with what the class page then lists.
 */
export async function countVisibleSectionsByClass(
	db: DbOrTx,
	classIds: string[],
	userId: string | null
): Promise<Map<string, number>> {
	if (classIds.length === 0) return new Map();

	const readsPrivate = await readsPrivateSections(db, userId);
	const rows = await db
		.select({ classId: sections.classId, total: count(sections.id) })
		.from(sections)
		.where(
			and(
				inArray(sections.classId, classIds),
				ne(sections.name, EXAM_SIMULATION_SECTION),
				accessibleSectionsSql(db, userId, readsPrivate)
			)
		)
		.groupBy(sections.classId);

	return new Map(rows.map(row => [row.classId, row.total]));
}

export function paginationOf(params: { page?: number; pageSize?: number }) {
	const page = Math.max(1, params.page ?? 1);
	const pageSize = Math.max(1, Math.min(100, params.pageSize ?? DEFAULT_PAGE_SIZE));
	return { limit: pageSize, offset: (page - 1) * pageSize };
}

// Codes are matched case-insensitively: they appear lowercased in URLs and
// uppercase in the catalog.
export async function findDepartmentByCode(code: string) {
	const [department] = await getDb()
		.select(departmentColumns)
		.from(departments)
		.where(ilike(departments.code, code))
		.limit(1);
	return department;
}

// Browse URLs address the catalog by code, not by id, so every detail page
// starts by walking department → course → class.
export async function resolveCourseByCodes(deptCode: string, courseCode: string) {
	const department = await findDepartmentByCode(deptCode);
	if (!department) return null;

	const [course] = await getDb()
		.select(courseColumns)
		.from(courses)
		.where(
			and(eq(courses.departmentId, department.id), ilike(courses.code, courseCode))
		)
		.limit(1);
	if (!course) return null;

	return { department, course };
}

export async function resolveClassByCodes(
	deptCode: string,
	courseCode: string,
	classCode: string
) {
	const parent = await resolveCourseByCodes(deptCode, courseCode);
	if (!parent) return null;

	// Nested on purpose: `position` exists on both sides and means different
	// things — the class's own order, and its order inside this course.
	const [row] = await getDb()
		.select({ class: classColumns, courseClass: courseClassColumns })
		.from(courseClasses)
		.innerJoin(classes, eq(classes.id, courseClasses.classId))
		.where(
			and(
				eq(courseClasses.courseId, parent.course.id),
				ilike(courseClasses.code, classCode)
			)
		)
		.limit(1);
	if (!row) return null;

	return { ...parent, ...row };
}
