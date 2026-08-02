import { and, eq } from "drizzle-orm"

import { getDb } from "@/db"
import { sections } from "@/db/schema"
import { canAccessSection } from "@/lib/auth/checks"
import { countQuestionsBySection } from "@/lib/catalog/db/questions"

import type { SectionDetail } from "../types"
import { resolveClassByCodes } from "./shared"

export async function getSectionDetail(
  userId: string | null,
  codes: {
    deptCode: string
    courseCode: string
    classCode: string
    sectionSlug: string
  },
): Promise<SectionDetail | null> {
  const resolved = await resolveClassByCodes(
    codes.deptCode,
    codes.courseCode,
    codes.classCode,
  )
  if (!resolved) return null

  const db = getDb()
  const { course, department, class: cls, courseClass } = resolved

  const [section] = await db
    .select()
    .from(sections)
    .where(
      and(
        eq(sections.classId, cls.id),
        eq(sections.slug, codes.sectionSlug.toLowerCase()),
      ),
    )
    .limit(1)
  if (!section) return null

  // A private section is indistinguishable from a missing one, so the URL does
  // not confirm that it exists.
  if (!(await canAccessSection(userId, section.id))) return null

  const counts = (await countQuestionsBySection(db, [section.id])).get(
    section.id,
  )

  return {
    ...section,
    class: {
      ...cls,
      courseClass,
      course: { ...course, department },
    },
    questionCount: counts?.total ?? 0,
    quizQuestionCount: counts?.quiz ?? 0,
    flashcardQuestionCount: counts?.flashcard ?? 0,
  }
}
