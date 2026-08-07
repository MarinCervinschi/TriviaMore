import { and, asc, eq, sql } from "drizzle-orm";
import type { SQL } from "drizzle-orm";

import { getDb } from "@/db";
import { classes, courseClasses, courses, departments, sections } from "@/db/schema";

import { classColumns, courseClassColumns } from "../columns";
import type {
	CampusLocation,
	CourseType,
	CourseWithClasses,
	SearchCoursesParams,
	SearchCoursesResponse,
} from "../types";
import { paginationOf, resolveCourseByCodes, toFtsQuery } from "./shared";

export async function getCourseWithClasses(
	deptCode: string,
	courseCode: string
): Promise<CourseWithClasses | null> {
	const resolved = await resolveCourseByCodes(deptCode, courseCode);
	if (!resolved) return null;

	const rows = await getDb()
		.select({
			class: classColumns,
			courseClass: courseClassColumns,
			sectionCount: sql<number>`count(${sections.id})`.mapWith(Number),
		})
		.from(courseClasses)
		.innerJoin(classes, eq(classes.id, courseClasses.classId))
		.leftJoin(sections, eq(sections.classId, classes.id))
		.where(eq(courseClasses.courseId, resolved.course.id))
		.groupBy(classes.id, courseClasses.courseId, courseClasses.classId)
		.orderBy(asc(courseClasses.classYear), asc(courseClasses.position));

	return {
		...resolved.course,
		department: resolved.department,
		classes: rows.map(row => ({
			...row.class,
			...row.courseClass,
			sectionCount: row.sectionCount,
		})),
	};
}

export async function searchCourses(
	params: SearchCoursesParams
): Promise<SearchCoursesResponse> {
	const filters: SQL[] = [];

	const ftsQuery = params.query?.trim() ? toFtsQuery(params.query) : "";
	if (ftsQuery) {
		filters.push(sql`${courses.fts} @@ to_tsquery('italian', ${ftsQuery})`);
	}
	if (params.departmentId) {
		filters.push(eq(courses.departmentId, params.departmentId));
	}
	if (params.courseType) {
		filters.push(eq(courses.courseType, params.courseType as CourseType));
	}
	if (params.campus) {
		filters.push(eq(courses.location, params.campus as CampusLocation));
	}

	const { limit, offset } = paginationOf(params);

	const rows = await getDb()
		.select({
			id: courses.id,
			name: courses.name,
			code: courses.code,
			courseType: courses.courseType,
			location: courses.location,
			cfu: courses.cfu,
			departmentCode: departments.code,
			departmentName: departments.name,
			classCount: sql<number>`count(${courseClasses.classId})`.mapWith(Number),
			// Window function over the filtered set: the total comes back with the
			// page instead of costing a second round trip.
			total: sql<number>`count(*) over()`.mapWith(Number),
		})
		.from(courses)
		.innerJoin(departments, eq(departments.id, courses.departmentId))
		.leftJoin(courseClasses, eq(courseClasses.courseId, courses.id))
		.where(filters.length > 0 ? and(...filters) : undefined)
		.groupBy(courses.id, departments.code, departments.name)
		.orderBy(asc(courses.name))
		.limit(limit)
		.offset(offset);

	return {
		data: rows.map(row => ({
			id: row.id,
			name: row.name,
			code: row.code,
			courseType: row.courseType,
			location: row.location,
			cfu: row.cfu,
			department: { code: row.departmentCode, name: row.departmentName },
			classCount: row.classCount,
		})),
		total: rows[0]?.total ?? 0,
	};
}
