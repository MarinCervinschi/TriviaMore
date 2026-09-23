import { and, eq, exists, inArray, or, sql } from "drizzle-orm";
import type { SQL } from "drizzle-orm";

import type { DbOrTx } from "@/db";
import { profiles, sectionAccess, sections } from "@/db/schema";
import { findSectionById } from "@/lib/catalog/db/sections";
import { Forbidden } from "@/lib/server/errors";

// Application-layer replacement for the catalog.can_access_section() RLS helper.
// Reads now run on a service-role Drizzle connection, where the database no
// longer filters private sections: these checks are the only thing left between
// a section id in a URL and its questions.
//
// `db` first so the same check runs standalone or inside a caller's transaction.

async function grantedSectionIds(db: DbOrTx, userId: string, sectionIds: string[]) {
	const rows = await db
		.select({ sectionId: sectionAccess.sectionId })
		.from(sectionAccess)
		.where(
			and(
				eq(sectionAccess.userId, userId),
				inArray(sectionAccess.sectionId, sectionIds)
			)
		);
	return rows.map(row => row.sectionId);
}

// The third arm of the old `can_access_section()`. MAINTAINER is deliberately out:
// its scope stops at public content.
export async function readsPrivateSections(db: DbOrTx, userId: string | null) {
	if (!userId) return false;

	const [row] = await db
		.select({ role: profiles.role })
		.from(profiles)
		.where(eq(profiles.id, userId))
		.limit(1);
	return row?.role === "ADMIN" || row?.role === "SUPERADMIN";
}

/**
 * `filterAccessibleSections` as a predicate, so a count and the list it labels
 * cannot drift. The exam-simulation sentinel is a catalogue rule, not an access
 * one: the caller excludes it.
 */
export function accessibleSectionsSql(
	db: DbOrTx,
	userId: string | null,
	readsPrivate: boolean
): SQL {
	if (readsPrivate) return sql`true`;
	if (!userId) return eq(sections.isPublic, true);

	return or(
		eq(sections.isPublic, true),
		exists(
			db
				.select({ one: sql`1` })
				.from(sectionAccess)
				.where(
					and(
						eq(sectionAccess.userId, userId),
						eq(sectionAccess.sectionId, sections.id)
					)
				)
		)
	)!;
}

export async function canAccessSection(
	db: DbOrTx,
	userId: string | null,
	sectionId: string
): Promise<boolean> {
	const section = await findSectionById(db, sectionId);
	if (!section) return false;
	if (section.isPublic) return true;
	if (!userId) return false;
	if (await readsPrivateSections(db, userId)) return true;

	return (await grantedSectionIds(db, userId, [sectionId])).length > 0;
}

export async function assertSectionAccess(
	db: DbOrTx,
	userId: string | null,
	sectionId: string
): Promise<void> {
	if (!(await canAccessSection(db, userId, sectionId))) {
		throw new Forbidden("Non hai accesso a questa sezione");
	}
}

// Batch form for the paths that span a whole class — a per-section round trip
// would turn one query into dozens.
export async function filterAccessibleSections(
	db: DbOrTx,
	userId: string | null,
	sectionIds: string[]
): Promise<Set<string>> {
	if (sectionIds.length === 0) return new Set();

	const visibility = await db
		.select({ id: sections.id, isPublic: sections.isPublic })
		.from(sections)
		.where(inArray(sections.id, sectionIds));

	const allowed = new Set<string>();
	const restricted: string[] = [];
	for (const section of visibility) {
		if (section.isPublic) allowed.add(section.id);
		else restricted.push(section.id);
	}

	if (restricted.length > 0 && userId) {
		if (await readsPrivateSections(db, userId)) {
			for (const sectionId of restricted) allowed.add(sectionId);
		} else {
			for (const sectionId of await grantedSectionIds(db, userId, restricted)) {
				allowed.add(sectionId);
			}
		}
	}

	return allowed;
}
