import { afterAll, describe, expect, it, vi } from "vitest";

import { contentRequests } from "@/db/schema";
import type { AuthUser } from "@/lib/auth/types";
import { closeTestDb, withBoundRollback } from "@/lib/testing/db";
import { createUser } from "@/lib/testing/fixtures";

import { MAX_HANDLED_REQUESTS, getAdminRequests } from "./service/admin-requests";

const actor = vi.hoisted(() => ({ user: null as AuthUser | null }));

vi.mock("@/db", async () => {
	const { boundTx } = await import("@/lib/testing/db");
	return { getDb: () => boundTx };
});

vi.mock("@/lib/auth/guards", async importOriginal => ({
	...(await importOriginal<typeof import("@/lib/auth/guards")>()),
	requireAdmin: async () => actor.user!,
}));

afterAll(() => closeTestDb());

const section = { type: "section", name: "S", description: "" };

describe("the admin request list", () => {
	it("lists every open request and only the most recently handled ones", () =>
		withBoundRollback(async tx => {
			const admin = await createUser(tx, "ADMIN");
			const student = await createUser(tx, "STUDENT");
			actor.user = { id: admin, role: "ADMIN" } as AuthUser;

			const base = Date.parse("2026-01-01T00:00:00.000Z");
			const at = (minutes: number) => new Date(base + minutes * 60_000).toISOString();

			await tx.insert(contentRequests).values(
				Array.from({ length: MAX_HANDLED_REQUESTS + 2 }, (_, i) => ({
					userId: student,
					requestType: "NEW_SECTION" as const,
					status: "REJECTED" as const,
					submittedContent: section,
					createdAt: at(i),
					handledAt: at(i + 1),
					handledBy: admin,
				}))
			);
			const open = await tx
				.insert(contentRequests)
				.values(
					(["PENDING", "NEEDS_REVISION", "PENDING"] as const).map((status, i) => ({
						userId: student,
						requestType: "NEW_SECTION" as const,
						status,
						submittedContent: section,
						createdAt: at(-10 - i),
					}))
				)
				.returning({ id: contentRequests.id });

			const listed = await getAdminRequests();
			const ids = new Set(listed.map(request => request.id));

			expect(listed).toHaveLength(MAX_HANDLED_REQUESTS + open.length);
			for (const { id } of open) expect(ids.has(id)).toBe(true);
			const handled = listed.filter(request => request.status === "REJECTED");
			const oldest = Math.min(...handled.map(request => Date.parse(request.createdAt)));
			expect(oldest).toBe(Date.parse(at(2)));
		}));
});
