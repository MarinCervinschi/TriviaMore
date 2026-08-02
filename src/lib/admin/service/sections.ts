import { asc, count, desc, eq, sql } from "drizzle-orm"

import { getDb } from "@/db"
import {
  classes,
  courseClasses,
  courses,
  departments,
  questions,
  sections,
} from "@/db/schema"
import { Conflict, Forbidden, NotFound } from "@/lib/server/errors"

import {
  requireContentManagerForClass,
  requireContentManagerForSection,
  requireSectionAccess,
} from "../access"
import type { SectionInput, UpdateSectionInput } from "../schemas"
import type { AdminSectionDetail } from "../types"

export async function getAdminSectionDetail(
  id: string,
): Promise<AdminSectionDetail> {
  await requireSectionAccess(id)
  const db = getDb()

  const [section] = await db
    .select({
      id: sections.id,
      name: sections.name,
      description: sections.description,
      isPublic: sections.isPublic,
      classId: sections.classId,
      position: sections.position,
      slug: sections.slug,
      createdAt: sections.createdAt,
      updatedAt: sections.updatedAt,
      className: classes.name,
    })
    .from(sections)
    .innerJoin(classes, eq(classes.id, sections.classId))
    .where(eq(sections.id, id))
    .limit(1)
  if (!section) throw new NotFound("Sezione non trovata")

  // Primary course of the owning class, for the breadcrumb.
  const [parent] = await db
    .select({
      classCode: courseClasses.code,
      courseId: courses.id,
      courseName: courses.name,
      courseCode: courses.code,
      departmentName: departments.name,
      departmentCode: departments.code,
    })
    .from(courseClasses)
    .innerJoin(courses, eq(courses.id, courseClasses.courseId))
    .innerJoin(departments, eq(departments.id, courses.departmentId))
    .where(eq(courseClasses.classId, section.classId))
    .orderBy(asc(courseClasses.position))
    .limit(1)

  const questionRows = await db
    .select()
    .from(questions)
    .where(eq(questions.sectionId, id))
    .orderBy(desc(questions.createdAt))

  return {
    ...section,
    parent: parent ?? null,
    questions: questionRows,
  }
}

export async function createSection(input: SectionInput) {
  const user = await requireContentManagerForClass(input.class_id)
  if (user.role === "MAINTAINER" && input.is_public === false) {
    throw new Forbidden("I maintainer possono creare solo sezioni pubbliche.")
  }

  const [section] = await getDb()
    .insert(sections)
    .values({
      name: input.name,
      description: input.description || null,
      classId: input.class_id,
      isPublic: input.is_public ?? true,
      position: sql`(select count(*) + 1 from ${sections} where class_id = ${input.class_id})`,
    })
    .returning()

  return section
}

export async function updateSection(id: string, updates: UpdateSectionInput) {
  const user = await requireContentManagerForSection(id)
  // Visibility is a superadmin decision. Without this a maintainer could turn a
  // section it manages private and then be locked out of it by the very guard
  // above — and, worse, decide unilaterally who can read it.
  if (user.role === "MAINTAINER" && updates.is_public === false) {
    throw new Forbidden("I maintainer non possono rendere privata una sezione.")
  }

  const [section] = await getDb()
    .update(sections)
    .set({
      name: updates.name,
      description:
        updates.description === undefined
          ? undefined
          : updates.description || null,
      isPublic: updates.is_public,
      position: updates.position,
    })
    .where(eq(sections.id, id))
    .returning()

  if (!section) throw new NotFound("Sezione non trovata")
  return section
}

export async function deleteSection(id: string) {
  await requireContentManagerForSection(id)
  const db = getDb()

  const [{ value: questionCount }] = await db
    .select({ value: count() })
    .from(questions)
    .where(eq(questions.sectionId, id))

  if (questionCount > 0) {
    throw new Conflict(
      "Impossibile eliminare: la sezione contiene delle domande. Elimina prima le domande.",
    )
  }

  await db.delete(sections).where(eq(sections.id, id))
}
