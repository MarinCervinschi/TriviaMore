import { eq } from "drizzle-orm";
import { afterAll, describe, expect, it } from "vitest";

import {
	accounts,
	calendarEvents,
	contentRequests,
	courseMaintainers,
	enrollments,
	legalAcceptances,
	notifications,
	profiles,
	quizAttempts,
	sessions,
	tasks,
	userStats,
	users,
	verifications,
} from "@/db/schema";
import { closeTestDb, withRollback } from "@/lib/testing/db";
import type { TestTx } from "@/lib/testing/db";
import { createCourse, createDepartment, createUser } from "@/lib/testing/fixtures";

import { ANONYMOUS_NAME, anonymizeUser } from "./anonymize";

afterAll(() => closeTestDb());

const AVATAR = "https://storage.test/avatars/me.svg";
const ATTACHMENT = "user/appunti.pdf";

async function seedAccount(tx: TestTx) {
	const id = await createUser(tx, "MAINTAINER");
	const admin = await createUser(tx, "SUPERADMIN");
	const courseId = await createCourse(tx, await createDepartment(tx));

	await tx
		.update(users)
		.set({ name: "Mario Rossi", image: AVATAR, emailVerified: true })
		.where(eq(users.id, id));
	await tx
		.update(profiles)
		.set({
			name: "Mario Rossi",
			email: `${id}@example.test`,
			image: AVATAR,
			signupRank: 7,
		})
		.where(eq(profiles.id, id));

	await tx
		.insert(accounts)
		.values({ userId: id, providerId: "credential", accountId: id });
	await tx.insert(sessions).values({
		userId: id,
		token: crypto.randomUUID(),
		expiresAt: new Date(Date.now() + 60_000),
	});
	await tx.insert(verifications).values({
		identifier: `reset-password:${crypto.randomUUID()}`,
		value: id,
		expiresAt: new Date(Date.now() + 60_000),
	});
	await tx.insert(courseMaintainers).values({ userId: id, courseId });
	await tx
		.insert(notifications)
		.values({ userId: id, type: "MAINTAINER_ASSIGNED", title: "Ciao" });
	await tx
		.insert(calendarEvents)
		.values({ userId: id, date: "2026-11-02", title: "Ricevimento" });
	await tx
		.insert(tasks)
		.values({ userId: id, dueDate: "2026-11-03", title: "Ripasso" });
	await tx.insert(enrollments).values({ userId: id, courseId });
	await tx.insert(legalAcceptances).values({
		userId: id,
		documentType: "TERMS",
		version: "2026-04-24",
		ipAddress: "203.0.113.7",
	});

	const [approved] = await tx
		.insert(contentRequests)
		.values({
			userId: id,
			requestType: "NEW_SECTION",
			status: "APPROVED",
			submittedContent: { type: "section", name: "Esercizi", description: "" },
		})
		.returning({ id: contentRequests.id });
	const [pending] = await tx
		.insert(contentRequests)
		.values({
			userId: id,
			requestType: "FILE_UPLOAD",
			submittedContent: {
				type: "file_upload",
				file_name: "appunti.pdf",
				file_path: ATTACHMENT,
				file_size: 10,
				comment: null,
			},
		})
		.returning({ id: contentRequests.id });
	await tx.insert(notifications).values({
		userId: admin,
		type: "NEW_REQUEST_RECEIVED",
		title: "Nuova proposta",
		referenceId: pending.id,
		referenceType: "content_request",
	});

	await tx
		.insert(quizAttempts)
		.values({ userId: id, score: 80, completedAt: "2026-10-01" });
	await tx.insert(userStats).values({ userId: id });

	return { id, admin, approved: approved.id };
}

async function leftovers(tx: TestTx, id: string) {
	const queries = {
		accounts: tx.select().from(accounts).where(eq(accounts.userId, id)),
		sessions: tx.select().from(sessions).where(eq(sessions.userId, id)),
		verifications: tx.select().from(verifications).where(eq(verifications.value, id)),
		courseMaintainers: tx
			.select()
			.from(courseMaintainers)
			.where(eq(courseMaintainers.userId, id)),
		notifications: tx.select().from(notifications).where(eq(notifications.userId, id)),
		requestNotifications: tx
			.select()
			.from(notifications)
			.where(eq(notifications.referenceType, "content_request")),
		calendarEvents: tx
			.select()
			.from(calendarEvents)
			.where(eq(calendarEvents.userId, id)),
		tasks: tx.select().from(tasks).where(eq(tasks.userId, id)),
		enrollments: tx.select().from(enrollments).where(eq(enrollments.userId, id)),
		legalAcceptances: tx
			.select()
			.from(legalAcceptances)
			.where(eq(legalAcceptances.userId, id)),
	};
	const counts: Record<string, number> = {};
	for (const [name, query] of Object.entries(queries))
		counts[name] = (await query).length;
	return counts;
}

describe("anonymizeUser", () => {
	it("removes the personal data and the ways to sign in", () =>
		withRollback(async tx => {
			const { id } = await seedAccount(tx);

			const files = await anonymizeUser(tx, id);

			expect(files).toEqual({ avatar: AVATAR, attachments: [ATTACHMENT] });
			const [user] = await tx.select().from(users).where(eq(users.id, id));
			expect(user).toMatchObject({
				name: ANONYMOUS_NAME,
				email: `deleted-${id}@invalid`,
				emailVerified: false,
				image: null,
			});
			const [profile] = await tx.select().from(profiles).where(eq(profiles.id, id));
			expect(profile).toMatchObject({
				name: null,
				email: null,
				image: null,
				role: "STUDENT",
			});
			expect(profile.anonymizedAt).not.toBeNull();

			const counts = await leftovers(tx, id);
			expect(counts).toEqual(
				Object.fromEntries(Object.keys(counts).map(name => [name, 0]))
			);
		}));

	it("keeps the study history and the approved requests", () =>
		withRollback(async tx => {
			const { id, approved } = await seedAccount(tx);

			await anonymizeUser(tx, id);

			const [profile] = await tx.select().from(profiles).where(eq(profiles.id, id));
			expect(profile.signupRank).toBe(7);
			expect(
				await tx.select().from(quizAttempts).where(eq(quizAttempts.userId, id))
			).toHaveLength(1);
			expect(
				await tx.select().from(userStats).where(eq(userStats.userId, id))
			).toHaveLength(1);
			const requests = await tx
				.select({ id: contentRequests.id })
				.from(contentRequests)
				.where(eq(contentRequests.userId, id));
			expect(requests).toEqual([{ id: approved }]);
		}));

	it("refuses an account that is already anonymized", () =>
		withRollback(async tx => {
			const { id } = await seedAccount(tx);
			await anonymizeUser(tx, id);
			await expect(anonymizeUser(tx, id)).rejects.toThrow("Utente non trovato");
		}));
});
