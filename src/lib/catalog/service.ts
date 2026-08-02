import { getDb } from "@/db"
import { filterAccessibleSections } from "@/lib/auth/checks"

import { findSectionsInClass } from "./db/sections"

// Sections of a class the user is allowed to study, used by every "whole class"
// entry point: exam simulation and exam flashcards.
export async function accessibleSectionIdsInClass(
  userId: string | null,
  classId: string,
): Promise<string[]> {
  const all = await findSectionsInClass(getDb(), classId)
  const allowed = await filterAccessibleSections(
    userId,
    all.map((section) => section.id),
  )
  return all.filter((section) => allowed.has(section.id)).map((s) => s.id)
}

// The public URL of a section. Null when the class hangs off no course, since
// there is no browse route to point at.
export function sectionBrowsePath(
  chain:
    | {
        departmentCode: string | null
        courseCode: string | null
        classCode: string | null
        sectionSlug: string | null
      }
    | null
    | undefined,
): string | null {
  if (!chain) return null
  const { departmentCode, courseCode, classCode, sectionSlug } = chain
  if (!departmentCode || !courseCode || !classCode || !sectionSlug) return null

  return `/browse/${departmentCode.toLowerCase()}/${courseCode.toLowerCase()}/${classCode.toLowerCase()}/${sectionSlug}`
}
