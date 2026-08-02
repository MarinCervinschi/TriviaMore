import { and, asc, count, eq, ne } from "drizzle-orm"

import { getDb } from "@/db"
import {
  classes,
  courseClasses,
  courseMaintainers,
  courses,
  departmentAdmins,
  departments,
  questions,
  sections,
} from "@/db/schema"
import { requireAdmin } from "@/lib/auth/guards"
import { EXAM_SIMULATION_SECTION } from "@/lib/catalog/constants"

import type {
  AdminPermissions,
  AdminStats,
  ContentTreeClass,
  ContentTreeCourse,
  ContentTreeDepartment,
} from "../types"

export async function getAdminStats(): Promise<AdminStats> {
  const user = await requireAdmin()
  const db = getDb()

  // `sections_select` and `questions_select` were both gated on
  // can_access_section(), so a maintainer never counted a private section or
  // its questions. Nothing filters them now except this.
  const publicOnly = user.role === "MAINTAINER"
  const isVisible = publicOnly ? eq(sections.isPublic, true) : undefined

  const [[department], [course], [cls], [section], [question]] =
    await Promise.all([
      db.select({ value: count() }).from(departments),
      db.select({ value: count() }).from(courses),
      db.select({ value: count() }).from(classes),
      db
        .select({ value: count() })
        .from(sections)
        .where(and(ne(sections.name, EXAM_SIMULATION_SECTION), isVisible)),
      db
        .select({ value: count() })
        .from(questions)
        .innerJoin(sections, eq(sections.id, questions.sectionId))
        .where(isVisible),
    ])

  return {
    departmentCount: department.value,
    courseCount: course.value,
    classCount: cls.value,
    sectionCount: section.value,
    questionCount: question.value,
  }
}

export async function getAdminPermissions(): Promise<AdminPermissions> {
  const user = await requireAdmin()
  const db = getDb()

  const [managedDepartments, maintainedCourses] = await Promise.all([
    db
      .select({ id: departmentAdmins.departmentId })
      .from(departmentAdmins)
      .where(eq(departmentAdmins.userId, user.id)),
    db
      .select({ id: courseMaintainers.courseId })
      .from(courseMaintainers)
      .where(eq(courseMaintainers.userId, user.id)),
  ])

  return {
    role: user.role,
    managedDepartmentIds: managedDepartments.map((row) => row.id),
    maintainedCourseIds: maintainedCourses.map((row) => row.id),
  }
}

// Courses the current user maintains, with names — used to show scoped links
// in the admin sidebar instead of the full departments tree.
export async function getMyMaintainedCourses() {
  const user = await requireAdmin()

  return getDb()
    .select({ id: courses.id, name: courses.name, code: courses.code })
    .from(courseMaintainers)
    .innerJoin(courses, eq(courses.id, courseMaintainers.courseId))
    .where(eq(courseMaintainers.userId, user.id))
    .orderBy(asc(courses.name))
}

// One flat join, grouped here: the tree is four levels deep and small enough
// that four round trips would cost more than the duplicated parent columns.
export async function getContentTree(): Promise<ContentTreeDepartment[]> {
  const user = await requireAdmin()

  const rows = await getDb()
    .select({
      departmentId: departments.id,
      departmentName: departments.name,
      courseId: courses.id,
      courseName: courses.name,
      classId: classes.id,
      className: classes.name,
      sectionId: sections.id,
      sectionName: sections.name,
    })
    .from(departments)
    .leftJoin(courses, eq(courses.departmentId, departments.id))
    .leftJoin(courseClasses, eq(courseClasses.courseId, courses.id))
    .leftJoin(classes, eq(classes.id, courseClasses.classId))
    .leftJoin(
      sections,
      and(
        eq(sections.classId, classes.id),
        // Private sections were hidden from a maintainer by `sections_select`;
        // the join has to say so now.
        user.role === "MAINTAINER" ? eq(sections.isPublic, true) : undefined,
      ),
    )
    .orderBy(
      asc(departments.position),
      asc(courses.position),
      asc(courseClasses.position),
      asc(sections.position),
    )

  const tree: ContentTreeDepartment[] = []
  const departmentNodes = new Map<string, ContentTreeDepartment>()
  const courseNodes = new Map<string, ContentTreeCourse>()
  const classNodes = new Map<string, ContentTreeClass>()

  for (const row of rows) {
    let department = departmentNodes.get(row.departmentId)
    if (!department) {
      department = { id: row.departmentId, name: row.departmentName, courses: [] }
      departmentNodes.set(department.id, department)
      tree.push(department)
    }
    if (!row.courseId) continue

    let course = courseNodes.get(row.courseId)
    if (!course) {
      course = { id: row.courseId, name: row.courseName!, classes: [] }
      courseNodes.set(course.id, course)
      department.courses.push(course)
    }
    if (!row.classId) continue

    // A class can be taught in several courses, so it is keyed by both.
    const classKey = `${row.courseId}:${row.classId}`
    let cls = classNodes.get(classKey)
    if (!cls) {
      cls = { id: row.classId, name: row.className!, sections: [] }
      classNodes.set(classKey, cls)
      course.classes.push(cls)
    }
    if (!row.sectionId) continue

    cls.sections.push({ id: row.sectionId, name: row.sectionName! })
  }

  return tree
}
