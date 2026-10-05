import { and, asc, eq, exists, ne, sql } from "drizzle-orm";
import type { SQL } from "drizzle-orm";

import { getDb } from "@/db";
import {
	classes,
	courseClasses,
	courseCurricula,
	coursePlans,
	courses,
	departments,
	sections,
} from "@/db/schema";
import { academicYearOf } from "@/lib/catalog/academic-year";
import { classColumns, courseClassColumns } from "@/lib/catalog/columns";
import { EXAM_SIMULATION_SECTION } from "@/lib/catalog/constants";
import { studiableCourseClassSql } from "@/lib/catalog/db/course-classes";
import { findEnrollmentByCourse } from "@/lib/crm/db/enrollments";

import { buildPlanView, pickCohort } from "../plan-view";
import type {
	CampusLocation,
	CourseType,
	CourseWithClasses,
	SearchCoursesParams,
	SearchCoursesResponse,
} from "../types";
import {
	countVisibleSectionsByClass,
	paginationOf,
	resolveCourseByCodes,
	toFtsQuery,
} from "./shared";

export async function getCourseWithClasses(
	userId: string | null,
	deptCode: string,
	courseCode: string,
	requestedCohort?: number
): Promise<CourseWithClasses | null> {
	const resolved = await resolveCourseByCodes(deptCode, courseCode);
	if (!resolved) return null;

	const db = getDb();
	const courseId = resolved.course.id;
	const [cohortRows, enrollment] = await Promise.all([
		db
			.selectDistinct({ cohort: courseCurricula.cohort })
			.from(courseCurricula)
			.where(eq(courseCurricula.courseId, courseId)),
		userId ? findEnrollmentByCourse(db, userId, courseId) : undefined,
	]);
	const cohorts = cohortRows.map(row => row.cohort).sort((a, b) => b - a);
	const cohort = pickCohort(cohorts, {
		requested: requestedCohort,
		enrolled: enrollment?.isCurrent ? enrollment.startYear : null,
		current: academicYearOf(new Date()),
	});

	const base = { ...resolved.course, department: resolved.department, cohorts };
	if (cohort === null) {
		return { ...base, cohort: null, ...(await currentCatalogue(userId, courseId)) };
	}

	const hasContent = exists(
		db
			.select({ one: sql`1` })
			.from(sections)
			.where(
				and(
					eq(sections.classId, coursePlans.classId),
					ne(sections.name, EXAM_SIMULATION_SECTION)
				)
			)
	);
	const [curricula, rows] = await Promise.all([
		db
			.select({
				code: courseCurricula.code,
				name: courseCurricula.name,
				common: courseCurricula.common,
			})
			.from(courseCurricula)
			.where(
				and(eq(courseCurricula.courseId, courseId), eq(courseCurricula.cohort, cohort))
			)
			.orderBy(asc(courseCurricula.code)),
		db
			.select({
				code: coursePlans.code,
				name: coursePlans.name,
				cfu: coursePlans.cfu,
				classYear: coursePlans.classYear,
				mandatory: coursePlans.mandatory,
				evaluation: coursePlans.evaluation,
				curriculum: courseCurricula.code,
				classId: coursePlans.classId,
				link: courseClasses.code,
				description: classes.description,
				isTeaching: courseClasses.isTeaching,
				hasContent: sql<boolean>`${hasContent}`,
				position: courseClasses.position,
			})
			.from(coursePlans)
			.innerJoin(courseCurricula, eq(courseCurricula.id, coursePlans.curriculumId))
			.leftJoin(classes, eq(classes.id, coursePlans.classId))
			.leftJoin(
				courseClasses,
				and(
					eq(courseClasses.courseId, coursePlans.courseId),
					eq(courseClasses.classId, coursePlans.classId)
				)
			)
			.where(and(eq(coursePlans.courseId, courseId), eq(coursePlans.cohort, cohort))),
	]);

	const classIds = [...new Set(rows.map(row => row.classId).filter(id => id !== null))];
	const counts = await countVisibleSectionsByClass(db, classIds, userId);
	return { ...base, cohort, ...buildPlanView(rows, curricula, counts) };
}

/** The curated catalogue, for a course the official catalogue has no plan for. */
async function currentCatalogue(userId: string | null, courseId: string) {
	const db = getDb();
	const rows = await db
		.select({
			class: classColumns,
			courseClass: courseClassColumns,
			studiable: sql<boolean>`${studiableCourseClassSql(db)}`,
		})
		.from(courseClasses)
		.innerJoin(classes, eq(classes.id, courseClasses.classId))
		.where(eq(courseClasses.courseId, courseId))
		.orderBy(asc(courseClasses.classYear), asc(courseClasses.position));

	const studiable = rows.filter(row => row.studiable);
	const counts = await countVisibleSectionsByClass(
		db,
		studiable.map(row => row.class.id),
		userId
	);

	return {
		curricula: [],
		classes: studiable.map(({ class: cls, courseClass }) => ({
			id: courseClass.code,
			code: courseClass.code,
			link: courseClass.code,
			name: cls.name,
			description: cls.description,
			cfu: cls.cfu,
			classYear: courseClass.classYear,
			sectionCount: counts.get(cls.id) ?? 0,
			mandatory: courseClass.mandatory,
			curricula: [],
		})),
		activities: rows
			.filter(row => !row.studiable)
			.map(row => ({
				id: row.courseClass.code,
				name: row.class.name,
				cfu: row.class.cfu,
				classYear: row.courseClass.classYear,
				curricula: [],
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
			classCount:
				sql<number>`count(${courseClasses.classId}) filter (where ${studiableCourseClassSql(getDb())})`.mapWith(
					Number
				),
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
