import { asc, count, eq, sql } from "drizzle-orm";

import { getDb } from "@/db";
import { courseClasses, courses, departments } from "@/db/schema";
import { requireSuperadmin } from "@/lib/auth/guards";
import { courseColumns, departmentColumns } from "@/lib/catalog/columns";
import { Conflict, NotFound, rethrowUniqueViolation } from "@/lib/server/errors";

import { requireDepartmentAccess, requireStructureManager } from "../access";
import type { DepartmentInput, UpdateDepartmentInput } from "../schemas";
import type { AdminDepartment, AdminDepartmentDetail } from "../types";

const DUPLICATE_CODE = "Esiste già un dipartimento con questo codice";

export async function getAdminDepartments(): Promise<AdminDepartment[]> {
	await requireDepartmentAccess();

	return getDb()
		.select({
			...departmentColumns,
			courseCount: count(courses.id),
		})
		.from(departments)
		.leftJoin(courses, eq(courses.departmentId, departments.id))
		.groupBy(departments.id)
		.orderBy(asc(departments.position));
}

export async function getAdminDepartmentDetail(
	id: string
): Promise<AdminDepartmentDetail> {
	await requireDepartmentAccess();
	const db = getDb();

	const [department] = await db
		.select()
		.from(departments)
		.where(eq(departments.id, id))
		.limit(1);
	if (!department) throw new NotFound("Dipartimento non trovato");

	const courseRows = await db
		.select({
			...courseColumns,
			classCount: count(courseClasses.classId),
		})
		.from(courses)
		.leftJoin(courseClasses, eq(courseClasses.courseId, courses.id))
		.where(eq(courses.departmentId, id))
		.groupBy(courses.id)
		.orderBy(asc(courses.position));

	return { ...department, courses: courseRows };
}

export async function createDepartment(input: DepartmentInput) {
	await requireStructureManager();

	try {
		// Appended to the end of the list; positions are otherwise managed by hand.
		const [department] = await getDb()
			.insert(departments)
			.values({
				name: input.name,
				code: input.code,
				description: input.description || null,
				area: input.area || null,
				position: sql`(select count(*) + 1 from ${departments})`,
			})
			.returning();
		return department;
	} catch (error) {
		rethrowUniqueViolation(error, DUPLICATE_CODE);
	}
}

export async function updateDepartment(id: string, updates: UpdateDepartmentInput) {
	await requireStructureManager();

	try {
		// Drizzle skips undefined keys, so "update only what was sent" is the
		// default instead of a hand-written object.
		const [department] = await getDb()
			.update(departments)
			.set({
				name: updates.name,
				code: updates.code,
				description:
					updates.description === undefined ? undefined : updates.description || null,
				area: updates.area === undefined ? undefined : updates.area || null,
				position: updates.position,
			})
			.where(eq(departments.id, id))
			.returning();

		if (!department) throw new NotFound("Dipartimento non trovato");
		return department;
	} catch (error) {
		rethrowUniqueViolation(error, DUPLICATE_CODE);
	}
}

// Deleting a department cascades to its courses and their course↔class links.
// Until now the only thing between an ADMIN and that cascade was the
// `departments_delete USING (is_superadmin())` policy; on a service-role
// connection the constraint has to live here.
export async function deleteDepartment(id: string) {
	await requireSuperadmin();
	const db = getDb();

	const [{ value: courseCount }] = await db
		.select({ value: count() })
		.from(courses)
		.where(eq(courses.departmentId, id));

	if (courseCount > 0) {
		throw new Conflict(
			"Impossibile eliminare: il dipartimento contiene dei corsi. Elimina prima i corsi."
		);
	}

	await db.delete(departments).where(eq(departments.id, id));
}
