import { asc, eq, sql } from "drizzle-orm"

import { getDb } from "@/db"
import {
  courseClasses,
  courses,
  departmentLocations,
  departments,
} from "@/db/schema"

import { courseColumns, departmentColumns, locationColumns } from "../columns"
import type {
  BrowseDepartment,
  CampusLocation,
  DepartmentWithCourses,
} from "../types"
import { findDepartmentByCode } from "./shared"

function listLocations(departmentId: string) {
  return getDb()
    .select(locationColumns)
    .from(departmentLocations)
    .where(eq(departmentLocations.departmentId, departmentId))
    .orderBy(asc(departmentLocations.position))
}

export async function getDepartments(): Promise<BrowseDepartment[]> {
  const rows = await getDb()
    .select({
      ...departmentColumns,
      courseCount: sql<number>`count(distinct ${courses.id})`.mapWith(Number),
      // ::text is not cosmetic: aggregating the enum directly yields a
      // campus_location[], an OID node-postgres has no parser for, and the row
      // comes back as the raw literal "{MODENA,CARPI}" instead of an array.
      campusLocations: sql<
        string[]
      >`coalesce(array_agg(distinct ${departmentLocations.campusLocation}::text) filter (where ${departmentLocations.campusLocation} is not null), '{}')`,
    })
    .from(departments)
    .leftJoin(courses, eq(courses.departmentId, departments.id))
    .leftJoin(
      departmentLocations,
      eq(departmentLocations.departmentId, departments.id),
    )
    .groupBy(departments.id)
    .orderBy(asc(departments.position))

  return rows.map((row) => ({
    ...row,
    campusLocations: row.campusLocations as CampusLocation[],
  }))
}

export async function getDepartmentWithCourses(
  code: string,
): Promise<DepartmentWithCourses | null> {
  const department = await findDepartmentByCode(code)
  if (!department) return null

  const [courseRows, locations] = await Promise.all([
    getDb()
      .select({
        ...courseColumns,
        classCount: sql<number>`count(${courseClasses.classId})`.mapWith(Number),
      })
      .from(courses)
      .leftJoin(courseClasses, eq(courseClasses.courseId, courses.id))
      .where(eq(courses.departmentId, department.id))
      .groupBy(courses.id)
      .orderBy(asc(courses.position)),
    listLocations(department.id),
  ])

  return { ...department, courses: courseRows, locations }
}

export async function getDepartmentCourseList(departmentId: string) {
  return getDb()
    .select({ id: courses.id, name: courses.name, code: courses.code })
    .from(courses)
    .where(eq(courses.departmentId, departmentId))
    .orderBy(asc(courses.name))
}
