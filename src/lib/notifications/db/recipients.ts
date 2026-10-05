import { and, eq, exists, inArray, or } from "drizzle-orm";

import type { DbOrTx } from "@/db";
import {
	courseClasses,
	courseMaintainers,
	courses,
	departmentAdmins,
	profiles,
	sections,
} from "@/db/schema";

export type NotificationTarget = {
	departmentId: string | null;
	courseId: string | null;
	classId: string | null;
	sectionId: string | null;
};

export type NotificationScope = {
	courseIds: string[];
	departmentIds: string[];
};

// Every course of the class, because a maintainer of any of them has authority over it.
async function coursesOfClass(db: DbOrTx, classId: string) {
	return db
		.select({
			courseId: courseClasses.courseId,
			departmentId: courses.departmentId,
		})
		.from(courseClasses)
		.innerJoin(courses, eq(courses.id, courseClasses.courseId))
		.where(eq(courseClasses.classId, classId));
}

export async function findNotificationScope(
	db: DbOrTx,
	target: NotificationTarget
): Promise<NotificationScope> {
	const courseIds = new Set<string>();
	const departmentIds = new Set<string>();

	if (target.courseId) courseIds.add(target.courseId);
	if (target.departmentId) departmentIds.add(target.departmentId);

	let classId = target.classId;
	if (!classId && target.sectionId) {
		const [section] = await db
			.select({ classId: sections.classId })
			.from(sections)
			.where(eq(sections.id, target.sectionId))
			.limit(1);
		classId = section?.classId ?? null;
	}

	if (classId) {
		for (const row of await coursesOfClass(db, classId)) {
			courseIds.add(row.courseId);
			departmentIds.add(row.departmentId);
		}
	} else if (target.courseId && departmentIds.size === 0) {
		const [course] = await db
			.select({ departmentId: courses.departmentId })
			.from(courses)
			.where(eq(courses.id, target.courseId))
			.limit(1);
		if (course) departmentIds.add(course.departmentId);
	}

	return { courseIds: [...courseIds], departmentIds: [...departmentIds] };
}

export async function findNotificationRecipients(
	db: DbOrTx,
	scope: NotificationScope
): Promise<string[]> {
	const rows = await db
		.select({ id: profiles.id })
		.from(profiles)
		.where(
			or(
				eq(profiles.role, "SUPERADMIN"),
				scope.courseIds.length > 0
					? exists(
							db
								.select({ one: courseMaintainers.userId })
								.from(courseMaintainers)
								.where(
									and(
										eq(courseMaintainers.userId, profiles.id),
										inArray(courseMaintainers.courseId, scope.courseIds)
									)
								)
						)
					: undefined,
				scope.departmentIds.length > 0
					? exists(
							db
								.select({ one: departmentAdmins.userId })
								.from(departmentAdmins)
								.where(
									and(
										eq(departmentAdmins.userId, profiles.id),
										inArray(departmentAdmins.departmentId, scope.departmentIds)
									)
								)
						)
					: undefined
			)
		);

	return rows.map(row => row.id);
}
