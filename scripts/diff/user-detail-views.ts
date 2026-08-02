// Differential check for #113: the four `*_detail` views the user dashboard
// used to read, against the Drizzle joins that replaced them.
//
// The views are still in the database (#89 drops them), so each one is its own
// reference implementation — no transcription needed. Every user with rows is
// compared field by field.
//
//   pnpm diff:user-views
//
// Throwaway: delete it with the views.

import { sql } from "drizzle-orm"

import { closeDb, getDb } from "../../src/db/index.ts"
import { getUserBookmarks } from "../../src/lib/user/service/bookmarks.ts"
import { getRecentClasses, getUserClasses } from "../../src/lib/user/service/classes.ts"
import { getUserProgress } from "../../src/lib/user/service/progress.ts"

type Row = Record<string, unknown>

const problems: string[] = []
let compared = 0

function normalise(value: unknown): string {
  if (value === null || value === undefined) return "∅"
  if (Array.isArray(value)) return JSON.stringify(value)
  return String(value)
}

// The view keys are snake_case, the Drizzle rows camelCase; the pairs are spelled
// out so a silently dropped column cannot pass unnoticed.
function compare(
  label: string,
  viewRows: Row[],
  drizzleRows: Row[],
  key: [view: string, drizzle: string],
  fields: [view: string, drizzle: string][],
) {
  compared++

  if (viewRows.length !== drizzleRows.length) {
    problems.push(
      `${label}: ${viewRows.length} rows from the view, ${drizzleRows.length} from Drizzle`,
    )
    return
  }

  const byKey = new Map(drizzleRows.map((row) => [normalise(row[key[1]]), row]))

  for (const viewRow of viewRows) {
    const id = normalise(viewRow[key[0]])
    const drizzleRow = byKey.get(id)
    if (!drizzleRow) {
      problems.push(`${label}: ${id} missing from the Drizzle result`)
      continue
    }
    for (const [viewField, drizzleField] of fields) {
      const expected = normalise(viewRow[viewField])
      const actual = normalise(drizzleRow[drizzleField])
      if (expected !== actual) {
        problems.push(
          `${label} ${id}: ${viewField} = ${expected} (view) vs ${actual} (drizzle)`,
        )
      }
    }
  }

  // Ordering is part of the contract: every list is rendered as-is.
  const viewOrder = viewRows.map((row) => normalise(row[key[0]])).join(",")
  const drizzleOrder = drizzleRows.map((row) => normalise(row[key[1]])).join(",")
  if (viewOrder !== drizzleOrder) {
    problems.push(`${label}: order differs`)
  }
}

const CLASS_FIELDS: [string, string][] = [
  ["class_name", "className"],
  ["class_code", "classCode"],
  ["class_year", "classYear"],
  ["mandatory", "mandatory"],
  ["catalogue_url", "catalogueUrl"],
  ["curriculum", "curriculum"],
  ["course_id", "courseId"],
  ["course_name", "courseName"],
  ["course_code", "courseCode"],
  ["course_type", "courseType"],
  ["department_id", "departmentId"],
  ["department_name", "departmentName"],
  ["department_code", "departmentCode"],
]

const LOCATION_FIELDS: [string, string][] = [
  ["section_id", "sectionId"],
  ["section_name", "sectionName"],
  ["class_id", "classId"],
  ["class_name", "className"],
  ["course_id", "courseId"],
  ["course_name", "courseName"],
  ["department_id", "departmentId"],
  ["department_name", "departmentName"],
]

const db = getDb()

const { rows: users } = await db.execute<{ id: string }>(sql`
  select distinct user_id as id from (
    select user_id from user_classes
    union all select user_id from user_recent_classes
    union all select user_id from bookmarks
    union all select user_id from progress
  ) owners
`)

console.log(`${users.length} users with data`)

for (const user of users) {
  const [classesView, recentView, bookmarksView, progressView] =
    await Promise.all([
      db.execute<Row>(
        sql`select * from user_classes_detail where user_id = ${user.id} order by created_at desc`,
      ),
      db.execute<Row>(
        sql`select * from user_recent_classes_detail where user_id = ${user.id} order by last_visited desc limit 6`,
      ),
      db.execute<Row>(
        sql`select * from bookmarks_detail where user_id = ${user.id} order by created_at desc`,
      ),
      db.execute<Row>(
        sql`select * from progress_detail where user_id = ${user.id} order by last_accessed_at desc`,
      ),
    ])

  const [classesNew, recentNew, bookmarksNew, progressNew] = await Promise.all([
    getUserClasses(user.id),
    getRecentClasses(db, user.id),
    getUserBookmarks(user.id),
    getUserProgress(user.id),
  ])

  compare(
    `user_classes_detail ${user.id}`,
    classesView.rows,
    classesNew as unknown as Row[],
    ["class_id", "classId"],
    [...CLASS_FIELDS, ["created_at", "createdAt"]],
  )
  compare(
    `user_recent_classes_detail ${user.id}`,
    recentView.rows,
    recentNew as unknown as Row[],
    ["class_id", "classId"],
    [
      ...CLASS_FIELDS,
      ["last_visited", "lastVisited"],
      ["visit_count", "visitCount"],
    ],
  )
  compare(
    `bookmarks_detail ${user.id}`,
    bookmarksView.rows,
    bookmarksNew as unknown as Row[],
    ["question_id", "questionId"],
    [
      ...LOCATION_FIELDS,
      ["created_at", "createdAt"],
      ["content", "content"],
      ["question_type", "questionType"],
      ["options", "options"],
      ["correct_answer", "correctAnswer"],
      ["explanation", "explanation"],
      ["difficulty", "difficulty"],
    ],
  )
  compare(
    `progress_detail ${user.id}`,
    progressView.rows,
    progressNew as unknown as Row[],
    ["id", "id"],
    [
      ...LOCATION_FIELDS,
      ["quiz_mode", "quizMode"],
      ["quizzes_taken", "quizzesTaken"],
      ["average_score", "averageScore"],
      ["best_score", "bestScore"],
      ["total_time_spent", "totalTimeSpent"],
      ["last_accessed_at", "lastAccessedAt"],
    ],
  )
}

await closeDb()

console.log(`${compared} list comparisons`)
if (problems.length === 0) {
  console.log("✔ no differences")
} else {
  console.error(`✘ ${problems.length} differences`)
  for (const problem of problems.slice(0, 30)) console.error(`  ${problem}`)
  if (problems.length > 30) console.error(`  … ${problems.length - 30} more`)
  process.exitCode = 1
}
