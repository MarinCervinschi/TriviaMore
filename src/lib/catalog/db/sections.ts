import { and, asc, eq, ne } from "drizzle-orm"

import type { DbOrTx } from "@/db"
import { classes, sections } from "@/db/schema"

import { EXAM_SIMULATION_SECTION } from "../constants"
import { primaryCourseByClass } from "./course-classes"

export async function findSectionById(db: DbOrTx, sectionId: string) {
  const [section] = await db
    .select()
    .from(sections)
    .where(eq(sections.id, sectionId))
    .limit(1)
  return section
}

export async function findSectionsInClass(db: DbOrTx, classId: string) {
  return db
    .select()
    .from(sections)
    .where(
      and(
        eq(sections.classId, classId),
        ne(sections.name, EXAM_SIMULATION_SECTION),
      ),
    )
    .orderBy(asc(sections.position))
}

// Section plus the whole hierarchy above it, resolved through the primary
// course of its class. Replaces the chain the `_detail` views used to carry.
export async function findSectionChain(db: DbOrTx, sectionId: string) {
  const primaryCourse = primaryCourseByClass(db)

  const [row] = await db
    .select({
      sectionId: sections.id,
      sectionName: sections.name,
      sectionSlug: sections.slug,
      isPublic: sections.isPublic,
      classId: classes.id,
      className: classes.name,
      classCode: primaryCourse.classCode,
      courseId: primaryCourse.courseId,
      courseName: primaryCourse.courseName,
      courseCode: primaryCourse.courseCode,
      departmentId: primaryCourse.departmentId,
      departmentName: primaryCourse.departmentName,
      departmentCode: primaryCourse.departmentCode,
    })
    .from(sections)
    .innerJoin(classes, eq(classes.id, sections.classId))
    .leftJoin(primaryCourse, eq(primaryCourse.classId, classes.id))
    .where(eq(sections.id, sectionId))
    .limit(1)

  return row
}
