import { and, asc, count, countDistinct, desc, eq, isNotNull, sql } from "drizzle-orm";

import { getDb } from "@/db";
import {
	classes,
	courseMaintainers,
	courses,
	departmentAdmins,
	departments,
	profiles,
	quizAttempts,
	sectionAccess,
	sections,
} from "@/db/schema";
import { requireAdmin, requireSuperadmin } from "@/lib/auth/guards";
import { createNotification } from "@/lib/notifications/service";
import {
	Conflict,
	Forbidden,
	NotFound,
	Unavailable,
	rethrowUniqueViolation,
} from "@/lib/server/errors";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

import type {
	CourseMaintainerInput,
	DepartmentAdminInput,
	MaintainerInviteInput,
	SectionAccessInput,
	UserRoleInput,
} from "../schemas";
import type { AdminUser, AdminUserDetail, AdminUserStats } from "../types";

const completed = isNotNull(quizAttempts.completedAt);

export async function getAdminUsers(): Promise<AdminUser[]> {
	await requireSuperadmin();

	return getDb()
		.select({
			id: profiles.id,
			name: profiles.name,
			email: profiles.email,
			image: profiles.image,
			role: profiles.role,
			createdAt: profiles.createdAt,
			quizAttemptsCount: count(quizAttempts.id),
		})
		.from(profiles)
		.leftJoin(quizAttempts, and(eq(quizAttempts.userId, profiles.id), completed))
		.groupBy(profiles.id)
		.orderBy(desc(profiles.createdAt));
}

export async function getAdminUserDetail(id: string): Promise<AdminUserDetail> {
	await requireSuperadmin();
	const db = getDb();

	const [profile] = await db
		.select({
			id: profiles.id,
			name: profiles.name,
			email: profiles.email,
			image: profiles.image,
			role: profiles.role,
			createdAt: profiles.createdAt,
		})
		.from(profiles)
		.where(eq(profiles.id, id))
		.limit(1);
	if (!profile) throw new NotFound("Utente non trovato");

	const [managedDepartments, maintainedCourses, sectionAccesses, [stats]] =
		await Promise.all([
			db
				.select({
					id: departments.id,
					name: departments.name,
					code: departments.code,
				})
				.from(departmentAdmins)
				.innerJoin(departments, eq(departments.id, departmentAdmins.departmentId))
				.where(eq(departmentAdmins.userId, id))
				.orderBy(asc(departments.name)),
			db
				.select({
					id: courses.id,
					name: courses.name,
					code: courses.code,
					departmentName: departments.name,
				})
				.from(courseMaintainers)
				.innerJoin(courses, eq(courses.id, courseMaintainers.courseId))
				.innerJoin(departments, eq(departments.id, courses.departmentId))
				.where(eq(courseMaintainers.userId, id))
				.orderBy(asc(courses.name)),
			db
				.select({
					id: sections.id,
					name: sections.name,
					className: classes.name,
				})
				.from(sectionAccess)
				.innerJoin(sections, eq(sections.id, sectionAccess.sectionId))
				.innerJoin(classes, eq(classes.id, sections.classId))
				.where(eq(sectionAccess.userId, id))
				.orderBy(asc(sections.name)),
			db
				.select({
					totalQuizzes: count(),
					// Cast, because `avg` returns numeric and the driver hands numeric
					// back as a string.
					averageScore: sql<number | null>`avg(${quizAttempts.score})::float8`,
					lastQuizAt: sql<string | null>`max(${quizAttempts.completedAt})`,
				})
				.from(quizAttempts)
				.where(and(eq(quizAttempts.userId, id), completed)),
		]);

	return {
		...profile,
		managedDepartments,
		maintainedCourses,
		sectionAccesses,
		stats,
	};
}

export async function getAdminUserStats(): Promise<AdminUserStats> {
	await requireSuperadmin();
	const db = getDb();

	const [roleCounts, [attempts]] = await Promise.all([
		db
			.select({ role: profiles.role, count: count() })
			.from(profiles)
			.groupBy(profiles.role),
		db
			.select({
				total: count(),
				activeUsers: countDistinct(quizAttempts.userId),
				averageScore: sql<number | null>`avg(${quizAttempts.score})::float8`,
				recent: sql<number>`count(*) filter (
          where ${quizAttempts.completedAt} >= now() - interval '30 days'
        )`.mapWith(Number),
			})
			.from(quizAttempts)
			.where(completed),
	]);

	const byRole: Record<string, number> = {};
	let totalUsers = 0;
	for (const row of roleCounts) {
		byRole[row.role] = row.count;
		totalUsers += row.count;
	}

	return {
		totalUsers,
		byRole,
		totalQuizAttempts: attempts.total,
		recentQuizAttempts: attempts.recent,
		averageScore: attempts.averageScore,
		activeUsers: attempts.activeUsers,
	};
}

// Demotion drops the scope assignments the new role no longer permits: an
// orphaned grant is invisible behind the role-based UI gate but still counts as
// authority everywhere the scope is read. Role and cleanup move together.
export async function updateUserRole({ id, role }: UserRoleInput) {
	await requireSuperadmin();

	await getDb().transaction(async tx => {
		const [updated] = await tx
			.update(profiles)
			.set({ role })
			.where(eq(profiles.id, id))
			.returning({ id: profiles.id });
		if (!updated) throw new NotFound("Utente non trovato");

		if (role === "STUDENT" || role === "MAINTAINER") {
			await tx.delete(departmentAdmins).where(eq(departmentAdmins.userId, id));
		}
		if (role === "STUDENT") {
			await tx.delete(courseMaintainers).where(eq(courseMaintainers.userId, id));
		}
	});
}

export async function addDepartmentAdmin(input: DepartmentAdminInput) {
	await requireSuperadmin();
	const db = getDb();

	const [target] = await db
		.select({ role: profiles.role })
		.from(profiles)
		.where(eq(profiles.id, input.user_id))
		.limit(1);
	if (!target || (target.role !== "ADMIN" && target.role !== "SUPERADMIN")) {
		throw new Conflict(
			"Imposta prima il ruolo Admin per questo utente prima di assegnare un dipartimento."
		);
	}

	try {
		await db
			.insert(departmentAdmins)
			.values({ userId: input.user_id, departmentId: input.department_id });
	} catch (error) {
		rethrowUniqueViolation(error, "L'utente è già admin di questo dipartimento");
	}
}

export async function removeDepartmentAdmin(input: DepartmentAdminInput) {
	await requireSuperadmin();

	await getDb()
		.delete(departmentAdmins)
		.where(
			and(
				eq(departmentAdmins.userId, input.user_id),
				eq(departmentAdmins.departmentId, input.department_id)
			)
		);
}

export async function addCourseMaintainer(input: CourseMaintainerInput) {
	await requireSuperadmin();
	const db = getDb();

	const [target] = await db
		.select({ role: profiles.role })
		.from(profiles)
		.where(eq(profiles.id, input.user_id))
		.limit(1);
	if (!target || target.role === "STUDENT") {
		throw new Conflict(
			"Imposta prima un ruolo adeguato (almeno Maintainer) per questo utente prima di assegnare un corso."
		);
	}

	try {
		await db.transaction(async tx => {
			await tx
				.insert(courseMaintainers)
				.values({ userId: input.user_id, courseId: input.course_id });

			const [course] = await tx
				.select({ name: courses.name })
				.from(courses)
				.where(eq(courses.id, input.course_id))
				.limit(1);

			await createNotification(tx, {
				userId: input.user_id,
				type: "MAINTAINER_ASSIGNED",
				title: "Sei stato nominato maintainer",
				body: course ? `Corso: ${course.name}` : undefined,
				referenceId: input.course_id,
				referenceType: "course",
				link: `/admin/courses/${input.course_id}`,
			});
		});
	} catch (error) {
		rethrowUniqueViolation(error, "L'utente è già maintainer di questo corso");
	}
}

export async function removeCourseMaintainer(input: CourseMaintainerInput) {
	await requireSuperadmin();

	await getDb()
		.delete(courseMaintainers)
		.where(
			and(
				eq(courseMaintainers.userId, input.user_id),
				eq(courseMaintainers.courseId, input.course_id)
			)
		);
}

export async function sendMaintainerInvite(input: MaintainerInviteInput) {
	await requireSuperadmin();
	const db = getDb();

	const [[profile], [course]] = await Promise.all([
		db
			.select({ email: profiles.email })
			.from(profiles)
			.where(eq(profiles.id, input.user_id))
			.limit(1),
		db
			.select({ name: courses.name })
			.from(courses)
			.where(eq(courses.id, input.course_id))
			.limit(1),
	]);
	if (!profile?.email) throw new NotFound("Email dell'utente non trovata");

	const { renderMaintainerInviteHtml } =
		await import("@/lib/email/templates/maintainer-invite");
	const { sendMail } = await import("@/lib/email/server");

	const siteUrl = process.env.VITE_SITE_URL ?? "https://www.trivia-more.it";

	try {
		await sendMail({
			to: profile.email,
			subject: input.subject,
			html: renderMaintainerInviteHtml({
				body: input.body,
				courseName: course?.name ?? "",
				logoUrl: `${siteUrl}/logo192.png`,
			}),
			text: input.body,
			replyTo: process.env.CONTACT_RECIPIENT,
		});
	} catch (error) {
		console.error("Failed to send maintainer invite email:", error);
		throw new Unavailable("Errore durante l'invio dell'email. Riprova più tardi.");
	}
}

export async function addSectionAccess(input: SectionAccessInput) {
	await requireSuperadmin();

	try {
		await getDb()
			.insert(sectionAccess)
			.values({ userId: input.user_id, sectionId: input.section_id });
	} catch (error) {
		rethrowUniqueViolation(error, "L'utente ha già accesso a questa sezione");
	}
}

export async function removeSectionAccess(input: SectionAccessInput) {
	await requireSuperadmin();

	await getDb()
		.delete(sectionAccess)
		.where(
			and(
				eq(sectionAccess.userId, input.user_id),
				eq(sectionAccess.sectionId, input.section_id)
			)
		);
}

// Auth stays on supabase-js: the profile row is deleted by the cascade from
// auth.users.
export async function deleteUser(id: string) {
	const currentUser = await requireSuperadmin();
	if (currentUser.id === id) {
		throw new Forbidden("Non puoi eliminare il tuo stesso account");
	}

	const { error } = await getSupabaseAdmin().auth.admin.deleteUser(id);
	if (error) {
		throw new Unavailable("Errore nell'eliminazione dell'utente: " + error.message);
	}
}

// Every course in the catalog, for the maintainer and invite pickers.
export async function getAllCourses() {
	await requireAdmin();

	return getDb()
		.select({
			id: courses.id,
			name: courses.name,
			code: courses.code,
			departmentName: departments.name,
		})
		.from(courses)
		.innerJoin(departments, eq(departments.id, courses.departmentId))
		.orderBy(asc(courses.name));
}

export async function getPrivateSections() {
	await requireSuperadmin();

	return getDb()
		.select({
			id: sections.id,
			name: sections.name,
			className: classes.name,
		})
		.from(sections)
		.innerJoin(classes, eq(classes.id, sections.classId))
		.where(eq(sections.isPublic, false))
		.orderBy(asc(sections.name));
}

export async function getSectionAccessUsers(sectionId: string) {
	await requireSuperadmin();

	return getDb()
		.select({
			id: profiles.id,
			name: profiles.name,
			email: profiles.email,
		})
		.from(sectionAccess)
		.innerJoin(profiles, eq(profiles.id, sectionAccess.userId))
		.where(eq(sectionAccess.sectionId, sectionId))
		.orderBy(asc(profiles.name));
}
