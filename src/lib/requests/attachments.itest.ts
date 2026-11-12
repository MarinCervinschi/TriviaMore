import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

import { contentRequests } from "@/db/schema";
import type { StoredObject } from "@/lib/storage/server";
import { closeTestDb, withBoundRollback } from "@/lib/testing/db";
import { createUser } from "@/lib/testing/fixtures";

import { ORPHAN_GRACE_MS, reapOrphanAttachments } from "./service/attachments";

const bucket = vi.hoisted(() => ({
	objects: [] as StoredObject[],
	deleted: [] as string[],
}));

vi.mock("@/db", async () => {
	const { boundTx } = await import("@/lib/testing/db");
	return { getDb: () => boundTx };
});

vi.mock("@/lib/storage/server", () => ({
	async *listObjects() {
		yield* bucket.objects;
	},
	async deleteObjects(_bucket: string, keys: string[]) {
		bucket.deleted.push(...keys);
	},
}));

afterAll(() => closeTestDb());

const NOW = new Date("2026-11-12T12:00:00.000Z");
const old = new Date(NOW.getTime() - ORPHAN_GRACE_MS - 1);
const fresh = new Date(NOW.getTime() - 60_000);

beforeEach(() => {
	bucket.objects = [];
	bucket.deleted = [];
});

describe("reapOrphanAttachments", () => {
	it("deletes old attachments no request names, and keeps the rest", () =>
		withBoundRollback(async tx => {
			const user = await createUser(tx, "STUDENT");
			await tx.insert(contentRequests).values({
				userId: user,
				requestType: "FILE_UPLOAD",
				submittedContent: {
					type: "file_upload",
					file_name: "a.pdf",
					file_path: `${user}/kept.pdf`,
					file_size: 1,
					comment: null,
				},
			});
			bucket.objects = [
				{ key: `${user}/kept.pdf`, lastModified: old, size: 1 },
				{ key: `${user}/orphan.pdf`, lastModified: old, size: 2 },
				{ key: `${user}/uploading.pdf`, lastModified: fresh, size: 3 },
			];

			const result = await reapOrphanAttachments({ now: NOW });

			expect(result.scanned).toBe(3);
			expect(result.orphans.map(o => o.key)).toEqual([`${user}/orphan.pdf`]);
			expect(bucket.deleted).toEqual([`${user}/orphan.pdf`]);
		}));

	it("deletes nothing on a dry run", () =>
		withBoundRollback(async () => {
			bucket.objects = [{ key: "someone/orphan.pdf", lastModified: old, size: 2 }];

			const result = await reapOrphanAttachments({ now: NOW, dryRun: true });

			expect(result.orphans).toHaveLength(1);
			expect(bucket.deleted).toEqual([]);
		}));
});
