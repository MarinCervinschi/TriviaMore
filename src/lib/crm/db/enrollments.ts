import { and, eq } from "drizzle-orm";

import type { DbOrTx } from "@/db";
import { enrollments } from "@/db/schema";

import type { Enrollment } from "../types";

// Shared by the guard and the service. Only the row: the joined view model the
// UI reads is built in the service.
export async function findCurrentEnrollment(
	db: DbOrTx,
	userId: string
): Promise<Enrollment | undefined> {
	const [row] = await db
		.select()
		.from(enrollments)
		.where(and(eq(enrollments.userId, userId), eq(enrollments.isCurrent, true)))
		.limit(1);
	return row;
}

export async function findEnrollmentByCourse(
	db: DbOrTx,
	userId: string,
	courseId: string
): Promise<Enrollment | undefined> {
	const [row] = await db
		.select()
		.from(enrollments)
		.where(and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId)))
		.limit(1);
	return row;
}

export async function setEnrollmentCurrent(
	db: DbOrTx,
	id: string,
	isCurrent: boolean
): Promise<void> {
	await db.update(enrollments).set({ isCurrent }).where(eq(enrollments.id, id));
}

export async function updateEnrollmentDetails(
	db: DbOrTx,
	id: string,
	values: { curriculum?: string | null; startYear?: number | null }
): Promise<void> {
	// The wizard sends neither field, so the patch is routinely empty — and
	// Drizzle throws "No values to set" rather than doing nothing.
	const patch = Object.fromEntries(
		Object.entries(values).filter(([, value]) => value !== undefined)
	);
	if (Object.keys(patch).length === 0) return;

	await db.update(enrollments).set(patch).where(eq(enrollments.id, id));
}

export async function insertEnrollment(
	db: DbOrTx,
	values: {
		userId: string;
		courseId: string;
		curriculum?: string | null;
		startYear?: number | null;
	}
): Promise<void> {
	await db.insert(enrollments).values(values);
}
