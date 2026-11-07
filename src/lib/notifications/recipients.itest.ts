import { eq } from "drizzle-orm";
import { afterAll, describe, expect, it } from "vitest";

import { courseMaintainers, notifications } from "@/db/schema";
import { type TestTx, closeTestDb, withRollback } from "@/lib/testing/db";
import {
	type MaintainerScope,
	createUser,
	seedMaintainerScope,
} from "@/lib/testing/fixtures";

import { notifyAdminsInScope } from "./service";

afterAll(() => closeTestDb());

async function notifyAbout(
	tx: TestTx,
	s: MaintainerScope,
	sectionId: string,
	withClass = true
): Promise<Set<string>> {
	const id = crypto.randomUUID();
	await notifyAdminsInScope(tx, {
		id,
		title: "2 domande",
		departmentId: null,
		courseId: withClass ? s.maintainedCourse : null,
		classId: withClass ? s.classInScope : null,
		sectionId,
	});
	const rows = await tx
		.select({ userId: notifications.userId })
		.from(notifications)
		.where(eq(notifications.referenceId, id));
	return new Set(rows.map(row => row.userId));
}

describe("notifying a new request", () => {
	it("reaches the course's MAINTAINER for a public section", () =>
		withRollback(async tx => {
			const s = await seedMaintainerScope(tx);
			expect(await notifyAbout(tx, s, s.publicSection)).toContain(s.maintainer);
		}));

	it("leaves the course's MAINTAINER out for a private section", () =>
		withRollback(async tx => {
			const s = await seedMaintainerScope(tx);
			expect(await notifyAbout(tx, s, s.privateSection)).not.toContain(s.maintainer);
		}));

	it("leaves the MAINTAINER out when only the section is known", () =>
		withRollback(async tx => {
			const s = await seedMaintainerScope(tx);
			expect(await notifyAbout(tx, s, s.privateSection, false)).not.toContain(
				s.maintainer
			);
		}));

	it("still reaches an ADMIN of the course and every SUPERADMIN for a private section", () =>
		withRollback(async tx => {
			const s = await seedMaintainerScope(tx);
			const admin = await createUser(tx, "ADMIN");
			const superadmin = await createUser(tx, "SUPERADMIN");
			await tx
				.insert(courseMaintainers)
				.values({ userId: admin, courseId: s.maintainedCourse });

			const recipients = await notifyAbout(tx, s, s.privateSection);
			expect(recipients).toContain(admin);
			expect(recipients).toContain(superadmin);
		}));
});
