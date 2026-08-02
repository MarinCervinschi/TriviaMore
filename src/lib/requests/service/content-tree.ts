import { and, asc, eq, exists, or } from "drizzle-orm"

import { getDb } from "@/db"
import {
  classes,
  courseClasses,
  courses,
  departments,
  sectionAccess,
  sections,
} from "@/db/schema"

export type RequestTargetTree = {
  id: string
  name: string
  courses: {
    id: string
    name: string
    classes: {
      id: string
      name: string
      sections: { id: string; name: string }[]
    }[]
  }[]
}[]

// Target picker for the request form. It used to run on the RLS client, where
// `sections_select USING (can_access_section(id))` hid private sections; on a
// service-role connection that filter has to be spelled out, or the picker would
// list the name of every private section to every user.
export async function getContentTree(
  userId: string | null,
): Promise<RequestTargetTree> {
  const db = getDb()

  const visibleSection = userId
    ? or(
        eq(sections.isPublic, true),
        exists(
          db
            .select({ one: sectionAccess.sectionId })
            .from(sectionAccess)
            .where(
              and(
                eq(sectionAccess.sectionId, sections.id),
                eq(sectionAccess.userId, userId),
              ),
            ),
        ),
      )
    : eq(sections.isPublic, true)

  const rows = await db
    .select({
      departmentId: departments.id,
      departmentName: departments.name,
      departmentPosition: departments.position,
      courseId: courses.id,
      courseName: courses.name,
      coursePosition: courses.position,
      classId: classes.id,
      className: classes.name,
      classPosition: courseClasses.position,
      sectionId: sections.id,
      sectionName: sections.name,
      sectionPosition: sections.position,
    })
    .from(departments)
    .innerJoin(courses, eq(courses.departmentId, departments.id))
    .innerJoin(courseClasses, eq(courseClasses.courseId, courses.id))
    .innerJoin(classes, eq(classes.id, courseClasses.classId))
    // Visibility filters the sections, not the classes above them: a class with
    // no sections yet is exactly what a "propose a new section" request targets.
    .leftJoin(sections, and(eq(sections.classId, classes.id), visibleSection))
    .orderBy(
      asc(departments.position),
      asc(courses.position),
      asc(courseClasses.position),
      asc(sections.position),
    )

  const tree: RequestTargetTree = []
  const departmentIndex = new Map<string, number>()
  const courseIndex = new Map<string, number>()
  const classIndex = new Map<string, number>()

  for (const row of rows) {
    let di = departmentIndex.get(row.departmentId)
    if (di === undefined) {
      di = tree.push({
        id: row.departmentId,
        name: row.departmentName,
        courses: [],
      }) - 1
      departmentIndex.set(row.departmentId, di)
    }

    const courseKey = `${row.departmentId}/${row.courseId}`
    let ci = courseIndex.get(courseKey)
    if (ci === undefined) {
      ci = tree[di].courses.push({
        id: row.courseId,
        name: row.courseName,
        classes: [],
      }) - 1
      courseIndex.set(courseKey, ci)
    }

    const classKey = `${courseKey}/${row.classId}`
    let cli = classIndex.get(classKey)
    if (cli === undefined) {
      cli = tree[di].courses[ci].classes.push({
        id: row.classId,
        name: row.className,
        sections: [],
      }) - 1
      classIndex.set(classKey, cli)
    }

    if (row.sectionId && row.sectionName) {
      tree[di].courses[ci].classes[cli].sections.push({
        id: row.sectionId,
        name: row.sectionName,
      })
    }
  }

  return tree
}
