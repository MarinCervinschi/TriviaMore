import { and, eq, inArray } from "drizzle-orm"

import { getDb } from "@/db"
import { sectionAccess, sections } from "@/db/schema"
import { findSectionById } from "@/lib/catalog/db/sections"
import { Forbidden } from "@/lib/server/errors"

// Application-layer replacement for the catalog.can_access_section() RLS helper.
// Reads now run on a service-role Drizzle connection, where the database no
// longer filters private sections: these checks are the only thing left between
// a section id in a URL and its questions.

async function grantedSectionIds(userId: string, sectionIds: string[]) {
  const rows = await getDb()
    .select({ sectionId: sectionAccess.sectionId })
    .from(sectionAccess)
    .where(
      and(
        eq(sectionAccess.userId, userId),
        inArray(sectionAccess.sectionId, sectionIds),
      ),
    )
  return rows.map((row) => row.sectionId)
}

export async function canAccessSection(
  userId: string | null,
  sectionId: string,
): Promise<boolean> {
  const section = await findSectionById(getDb(), sectionId)
  if (!section) return false
  if (section.isPublic) return true
  if (!userId) return false

  return (await grantedSectionIds(userId, [sectionId])).length > 0
}

export async function assertSectionAccess(
  userId: string | null,
  sectionId: string,
): Promise<void> {
  if (!(await canAccessSection(userId, sectionId))) {
    throw new Forbidden("Non hai accesso a questa sezione")
  }
}

// Batch form for the paths that span a whole class — a per-section round trip
// would turn one query into dozens.
export async function filterAccessibleSections(
  userId: string | null,
  sectionIds: string[],
): Promise<Set<string>> {
  if (sectionIds.length === 0) return new Set()

  const visibility = await getDb()
    .select({ id: sections.id, isPublic: sections.isPublic })
    .from(sections)
    .where(inArray(sections.id, sectionIds))

  const allowed = new Set<string>()
  const restricted: string[] = []
  for (const section of visibility) {
    if (section.isPublic) allowed.add(section.id)
    else restricted.push(section.id)
  }

  if (restricted.length > 0 && userId) {
    for (const sectionId of await grantedSectionIds(userId, restricted)) {
      allowed.add(sectionId)
    }
  }

  return allowed
}
