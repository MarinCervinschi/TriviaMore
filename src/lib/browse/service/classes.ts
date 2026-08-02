import { and, asc, eq, sql } from "drizzle-orm"
import type { SQL } from "drizzle-orm"

import { getDb } from "@/db"
import {
  classes,
  courseClasses,
  courses,
  departments,
  sections,
} from "@/db/schema"
import { filterAccessibleSections } from "@/lib/auth/checks"
import { EXAM_SIMULATION_SECTION } from "@/lib/catalog/constants"
import { countQuestionsBySection } from "@/lib/catalog/db/questions"
import { findSectionsInClass } from "@/lib/catalog/db/sections"

import type {
  BrowseSection,
  ClassWithSections,
  SearchClassesParams,
  SearchClassesResponse,
} from "../types"
import { paginationOf, resolveClassByCodes, toFtsQuery } from "./shared"

function findExamSimulationSection(classId: string) {
  return getDb()
    .select({ id: sections.id })
    .from(sections)
    .where(
      and(
        eq(sections.classId, classId),
        eq(sections.name, EXAM_SIMULATION_SECTION),
      ),
    )
    .limit(1)
    .then((rows) => rows[0])
}

export async function getClassWithSections(
  userId: string | null,
  codes: { deptCode: string; courseCode: string; classCode: string },
): Promise<ClassWithSections | null> {
  const resolved = await resolveClassByCodes(
    codes.deptCode,
    codes.courseCode,
    codes.classCode,
  )
  if (!resolved) return null

  const db = getDb()
  const { course, department, class: cls, courseClass } = resolved

  const all = await findSectionsInClass(db, cls.id)
  const allowed = await filterAccessibleSections(
    userId,
    all.map((section) => section.id),
  )
  const visible = all.filter((section) => allowed.has(section.id))

  const counts = await countQuestionsBySection(
    db,
    visible.map((section) => section.id),
  )

  const sectionList: BrowseSection[] = visible.map((section) => {
    const count = counts.get(section.id)
    return {
      ...section,
      questionCount: count?.total ?? 0,
      quizQuestionCount: count?.quiz ?? 0,
      flashcardQuestionCount: count?.flashcard ?? 0,
    }
  })

  const totalQuizQuestions = sectionList.reduce(
    (sum, section) => sum + section.quizQuestionCount,
    0,
  )
  const totalFlashcardQuestions = sectionList.reduce(
    (sum, section) => sum + section.flashcardQuestionCount,
    0,
  )

  // Exam mode is only offered when there is something to be examined on.
  let examSimulation: ClassWithSections["examSimulation"]
  if (totalQuizQuestions > 0 || totalFlashcardQuestions > 0) {
    const sentinel = await findExamSimulationSection(cls.id)
    if (sentinel) {
      examSimulation = {
        sectionId: sentinel.id,
        totalQuizQuestions,
        totalFlashcardQuestions,
      }
    }
  }

  return {
    ...cls,
    courseClass,
    course: { ...course, department },
    sections: sectionList,
    examSimulation,
  }
}

export async function searchClasses(
  params: SearchClassesParams,
): Promise<SearchClassesResponse> {
  const filters: SQL[] = []

  const ftsQuery = params.query?.trim() ? toFtsQuery(params.query) : ""
  if (ftsQuery) {
    filters.push(sql`${classes.fts} @@ to_tsquery('italian', ${ftsQuery})`)
  }
  if (params.courseId) filters.push(eq(courseClasses.courseId, params.courseId))
  if (params.departmentId) {
    filters.push(eq(courses.departmentId, params.departmentId))
  }
  if (params.classYear !== undefined) {
    filters.push(eq(courseClasses.classYear, params.classYear))
  }
  if (params.mandatory !== undefined) {
    filters.push(eq(courseClasses.mandatory, params.mandatory))
  }

  const { limit, offset } = paginationOf(params)

  const rows = await getDb()
    .select({
      id: classes.id,
      name: classes.name,
      description: classes.description,
      cfu: classes.cfu,
      code: courseClasses.code,
      classYear: courseClasses.classYear,
      mandatory: courseClasses.mandatory,
      courseId: courses.id,
      courseName: courses.name,
      courseCode: courses.code,
      departmentCode: departments.code,
      departmentName: departments.name,
      sectionCount: sql<number>`count(${sections.id})`.mapWith(Number),
      total: sql<number>`count(*) over()`.mapWith(Number),
    })
    .from(courseClasses)
    .innerJoin(classes, eq(classes.id, courseClasses.classId))
    .innerJoin(courses, eq(courses.id, courseClasses.courseId))
    .innerJoin(departments, eq(departments.id, courses.departmentId))
    .leftJoin(sections, eq(sections.classId, classes.id))
    .where(filters.length > 0 ? and(...filters) : undefined)
    .groupBy(
      courseClasses.courseId,
      courseClasses.classId,
      classes.id,
      courses.id,
      departments.code,
      departments.name,
    )
    .orderBy(asc(courseClasses.classYear), asc(courseClasses.code))
    .limit(limit)
    .offset(offset)

  return {
    data: rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      cfu: row.cfu,
      code: row.code,
      classYear: row.classYear,
      mandatory: row.mandatory,
      course: {
        id: row.courseId,
        name: row.courseName,
        code: row.courseCode,
        department: { code: row.departmentCode, name: row.departmentName },
      },
      sectionCount: row.sectionCount,
    })),
    total: rows[0]?.total ?? 0,
  }
}

export async function getAvailableClassYears(params: {
  departmentId?: string
  courseId?: string
}): Promise<number[]> {
  const filters: SQL[] = []
  if (params.courseId) filters.push(eq(courseClasses.courseId, params.courseId))
  if (params.departmentId) {
    filters.push(eq(courses.departmentId, params.departmentId))
  }

  const rows = await getDb()
    .selectDistinct({ classYear: courseClasses.classYear })
    .from(courseClasses)
    .innerJoin(courses, eq(courses.id, courseClasses.courseId))
    .where(filters.length > 0 ? and(...filters) : undefined)
    .orderBy(asc(courseClasses.classYear))

  return rows.map((row) => row.classYear)
}
