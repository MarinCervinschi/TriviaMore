import { eq } from "drizzle-orm";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { sessions } from "@/db/schema";
import {
	TEST_PASSWORD,
	authClient,
	createPasswordUser,
	setAuthEnv,
} from "@/lib/testing/auth";
import { closeTestDb, withBoundRollback } from "@/lib/testing/db";

import { getAuth } from "./server";

vi.mock("@/db", async () => {
	const { boundTx } = await import("@/lib/testing/db");
	return { getDb: () => boundTx };
});

setAuthEnv();

const MINUTE = 60_000;

beforeEach(() => vi.useFakeTimers({ toFake: ["Date"] }));
afterEach(() => vi.useRealTimers());
afterAll(() => closeTestDb());

describe("a revoked session", () => {
	it("ends once its cookie cache expires", () =>
		withBoundRollback(async tx => {
			const start = Date.now();
			const user = await createPasswordUser(tx, "ADMIN");
			const client = authClient();

			const signIn = await client.post("/sign-in/email", {
				email: user.email,
				password: TEST_PASSWORD,
			});
			expect(signIn.status).toBe(200);
			expect(
				await getAuth().api.getSession({ headers: client.headers() })
			).toMatchObject({ user: { id: user.id } });

			await tx.delete(sessions).where(eq(sessions.userId, user.id));

			for (const minutes of [4, 8]) {
				vi.setSystemTime(start + minutes * MINUTE);
				await client.post("/update-user", { name: "Utente Test" });
			}

			vi.setSystemTime(start + 12 * MINUTE);
			expect(await getAuth().api.getSession({ headers: client.headers() })).toBeNull();
		}));
});
