import { and, asc, count, desc, eq, max, min, sql } from "drizzle-orm";

import {
	classSyllabi,
	classes,
	courseClasses,
	courseCurricula,
	coursePlans,
	courses,
	departments,
	questions,
	sections,
} from "@/db/schema";
import { studiableCourseClassSql } from "@/lib/catalog/db/course-classes";

import { consoleDb } from "~/lib/db/client";

import type {
	CatalogClass,
	CatalogCourse,
	CatalogOverview,
	ClassDetail,
	CourseDetail,
} from "./types";

const iso = (value: string | null) => (value ? new Date(value).toISOString() : null);

/** The size and freshness of the catalogue. */
export async function getCatalogOverview(): Promise<CatalogOverview> {
	const db = consoleDb();
	const studiable = studiableCourseClassSql(db);

	const [
		[courseCount],
		[classCount],
		[studiableRow],
		[syllabusRow],
		[planRow],
		[curriculumRow],
	] = await Promise.all([
		db.select({ n: count() }).from(courses),
		db.select({ n: count() }).from(classes),
		db
			.select({
				n: sql<number>`count(distinct ${courseClasses.classId})`.mapWith(Number),
				covered: sql<number>`count(distinct ${classSyllabi.classId})`.mapWith(Number),
			})
			.from(courseClasses)
			.leftJoin(classSyllabi, eq(classSyllabi.classId, courseClasses.classId))
			.where(studiable),
		db
			.select({ n: count(), updatedAt: max(classSyllabi.updatedAt) })
			.from(classSyllabi),
		db
			.select({
				n: count(),
				first: min(coursePlans.cohort),
				last: max(coursePlans.cohort),
				updatedAt: max(coursePlans.updatedAt),
			})
			.from(coursePlans),
		db.select({ n: count() }).from(courseCurricula),
	]);

	return {
		courses: courseCount!.n,
		classes: classCount!.n,
		studiable: studiableRow!.n,
		studiableWithSyllabus: studiableRow!.covered,
		syllabi: syllabusRow!.n,
		planRows: planRow!.n,
		curricula: curriculumRow!.n,
		firstCohort: planRow!.first,
		lastCohort: planRow!.last,
		plansUpdatedAt: iso(planRow!.updatedAt),
		syllabiUpdatedAt: iso(syllabusRow!.updatedAt),
	};
}

/** Every course, with its plans as the catalogue last published them. */
export async function getCatalogCourses(): Promise<CatalogCourse[]> {
	const db = consoleDb();

	const latest = db
		.select({
			courseId: coursePlans.courseId,
			cohorts: sql<number>`count(distinct ${coursePlans.cohort})`.as("plan_cohorts"),
			lastCohort: max(coursePlans.cohort).as("plan_last_cohort"),
			updatedAt: max(coursePlans.updatedAt).as("plan_updated_at"),
		})
		.from(coursePlans)
		.groupBy(coursePlans.courseId)
		.as("latest");

	const rows = await db
		.select({
			id: courses.id,
			code: courses.code,
			name: courses.name,
			department: departments.code,
			courseType: courses.courseType,
			cohorts: sql<number>`coalesce(${latest.cohorts}, 0)`.mapWith(Number),
			lastCohort: latest.lastCohort,
			updatedAt: latest.updatedAt,
			curricula: sql<number>`(
				select count(*) from ${courseCurricula}
				where ${courseCurricula.courseId} = ${courses.id}
					and ${courseCurricula.cohort} = ${latest.lastCohort}
					and not ${courseCurricula.common}
			)`.mapWith(Number),
			planRows: sql<number>`(
				select count(*) from ${coursePlans}
				where ${coursePlans.courseId} = ${courses.id}
					and ${coursePlans.cohort} = ${latest.lastCohort}
			)`.mapWith(Number),
			linked: sql<number>`(
				select count(*) from ${coursePlans}
				where ${coursePlans.courseId} = ${courses.id}
					and ${coursePlans.cohort} = ${latest.lastCohort}
					and ${coursePlans.classId} is not null
			)`.mapWith(Number),
		})
		.from(courses)
		.innerJoin(departments, eq(departments.id, courses.departmentId))
		.leftJoin(latest, eq(latest.courseId, courses.id))
		.orderBy(asc(departments.code), asc(courses.name));

	return rows.map(({ linked, ...row }) => ({
		...row,
		updatedAt: iso(row.updatedAt),
		linkedShare: row.planRows > 0 ? linked / row.planRows : null,
	}));
}

/** Every class, with where it is listed and the year of its official class sheet. */
export async function getCatalogClasses(): Promise<CatalogClass[]> {
	const db = consoleDb();
	const studiable = studiableCourseClassSql(db);

	return db
		.select({
			id: classes.id,
			name: classes.name,
			code: sql<string | null>`min(${courseClasses.code})`,
			cfu: classes.cfu,
			courses: sql<number>`count(distinct ${courseClasses.courseId})`.mapWith(Number),
			courseCodes: sql<string[]>`coalesce(
				array_agg(distinct ${courses.code}) filter (where ${courses.code} is not null),
				'{}'
			)`,
			departments: sql<string[]>`coalesce(
				array_agg(distinct ${departments.code}) filter (where ${departments.code} is not null),
				'{}'
			)`,
			studiable: sql<boolean>`coalesce(bool_or(${studiable}), false)`,
			syllabusYear: classSyllabi.academicYear,
		})
		.from(classes)
		.leftJoin(courseClasses, eq(courseClasses.classId, classes.id))
		.leftJoin(courses, eq(courses.id, courseClasses.courseId))
		.leftJoin(departments, eq(departments.id, courses.departmentId))
		.leftJoin(classSyllabi, eq(classSyllabi.classId, classes.id))
		.groupBy(classes.id, classSyllabi.academicYear)
		.orderBy(asc(classes.name));
}

const SYLLABUS_FIELDS = [
	["objectives", "Obiettivi"],
	["contents", "Contenuti"],
	["prerequisites", "Prerequisiti"],
	["teachingMethods", "Metodi didattici"],
	["assessment", "Verifica"],
	["readings", "Testi"],
	["outcomes", "Risultati attesi"],
] as const;

/** One class: every course that lists it, its class sheet and how much of our content hangs off it. */
export async function getClassDetail(id: string): Promise<ClassDetail | null> {
	const db = consoleDb();
	const studiable = studiableCourseClassSql(db);

	const [[row], listings, [syllabus], [content]] = await Promise.all([
		db
			.select({
				id: classes.id,
				name: classes.name,
				cfu: classes.cfu,
				ssd: classes.ssd,
			})
			.from(classes)
			.where(eq(classes.id, id)),
		db
			.select({
				courseId: courses.id,
				courseCode: courses.code,
				courseName: courses.name,
				department: departments.code,
				code: courseClasses.code,
				classYear: courseClasses.classYear,
				mandatory: courseClasses.mandatory,
				taf: courseClasses.taf,
				teachingPeriod: courseClasses.teachingPeriod,
				catalogueUrl: courseClasses.catalogueUrl,
				studiable: sql<boolean>`coalesce(${studiable}, false)`,
			})
			.from(courseClasses)
			.innerJoin(courses, eq(courses.id, courseClasses.courseId))
			.innerJoin(departments, eq(departments.id, courses.departmentId))
			.where(eq(courseClasses.classId, id))
			.orderBy(asc(courses.name)),
		db.select().from(classSyllabi).where(eq(classSyllabi.classId, id)),
		db
			.select({
				sections: sql<number>`count(distinct ${sections.id})`.mapWith(Number),
				questions: sql<number>`count(${questions.id})`.mapWith(Number),
			})
			.from(sections)
			.leftJoin(questions, eq(questions.sectionId, sections.id))
			.where(eq(sections.classId, id)),
	]);
	if (!row) return null;

	return {
		...row,
		listings,
		syllabus: syllabus
			? {
					academicYear: syllabus.academicYear,
					catalogueUrl: syllabus.catalogueUrl,
					filled: SYLLABUS_FIELDS.filter(([key]) => syllabus[key]?.trim()).map(
						([, label]) => label
					),
				}
			: null,
		sections: content?.sections ?? 0,
		questions: content?.questions ?? 0,
	};
}

/** One course with its plans, cohort by cohort, newest first. */
export async function getCourseDetail(id: string): Promise<CourseDetail | null> {
	const db = consoleDb();

	const [[row], cohorts, curricula, [classCount]] = await Promise.all([
		db
			.select({
				id: courses.id,
				code: courses.code,
				name: courses.name,
				department: departments.code,
				departmentName: departments.name,
				courseType: courses.courseType,
				cfu: courses.cfu,
				location: courses.location,
				degreeClass: courses.degreeClass,
				teachingLanguage: courses.teachingLanguage,
				restrictedAccess: courses.restrictedAccess,
				catalogueUrl: courses.catalogueUrl,
			})
			.from(courses)
			.innerJoin(departments, eq(departments.id, courses.departmentId))
			.where(eq(courses.id, id)),
		db
			.select({
				cohort: coursePlans.cohort,
				planRows: count(),
				linked: count(coursePlans.classId),
				updatedAt: max(coursePlans.updatedAt),
			})
			.from(coursePlans)
			.where(eq(coursePlans.courseId, id))
			.groupBy(coursePlans.cohort)
			.orderBy(desc(coursePlans.cohort)),
		db
			.select({ cohort: courseCurricula.cohort, n: count() })
			.from(courseCurricula)
			.where(and(eq(courseCurricula.courseId, id), eq(courseCurricula.common, false)))
			.groupBy(courseCurricula.cohort),
		db.select({ n: count() }).from(courseClasses).where(eq(courseClasses.courseId, id)),
	]);
	if (!row) return null;

	const curriculaByCohort = new Map(curricula.map(c => [c.cohort, c.n]));
	return {
		...row,
		classes: classCount?.n ?? 0,
		cohorts: cohorts.map(c => ({
			...c,
			curricula: curriculaByCohort.get(c.cohort) ?? 0,
			updatedAt: iso(c.updatedAt),
		})),
	};
}
