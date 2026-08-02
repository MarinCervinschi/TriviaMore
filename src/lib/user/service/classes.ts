import { and, desc, eq, sql } from "drizzle-orm"
import type { DbOrTx } from "@/db"

import { getDb } from "@/db"
import {
  classes,
  courseClasses,
  courses,
  departments,
  userClasses,
  userRecentClasses,
} from "@/db/schema"
import { Conflict } from "@/lib/server/errors"

import type { RecentClass, UserClass } from "../types"

const RECENT_CLASSES_LIMIT = 6

// The junction row is a LEFT JOIN on purpose: a class can be unlinked from the
// course a user saved it under, and the entry should survive without its code.
const enrolledClassColumns = {
  classId: classes.id,
  className: classes.name,
  classCode: courseClasses.code,
  classYear: courseClasses.classYear,
  mandatory: courseClasses.mandatory,
  catalogueUrl: courseClasses.catalogueUrl,
  curriculum: courseClasses.curriculum,
  courseId: courses.id,
  courseName: courses.name,
  courseCode: courses.code,
  courseType: courses.courseType,
  departmentId: departments.id,
  departmentName: departments.name,
  departmentCode: departments.code,
}

export async function getUserClasses(userId: string): Promise<UserClass[]> {
  return getDb()
    .select({ ...enrolledClassColumns, createdAt: userClasses.createdAt })
    .from(userClasses)
    .innerJoin(classes, eq(classes.id, userClasses.classId))
    .innerJoin(courses, eq(courses.id, userClasses.courseId))
    .innerJoin(departments, eq(departments.id, courses.departmentId))
    .leftJoin(
      courseClasses,
      and(
        eq(courseClasses.classId, classes.id),
        eq(courseClasses.courseId, courses.id),
      ),
    )
    .where(eq(userClasses.userId, userId))
    .orderBy(desc(userClasses.createdAt))
}

export async function getRecentClasses(
  db: DbOrTx,
  userId: string,
): Promise<RecentClass[]> {
  return db
    .select({
      ...enrolledClassColumns,
      lastVisited: userRecentClasses.lastVisited,
      visitCount: userRecentClasses.visitCount,
    })
    .from(userRecentClasses)
    .innerJoin(classes, eq(classes.id, userRecentClasses.classId))
    .innerJoin(courses, eq(courses.id, userRecentClasses.courseId))
    .innerJoin(departments, eq(departments.id, courses.departmentId))
    .leftJoin(
      courseClasses,
      and(
        eq(courseClasses.classId, classes.id),
        eq(courseClasses.courseId, courses.id),
      ),
    )
    .where(eq(userRecentClasses.userId, userId))
    .orderBy(desc(userRecentClasses.lastVisited))
    .limit(RECENT_CLASSES_LIMIT)
}

export async function addUserClass(
  userId: string,
  input: { classId: string; courseId: string },
) {
  const inserted = await getDb()
    .insert(userClasses)
    .values({ userId, classId: input.classId, courseId: input.courseId })
    .onConflictDoNothing()
    .returning({ classId: userClasses.classId })

  if (inserted.length === 0) {
    throw new Conflict("La classe è già nella tua lista")
  }
  return { success: true }
}

export async function removeUserClass(userId: string, classId: string) {
  await getDb()
    .delete(userClasses)
    .where(and(eq(userClasses.userId, userId), eq(userClasses.classId, classId)))
  return { success: true }
}

export async function isClassSaved(
  userId: string | null,
  classId: string,
): Promise<boolean> {
  if (!userId) return false

  const [row] = await getDb()
    .select({ classId: userClasses.classId })
    .from(userClasses)
    .where(and(eq(userClasses.userId, userId), eq(userClasses.classId, classId)))
    .limit(1)

  return row !== undefined
}

// One upsert: the previous select-then-update could lose a visit when a class
// was opened in two tabs at once.
export async function updateRecentClass(
  userId: string,
  input: { classId: string; courseId: string },
) {
  await getDb()
    .insert(userRecentClasses)
    .values({
      userId,
      classId: input.classId,
      courseId: input.courseId,
      visitCount: 1,
    })
    .onConflictDoUpdate({
      target: [userRecentClasses.userId, userRecentClasses.classId],
      set: {
        visitCount: sql`${userRecentClasses.visitCount} + 1`,
        lastVisited: sql`now()`,
        courseId: input.courseId,
      },
    })
}
