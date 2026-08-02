import { and, asc, desc, eq, ne, sql } from "drizzle-orm"

import { getDb } from "@/db"
import type { DbOrTx } from "@/db"
import {
  classes,
  courses,
  departmentLocations,
  departments,
  questions,
  sections,
} from "@/db/schema"
import { EXAM_SIMULATION_SECTION } from "@/lib/catalog/constants"
import { primaryCourseByClass } from "@/lib/catalog/db/course-classes"

import { locationColumns } from "../columns"
import { CAMPUS_LOCATION_CONFIG, COURSE_TYPE_CONFIG } from "../constants"
import type { BrowseOverview, CampusLocation, PlatformStats } from "../types"

const TOP_CONTRIBUTED_CLASSES = 5

async function countCatalogEntities(db: DbOrTx): Promise<PlatformStats> {
  const [row] = await db
    .select({
      departments: sql<number>`(select count(*) from ${departments})`.mapWith(
        Number,
      ),
      courses: sql<number>`(select count(*) from ${courses})`.mapWith(Number),
      classes: sql<number>`(select count(*) from ${classes})`.mapWith(Number),
      sections: sql<number>`(select count(*) from ${sections})`.mapWith(Number),
      questions: sql<number>`(select count(*) from ${questions})`.mapWith(
        Number,
      ),
    })
    .from(sql`(select 1) as one`)

  return row
}

// Leaderboard of the best covered classes. The exam-simulation sentinel is
// excluded: it holds no questions and would inflate every class by one section.
function listTopContributedClasses(db: DbOrTx, limit: number) {
  const primaryCourse = primaryCourseByClass(db)

  return db
    .select({
      id: classes.id,
      name: classes.name,
      classCode: primaryCourse.classCode,
      courseCode: primaryCourse.courseCode,
      deptCode: primaryCourse.departmentCode,
      deptArea: primaryCourse.departmentArea,
      sectionCount: sql<number>`count(distinct ${sections.id})`.mapWith(Number),
      questionCount: sql<number>`count(${questions.id})`.mapWith(Number),
    })
    .from(classes)
    .innerJoin(primaryCourse, eq(primaryCourse.classId, classes.id))
    .innerJoin(
      sections,
      and(
        eq(sections.classId, classes.id),
        ne(sections.name, EXAM_SIMULATION_SECTION),
      ),
    )
    .leftJoin(questions, eq(questions.sectionId, sections.id))
    .groupBy(
      classes.id,
      primaryCourse.classCode,
      primaryCourse.courseCode,
      primaryCourse.departmentCode,
      primaryCourse.departmentArea,
    )
    .orderBy(
      desc(sql`count(distinct ${sections.id})`),
      desc(sql`count(${questions.id})`),
    )
    .limit(limit)
}

export async function getPlatformStats(): Promise<PlatformStats> {
  return countCatalogEntities(getDb())
}

export async function getBrowseOverview(): Promise<BrowseOverview> {
  const db = getDb()

  const [
    stats,
    coursesByDepartment,
    coursesByType,
    coursesByCampus,
    locations,
    topClasses,
    questionSplit,
  ] = await Promise.all([
    countCatalogEntities(db),
    db
      .select({
        name: departments.name,
        code: departments.code,
        count: sql<number>`count(${courses.id})`.mapWith(Number),
      })
      .from(departments)
      .leftJoin(courses, eq(courses.departmentId, departments.id))
      .groupBy(departments.id)
      .orderBy(asc(departments.position)),
    db
      .select({
        type: courses.courseType,
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(courses)
      .groupBy(courses.courseType),
    db
      .select({
        campus: courses.location,
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(courses)
      .where(sql`${courses.location} is not null`)
      .groupBy(courses.location),
    db
      .select({
        ...locationColumns,
        departmentCode: departments.code,
        departmentName: departments.name,
      })
      .from(departmentLocations)
      .innerJoin(
        departments,
        eq(departments.id, departmentLocations.departmentId),
      )
      .orderBy(asc(departmentLocations.position)),
    listTopContributedClasses(db, TOP_CONTRIBUTED_CLASSES),
    db
      .select({
        quiz: sql<number>`count(*) filter (where ${questions.questionType} in ('MULTIPLE_CHOICE', 'TRUE_FALSE'))`.mapWith(
          Number,
        ),
        flashcard: sql<number>`count(*) filter (where ${questions.questionType} = 'SHORT_ANSWER')`.mapWith(
          Number,
        ),
      })
      .from(questions)
      .then((rows) => rows[0]),
  ])

  return {
    stats,
    coursesByDepartment: coursesByDepartment
      .filter((row) => row.count > 0)
      .sort((a, b) => b.count - a.count),
    coursesByType: coursesByType.map((row) => ({
      type: row.type,
      label: COURSE_TYPE_CONFIG[row.type]?.label ?? row.type,
      count: row.count,
    })),
    coursesByCampus: coursesByCampus.map((row) => {
      const campus = row.campus as CampusLocation
      return {
        campus,
        label: CAMPUS_LOCATION_CONFIG[campus]?.label ?? campus,
        count: row.count,
      }
    }),
    locations: locations.map(({ departmentCode, departmentName, ...location }) => ({
      ...location,
      department: { code: departmentCode, name: departmentName },
    })),
    topContributedClasses: topClasses.map((row) => ({
      id: row.id,
      name: row.name,
      deptCode: row.deptCode,
      courseCode: row.courseCode,
      classCode: row.classCode,
      sectionCount: row.sectionCount,
      questionCount: row.questionCount,
      deptArea: row.deptArea,
    })),
    questionsByType: [
      { type: "QUIZ", label: "Quiz", count: questionSplit.quiz },
      { type: "FLASHCARD", label: "Flashcard", count: questionSplit.flashcard },
    ].filter((entry) => entry.count > 0),
  }
}
