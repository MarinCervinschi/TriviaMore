import { getCatalogAdmin } from "@/lib/supabase/admin"

// Application-layer replacement for the catalog.can_access_section() RLS helper.
// Content reads currently go through the RLS client, so the database still
// filters private sections; once they move to Drizzle on a service-role
// connection that filter is gone and only these checks remain. They use the
// service-role client deliberately: the answer must not depend on RLS.

export async function canAccessSection(
  userId: string | null,
  sectionId: string,
): Promise<boolean> {
  const { data: section } = await getCatalogAdmin()
    .from("sections")
    .select("is_public")
    .eq("id", sectionId)
    .maybeSingle()

  if (!section) return false
  if (section.is_public) return true
  if (!userId) return false

  const { data: grant } = await getCatalogAdmin()
    .from("section_access")
    .select("section_id")
    .eq("user_id", userId)
    .eq("section_id", sectionId)
    .maybeSingle()

  return grant !== null
}

export async function assertSectionAccess(
  userId: string | null,
  sectionId: string,
): Promise<void> {
  if (!(await canAccessSection(userId, sectionId))) {
    throw new Error("Non hai accesso a questa sezione")
  }
}

// Batch form for the paths that span a whole class — a per-section round trip
// would turn one query into dozens.
export async function filterAccessibleSections(
  userId: string | null,
  sectionIds: string[],
): Promise<Set<string>> {
  if (sectionIds.length === 0) return new Set()

  const { data: sections } = await getCatalogAdmin()
    .from("sections")
    .select("id, is_public")
    .in("id", sectionIds)

  const allowed = new Set<string>()
  const restricted: string[] = []
  for (const section of sections ?? []) {
    if (section.is_public) allowed.add(section.id)
    else restricted.push(section.id)
  }

  if (restricted.length > 0 && userId) {
    const { data: grants } = await getCatalogAdmin()
      .from("section_access")
      .select("section_id")
      .eq("user_id", userId)
      .in("section_id", restricted)
    for (const grant of grants ?? []) allowed.add(grant.section_id)
  }

  return allowed
}
