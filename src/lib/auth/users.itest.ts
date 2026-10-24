import { eq, sql } from "drizzle-orm";
import { afterAll, describe, expect, it } from "vitest";

import { profiles, users } from "@/db/schema";
import { closeTestDb, withRollback } from "@/lib/testing/db";
import { createUser } from "@/lib/testing/fixtures";

afterAll(() => closeTestDb());

describe("users and profiles", () => {
	it("gives a GoTrue sign-up a user and a profile", () =>
		withRollback(async tx => {
			const id = crypto.randomUUID();
			await tx.execute(sql`
				insert into auth.users (id, email, raw_user_meta_data)
				values (${id}, 'Mario@Example.test', '{"name": "Mario Rossi"}'::jsonb)
			`);

			const [user] = await tx.select().from(users).where(eq(users.id, id));
			expect(user).toMatchObject({
				name: "Mario Rossi",
				email: "mario@example.test",
				emailVerified: false,
			});
			const [profile] = await tx.select().from(profiles).where(eq(profiles.id, id));
			expect(profile?.name).toBe("Mario Rossi");
		}));

	it("deletes the profile with its user", () =>
		withRollback(async tx => {
			const id = await createUser(tx, "STUDENT");
			await tx.delete(users).where(eq(users.id, id));
			expect(await tx.select().from(profiles).where(eq(profiles.id, id))).toHaveLength(
				0
			);
		}));
});
