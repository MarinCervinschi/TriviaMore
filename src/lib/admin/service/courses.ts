import { and, asc, count, eq, ne, sql } from "drizzle-orm"

import { getDb } from "@/db"
import {
  classes,
  courseClasses,
  courses,
  departments,
  sections,
} from "@/db/schema"
import { requireSuperadmin } from "@/lib/auth/guards"
import { Conflict, NotFound, rethrowUniqueViolation } from "@/lib/server/errors"

import { EXAM_SIMULATION_SECTION } from "@/lib/catalog/constants"

import { requireCourseAccess, requireStructureManager } from "../server/access"
import type { CourseInput, UpdateCourseInput } from "../schemas"
import type { AdminCourseDetail } from "../types"

const DUPLICATE_CODE = "Esiste già un corso con questo codice"

export async function getAdminCourseDetail(
  id: string,
): Promise<AdminCourseDetail> {
  const user = await requireCourseAccess(id)
  const db = getDb()

  const [course] = await db
    .select({
      id: courses.id,
      name: courses.name,
      code: courses.code,
      description: courses.description,
      departmentId: courses.departmentId,
      location: courses.location,
      cfu: courses.cfu,
      position: courses.position,
      courseType: courses.courseType,
      createdAt: courses.createdAt,
      updatedAt: courses.updatedAt,
      department: {
        id: departments.id,
        name: departments.name,
        code: departments.code,
        description: departments.description,
        area: departments.area,
        position: departments.position,
        createdAt: departments.createdAt,
        updatedAt: departments.updatedAt,
      },
    })
    .from(courses)
    .innerJoin(departments, eq(departments.id, courses.departmentId))
    .where(eq(courses.id, id))
    .limit(1)
  if (!course) throw new NotFound("Corso non trovato")

  // The exam-simulation sentinel never counts, and a maintainer does not see the
  // private sections it cannot manage. The page used to fetch every section name
  // and filter client-side to get this number.
  const countable = and(
    ne(sections.name, EXAM_SIMULATION_SECTION),
    user.role === "MAINTAINER" ? eq(sections.isPublic, true) : undefined,
  )

  const linkedClasses = await db
    .select({
      id: classes.id,
      name: classes.name,
      description: classes.description,
      cfu: classes.cfu,
      code: courseClasses.code,
      classYear: courseClasses.classYear,
      mandatory: courseClasses.mandatory,
      catalogueUrl: courseClasses.catalogueUrl,
      curriculum: courseClasses.curriculum,
      position: courseClasses.position,
      sectionCount: count(sections.id),
    })
    .from(courseClasses)
    .innerJoin(classes, eq(classes.id, courseClasses.classId))
    .leftJoin(sections, and(eq(sections.classId, classes.id), countable))
    .where(eq(courseClasses.courseId, id))
    .groupBy(courseClasses.courseId, courseClasses.classId, classes.id)
    .orderBy(asc(courseClasses.position))

  return { ...course, classes: linkedClasses }
}

export async function createCourse(input: CourseInput) {
  await requireStructureManager()

  try {
    const [course] = await getDb()
      .insert(courses)
      .values({
        name: input.name,
        code: input.code,
        description: input.description || null,
        departmentId: input.department_id,
        courseType: input.course_type,
        location: input.location || null,
        cfu: input.cfu ?? null,
        position: sql`(select count(*) + 1 from ${courses} where department_id = ${input.department_id})`,
      })
      .returning()
    return course
  } catch (error) {
    rethrowUniqueViolation(error, DUPLICATE_CODE)
  }
}

export async function updateCourse(id: string, updates: UpdateCourseInput) {
  await requireStructureManager()

  try {
    const [course] = await getDb()
      .update(courses)
      .set({
        name: updates.name,
        code: updates.code,
        description:
          updates.description === undefined
            ? undefined
            : updates.description || null,
        courseType: updates.course_type,
        location:
          updates.location === undefined ? undefined : updates.location || null,
        cfu: updates.cfu === undefined ? undefined : updates.cfu ?? null,
        position: updates.position,
      })
      .where(eq(courses.id, id))
      .returning()

    if (!course) throw new NotFound("Corso non trovato")
    return course
  } catch (error) {
    rethrowUniqueViolation(error, DUPLICATE_CODE)
  }
}

// Same reasoning as deleteDepartment: dropping a course takes its course↔class
// links with it, and RLS was the only thing keeping that away from an ADMIN.
export async function deleteCourse(id: string) {
  await requireSuperadmin()
  const db = getDb()

  const [{ value: linkCount }] = await db
    .select({ value: count() })
    .from(courseClasses)
    .where(eq(courseClasses.courseId, id))

  if (linkCount > 0) {
    throw new Conflict(
      "Impossibile eliminare: il corso ha delle classi collegate. Scollega prima le classi.",
    )
  }

  await db.delete(courses).where(eq(courses.id, id))
}
