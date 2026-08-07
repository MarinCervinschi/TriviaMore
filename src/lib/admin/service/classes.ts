import { and, asc, count, eq, ne } from "drizzle-orm";

import { getDb } from "@/db";
import {
	classes,
	courseClasses,
	courses,
	departments,
	questions,
	sections,
} from "@/db/schema";
import { EXAM_SIMULATION_SECTION } from "@/lib/catalog/constants";
import { Conflict, NotFound, rethrowUniqueViolation } from "@/lib/server/errors";

import { requireClassAccess, requireStructureManager } from "../access";
import type {
	ClassInput,
	CourseClassInput,
	UpdateClassInput,
	UpdateCourseClassInput,
} from "../schemas";
import type { AdminClassDetail } from "../types";

const DUPLICATE_CLASS_CODE = "Esiste già una classe con questo codice";
const DUPLICATE_LINK = "Questa classe è già collegata a questo corso";

function examSimulationDescription(className: string) {
	return `Sezione per la simulazione d'esame della classe ${className}`;
}

export async function getAdminClassDetail(id: string): Promise<AdminClassDetail> {
	const user = await requireClassAccess(id);
	const db = getDb();

	const [cls] = await db
		.select({
			id: classes.id,
			name: classes.name,
			description: classes.description,
			cfu: classes.cfu,
			position: classes.position,
			createdAt: classes.createdAt,
			updatedAt: classes.updatedAt,
		})
		.from(classes)
		.where(eq(classes.id, id))
		.limit(1);
	if (!cls) throw new NotFound("Insegnamento non trovato");

	// A class can hang off several courses; the lowest `position` is the one the
	// page treats as its parent, the same rule breadcrumbs use elsewhere.
	const [parent] = await db
		.select({
			code: courseClasses.code,
			classYear: courseClasses.classYear,
			mandatory: courseClasses.mandatory,
			catalogueUrl: courseClasses.catalogueUrl,
			curriculum: courseClasses.curriculum,
			position: courseClasses.position,
			course: {
				id: courses.id,
				name: courses.name,
				code: courses.code,
				description: courses.description,
				departmentId: courses.departmentId,
				location: courses.location,
				cfu: courses.cfu,
				position: courses.position,
				courseType: courses.courseType,
				createdAt: courses.createdAt,
				updatedAt: courses.updatedAt,
			},
			department: {
				id: departments.id,
				name: departments.name,
				code: departments.code,
				description: departments.description,
				area: departments.area,
				position: departments.position,
				createdAt: departments.createdAt,
				updatedAt: departments.updatedAt,
			},
		})
		.from(courseClasses)
		.innerJoin(courses, eq(courses.id, courseClasses.courseId))
		.innerJoin(departments, eq(departments.id, courses.departmentId))
		.where(eq(courseClasses.classId, id))
		.orderBy(asc(courseClasses.position))
		.limit(1);

	// Private sections used to be hidden from a maintainer by
	// `sections_select USING (can_access_section(id))`; on a service-role
	// connection that has to be a where clause, or a maintainer would read the
	// names of sections it cannot manage.
	const visible = and(
		eq(sections.classId, id),
		ne(sections.name, EXAM_SIMULATION_SECTION),
		user.role === "MAINTAINER" ? eq(sections.isPublic, true) : undefined
	);

	const sectionRows = await db
		.select({
			id: sections.id,
			name: sections.name,
			description: sections.description,
			isPublic: sections.isPublic,
			position: sections.position,
			questionCount: count(questions.id),
		})
		.from(sections)
		.leftJoin(questions, eq(questions.sectionId, sections.id))
		.where(visible)
		.groupBy(sections.id)
		.orderBy(asc(sections.position));

	const [sentinel] = await db
		.select({ id: sections.id })
		.from(sections)
		.where(and(eq(sections.classId, id), eq(sections.name, EXAM_SIMULATION_SECTION)))
		.limit(1);

	return {
		...cls,
		courseClass: parent
			? {
					code: parent.code,
					classYear: parent.classYear,
					mandatory: parent.mandatory,
					catalogueUrl: parent.catalogueUrl,
					curriculum: parent.curriculum,
					position: parent.position,
				}
			: null,
		course: parent ? { ...parent.course, department: parent.department } : null,
		sections: sectionRows,
		hasExamSimulation: sentinel !== undefined,
	};
}

// Every class gets the exam-simulation sentinel at creation: the two rows belong
// together, and a class without it silently loses exam mode.
export async function createClass(input: ClassInput) {
	await requireStructureManager();

	try {
		return await getDb().transaction(async tx => {
			const [cls] = await tx
				.insert(classes)
				.values({
					name: input.name,
					description: input.description || null,
					cfu: input.cfu ?? null,
					position: input.position ?? 0,
				})
				.returning();

			await tx.insert(sections).values({
				classId: cls.id,
				name: EXAM_SIMULATION_SECTION,
				description: examSimulationDescription(cls.name),
				isPublic: true,
				position: 9999,
			});

			return cls;
		});
	} catch (error) {
		rethrowUniqueViolation(error, DUPLICATE_CLASS_CODE);
	}
}

export async function createExamSimulationSentinel(classId: string) {
	await requireStructureManager();
	const db = getDb();

	const [cls] = await db
		.select({ name: classes.name })
		.from(classes)
		.where(eq(classes.id, classId))
		.limit(1);
	if (!cls) throw new NotFound("Insegnamento non trovato");

	const [section] = await db
		.insert(sections)
		.values({
			classId,
			name: EXAM_SIMULATION_SECTION,
			description: examSimulationDescription(cls.name),
			isPublic: true,
			position: 9999,
		})
		.onConflictDoNothing()
		.returning();

	if (!section) {
		throw new Conflict(
			'La sezione "Exam Simulation" esiste già per questo insegnamento'
		);
	}
	return section;
}

export async function updateClass(id: string, updates: UpdateClassInput) {
	await requireStructureManager();

	try {
		const [cls] = await getDb()
			.update(classes)
			.set({
				name: updates.name,
				description:
					updates.description === undefined ? undefined : updates.description || null,
				cfu: updates.cfu === undefined ? undefined : (updates.cfu ?? null),
				position: updates.position,
			})
			.where(eq(classes.id, id))
			.returning();

		if (!cls) throw new NotFound("Insegnamento non trovato");
		return cls;
	} catch (error) {
		rethrowUniqueViolation(error, DUPLICATE_CLASS_CODE);
	}
}

export async function deleteClass(id: string) {
	await requireStructureManager();
	const db = getDb();

	// The sentinel does not count as content: it is created automatically and
	// deleting the class is supposed to take it along.
	const [{ value: sectionCount }] = await db
		.select({ value: count() })
		.from(sections)
		.where(and(eq(sections.classId, id), ne(sections.name, EXAM_SIMULATION_SECTION)));

	if (sectionCount > 0) {
		throw new Conflict(
			"Impossibile eliminare: la classe contiene delle sezioni. Elimina prima le sezioni."
		);
	}

	await db.delete(classes).where(eq(classes.id, id));
}

export async function addClassToCourse(input: CourseClassInput) {
	await requireStructureManager();

	try {
		const [link] = await getDb()
			.insert(courseClasses)
			.values({
				courseId: input.course_id,
				classId: input.class_id,
				code: input.code,
				classYear: input.class_year,
				mandatory: input.mandatory,
				catalogueUrl: input.catalogue_url || null,
				curriculum: input.curriculum || null,
				position: input.position ?? 0,
			})
			.returning();
		return link;
	} catch (error) {
		rethrowUniqueViolation(error, DUPLICATE_LINK);
	}
}

export async function updateCourseClass(
	ids: { course_id: string; class_id: string },
	updates: UpdateCourseClassInput
) {
	await requireStructureManager();

	const [link] = await getDb()
		.update(courseClasses)
		.set({
			code: updates.code,
			classYear: updates.class_year,
			mandatory: updates.mandatory,
			catalogueUrl:
				updates.catalogue_url === undefined ? undefined : updates.catalogue_url || null,
			curriculum:
				updates.curriculum === undefined ? undefined : updates.curriculum || null,
			position: updates.position,
		})
		.where(
			and(
				eq(courseClasses.courseId, ids.course_id),
				eq(courseClasses.classId, ids.class_id)
			)
		)
		.returning();

	if (!link) throw new NotFound("Collegamento non trovato");
	return link;
}

export async function removeClassFromCourse(ids: {
	course_id: string;
	class_id: string;
}) {
	await requireStructureManager();

	await getDb()
		.delete(courseClasses)
		.where(
			and(
				eq(courseClasses.courseId, ids.course_id),
				eq(courseClasses.classId, ids.class_id)
			)
		);
}
