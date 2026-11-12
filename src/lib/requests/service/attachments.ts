import { sql } from "drizzle-orm";

import type { DbOrTx } from "@/db";
import { getDb } from "@/db";
import { contentRequests } from "@/db/schema";
import { type StoredObject, deleteObjects, listObjects } from "@/lib/storage/server";

/** An upload younger than this may still be waiting for the request that will name it. */
export const ORPHAN_GRACE_MS = 24 * 60 * 60 * 1000;

async function referencedPaths(db: DbOrTx): Promise<Set<string>> {
	const rows = await db
		.select({ path: sql<string>`${contentRequests.submittedContent} ->> 'file_path'` })
		.from(contentRequests)
		.where(sql`${contentRequests.submittedContent} ->> 'type' = 'file_upload'`);
	return new Set(rows.map(row => row.path).filter(Boolean));
}

/** The attachments no request names, older than the grace period; deleted unless `dryRun`. */
export async function reapOrphanAttachments(options?: {
	db?: DbOrTx;
	dryRun?: boolean;
	now?: Date;
	signal?: AbortSignal;
}): Promise<{ scanned: number; orphans: StoredObject[] }> {
	const db = options?.db ?? getDb();
	const cutoff = (options?.now ?? new Date()).getTime() - ORPHAN_GRACE_MS;

	// Listed before the query, so a request created in between still counts as a reference.
	const objects: StoredObject[] = [];
	for await (const object of listObjects("contributions")) objects.push(object);
	options?.signal?.throwIfAborted();
	const referenced = await referencedPaths(db);

	const orphans = objects.filter(
		object => !referenced.has(object.key) && object.lastModified.getTime() < cutoff
	);
	if (!options?.dryRun && orphans.length > 0) {
		await deleteObjects(
			"contributions",
			orphans.map(object => object.key)
		);
	}
	return { scanned: objects.length, orphans };
}
