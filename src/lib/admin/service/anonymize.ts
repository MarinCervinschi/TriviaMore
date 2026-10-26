import { and, eq, inArray, isNull, ne, sql } from "drizzle-orm";

import type { DbOrTx } from "@/db";
import {
	accounts,
	calendarEvents,
	contentRequests,
	courseMaintainers,
	departmentAdmins,
	enrollments,
	legalAcceptances,
	notifications,
	profiles,
	sectionAccess,
	sessions,
	tasks,
	users,
	verifications,
} from "@/db/schema";
import { NotFound } from "@/lib/server/errors";

export const ANONYMOUS_NAME = "Utente eliminato";

export type AnonymizedFiles = {
	avatar: string | null;
	attachments: string[];
};

/** Study history stays on the row; the caller removes the returned files once the transaction commits. */
export async function anonymizeUser(db: DbOrTx, id: string): Promise<AnonymizedFiles> {
	const [profile] = await db
		.select({ image: profiles.image })
		.from(profiles)
		.where(and(eq(profiles.id, id), isNull(profiles.anonymizedAt)))
		.for("update")
		.limit(1);
	if (!profile) throw new NotFound("Utente non trovato");

	await db
		.update(users)
		.set({
			name: ANONYMOUS_NAME,
			email: `deleted-${id}@invalid`,
			emailVerified: false,
			image: null,
			updatedAt: new Date(),
		})
		.where(eq(users.id, id));
	await db
		.update(profiles)
		.set({
			name: null,
			email: null,
			image: null,
			role: "STUDENT",
			anonymizedAt: sql`now()`,
			updatedAt: sql`now()`,
		})
		.where(eq(profiles.id, id));

	await db.delete(sessions).where(eq(sessions.userId, id));
	await db.delete(accounts).where(eq(accounts.userId, id));
	await db.delete(verifications).where(eq(verifications.value, id));

	await db.delete(departmentAdmins).where(eq(departmentAdmins.userId, id));
	await db.delete(courseMaintainers).where(eq(courseMaintainers.userId, id));
	await db.delete(sectionAccess).where(eq(sectionAccess.userId, id));

	await db.delete(notifications).where(eq(notifications.userId, id));
	await db.delete(calendarEvents).where(eq(calendarEvents.userId, id));
	await db.delete(tasks).where(eq(tasks.userId, id));
	await db.delete(enrollments).where(eq(enrollments.userId, id));
	await db.delete(legalAcceptances).where(eq(legalAcceptances.userId, id));

	const removed = await db
		.delete(contentRequests)
		.where(and(eq(contentRequests.userId, id), ne(contentRequests.status, "APPROVED")))
		.returning({ id: contentRequests.id, submitted: contentRequests.submittedContent });

	if (removed.length > 0) {
		await db.delete(notifications).where(
			and(
				eq(notifications.referenceType, "content_request"),
				inArray(
					notifications.referenceId,
					removed.map(row => row.id)
				)
			)
		);
	}

	return {
		avatar: profile.image,
		attachments: removed.flatMap(row => {
			const submitted = row.submitted as { type?: string; file_path?: unknown };
			return submitted.type === "file_upload" && typeof submitted.file_path === "string"
				? [submitted.file_path]
				: [];
		}),
	};
}
