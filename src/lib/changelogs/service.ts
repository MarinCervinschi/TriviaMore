import { and, eq, inArray } from "drizzle-orm";

import { getDb } from "@/db";
import { userChangelogReads } from "@/db/schema";

import { CHANGELOG_VERSIONS } from "./static";

export async function getUnreadVersions(userId: string): Promise<string[]> {
	if (CHANGELOG_VERSIONS.length === 0) return [];

	const rows = await getDb()
		.select({ version: userChangelogReads.version })
		.from(userChangelogReads)
		.where(
			and(
				eq(userChangelogReads.userId, userId),
				inArray(userChangelogReads.version, [...CHANGELOG_VERSIONS])
			)
		);

	const read = new Set(rows.map(row => row.version));
	return CHANGELOG_VERSIONS.filter(version => !read.has(version));
}

export async function markVersionsRead(userId: string, versions: string[]) {
	if (versions.length === 0) return;

	await getDb()
		.insert(userChangelogReads)
		.values(versions.map(version => ({ userId, version })))
		.onConflictDoNothing();
}
