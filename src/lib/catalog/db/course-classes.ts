import { asc, eq, inArray, sql } from "drizzle-orm"

import type { DbOrTx } from "@/db"
import { courseClasses, courses, departments } from "@/db/schema"

type DepartmentArea = (typeof departments.$inferSelect)["area"]

// A class can belong to several courses; the one with the lowest `position` is
// the canonical parent for breadcrumbs, paths and notification routing.
// DISTINCT ON resolves it for every class in one pass, so this joins as well
// against a single section as against a whole listing.
//
// Every column is aliased explicitly. Three tables here have a `code` and two
// have a `name`; without the aliases the subquery would expose duplicates and
// the outer query would silently read the wrong one.
export function primaryCourseByClass(db: DbOrTx, classIds?: string[]) {
  return db
    .selectDistinctOn([courseClasses.classId], {
      classId: sql<string>`${courseClasses.classId}`.as("pc_class_id"),
      classCode: sql<string>`${courseClasses.code}`.as("pc_class_code"),
      classYear: sql<number>`${courseClasses.classYear}`.as("pc_class_year"),
      courseId: sql<string>`${courses.id}`.as("pc_course_id"),
      courseName: sql<string>`${courses.name}`.as("pc_course_name"),
      courseCode: sql<string>`${courses.code}`.as("pc_course_code"),
      departmentId: sql<string>`${departments.id}`.as("pc_department_id"),
      departmentName: sql<string>`${departments.name}`.as("pc_department_name"),
      departmentCode: sql<string>`${departments.code}`.as("pc_department_code"),
      departmentArea: sql<DepartmentArea>`${departments.area}`.as(
        "pc_department_area",
      ),
    })
    .from(courseClasses)
    .innerJoin(courses, eq(courses.id, courseClasses.courseId))
    .innerJoin(departments, eq(departments.id, courses.departmentId))
    .where(classIds ? inArray(courseClasses.classId, classIds) : undefined)
    .orderBy(asc(courseClasses.classId), asc(courseClasses.position))
    .as("primary_course")
}
