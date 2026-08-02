// Differential check for #113: the recipient set of notifyAdminsInScope.
//
// #91 collapses a chain of up to six sequential PostgREST lookups into two
// queries. A silent divergence means notifications quietly stop reaching
// someone, which nothing else in the app would surface.
//
// Two passes, because neither alone is enough:
//
//  1. **live data, real old client.** The pre-#91 algorithm on supabase-js
//     against the catalog as it stands. Faithful, but `course_maintainers` and
//     `department_admins` are empty, so on their own these targets only ever
//     resolve to the superadmins — the two branches that matter stay untested.
//  2. **seeded, inside a rolled-back transaction.** Grants are inserted for
//     real profiles so the maintainer and department-admin branches fire. Both
//     sides must run on the transaction handle to see uncommitted rows, so here
//     the reference is the old algorithm transcribed onto Drizzle: same
//     sequence, same unordered `limit 1`.
//
//   pnpm diff:notifications
//
// Throwaway: delete it once #91 is verified.

import { eq, sql } from "drizzle-orm"
import { TransactionRollbackError } from "drizzle-orm/errors"

import type { DbOrTx } from "../../src/db/index.ts"
import { closeDb, getDb } from "../../src/db/index.ts"
import {
  courseClasses,
  courseMaintainers,
  courses,
  departmentAdmins,
  profiles,
  sections,
} from "../../src/db/schema/index.ts"
import {
  findNotificationRecipients,
  findNotificationScope,
} from "../../src/lib/notifications/db/recipients.ts"
import type { NotificationTarget } from "../../src/lib/notifications/db/recipients.ts"
import { catalogRest, publicRest } from "./postgrest.ts"

type Target = {
  label: string
  target_department_id: string | null
  target_course_id: string | null
  target_class_id: string | null
  target_section_id: string | null
}

function toNotificationTarget(target: Target): NotificationTarget {
  return {
    departmentId: target.target_department_id,
    courseId: target.target_course_id,
    classId: target.target_class_id,
    sectionId: target.target_section_id,
  }
}

// ── Reference implementation #1: the old code, on supabase-js ──

async function oldRecipientsViaPostgrest(target: Target): Promise<string[]> {
  const supabaseAdmin = publicRest()
  const adminUserIds = new Set<string>()

  const { data: superadmins } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("role", "SUPERADMIN")
  for (const sa of superadmins ?? []) adminUserIds.add(sa.id)

  let departmentId = target.target_department_id
  let courseId = target.target_course_id

  if (target.target_section_id) {
    const { data: section } = await catalogRest()
      .from("sections")
      .select("class_id")
      .eq("id", target.target_section_id)
      .single()
    if (section) {
      const { data: cc } = await catalogRest()
        .from("course_classes")
        .select("course_id")
        .eq("class_id", section.class_id)
        .limit(1)
        .single()
      if (cc) courseId = cc.course_id
    }
  }

  if (target.target_class_id && !courseId) {
    const { data: cc } = await catalogRest()
      .from("course_classes")
      .select("course_id")
      .eq("class_id", target.target_class_id)
      .limit(1)
      .single()
    if (cc) courseId = cc.course_id
  }

  if (courseId) {
    const { data: maintainers } = await catalogRest()
      .from("course_maintainers")
      .select("user_id")
      .eq("course_id", courseId)
    for (const m of maintainers ?? []) adminUserIds.add(m.user_id)

    if (!departmentId) {
      const { data: course } = await catalogRest()
        .from("courses")
        .select("department_id")
        .eq("id", courseId)
        .single()
      if (course) departmentId = course.department_id
    }
  }

  if (departmentId) {
    const { data: deptAdmins } = await catalogRest()
      .from("department_admins")
      .select("user_id")
      .eq("department_id", departmentId)
    for (const da of deptAdmins ?? []) adminUserIds.add(da.user_id)
  }

  return [...adminUserIds]
}

// ── Reference implementation #2: the same algorithm, transcribed onto a tx ──

async function oldRecipientsOnTx(
  tx: DbOrTx,
  target: Target,
): Promise<string[]> {
  const adminUserIds = new Set<string>()

  const superadmins = await tx
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.role, "SUPERADMIN"))
  for (const sa of superadmins) adminUserIds.add(sa.id)

  let departmentId = target.target_department_id
  let courseId = target.target_course_id

  if (target.target_section_id) {
    const [section] = await tx
      .select({ classId: sections.classId })
      .from(sections)
      .where(eq(sections.id, target.target_section_id))
      .limit(1)
    if (section) {
      const [cc] = await tx
        .select({ courseId: courseClasses.courseId })
        .from(courseClasses)
        .where(eq(courseClasses.classId, section.classId))
        .limit(1)
      if (cc) courseId = cc.courseId
    }
  }

  if (target.target_class_id && !courseId) {
    const [cc] = await tx
      .select({ courseId: courseClasses.courseId })
      .from(courseClasses)
      .where(eq(courseClasses.classId, target.target_class_id))
      .limit(1)
    if (cc) courseId = cc.courseId
  }

  if (courseId) {
    const maintainers = await tx
      .select({ userId: courseMaintainers.userId })
      .from(courseMaintainers)
      .where(eq(courseMaintainers.courseId, courseId))
    for (const m of maintainers) adminUserIds.add(m.userId)

    if (!departmentId) {
      const [course] = await tx
        .select({ departmentId: courses.departmentId })
        .from(courses)
        .where(eq(courses.id, courseId))
        .limit(1)
      if (course) departmentId = course.departmentId
    }
  }

  if (departmentId) {
    const deptAdmins = await tx
      .select({ userId: departmentAdmins.userId })
      .from(departmentAdmins)
      .where(eq(departmentAdmins.departmentId, departmentId))
    for (const da of deptAdmins) adminUserIds.add(da.userId)
  }

  return [...adminUserIds]
}

// A recipient the old code notified and the new one does not is a regression.
// The reverse is expected: the new scope covers every course a class is taught
// in, where the old one took an unordered `limit 1`. Widenings are counted, not
// failed.
let widened = 0

function diff(label: string, before: string[], after: string[]): string | null {
  const afterSet = new Set(after)
  const missing = before.filter((id) => !afterSet.has(id))
  if (after.length > before.length) widened++
  if (missing.length === 0) return null
  return `${label}: no longer notified: ${missing.join(", ")}`
}

function describe(target: Target) {
  const id =
    target.target_section_id ??
    target.target_class_id ??
    target.target_course_id ??
    target.target_department_id
  return `${target.label} ${id}`
}

const db = getDb()

// createRequestFn walks up from the section with an unordered limit(1), so the
// synthetic targets reproduce that shape rather than a tidier one.
const { rows: targets } = await db.execute<Target>(sql`
  with walked as (
    select s.id as section_id,
           s.class_id,
           (select cc.course_id from catalog.course_classes cc
             where cc.class_id = s.class_id limit 1) as course_id
      from catalog.sections s
  )
  (select 'section' as label, co.department_id as target_department_id,
          w.course_id as target_course_id, w.class_id as target_class_id,
          w.section_id as target_section_id
     from walked w
     left join catalog.courses co on co.id = w.course_id
    order by w.section_id
    limit 60)
  union all
  (select 'class', null, null, cl.id, null
     from catalog.classes cl
     join catalog.course_classes cc on cc.class_id = cl.id
    group by cl.id
   having count(*) > 1
    limit 60)
  union all
  (select 'course', co.department_id, co.id, null, null
     from catalog.courses co
    limit 30)
  union all
  (select 'department', d.id, null, null, null
     from catalog.departments d)
`)

const problems: string[] = []

// Pass 1 — live data, old client.
for (const target of targets) {
  const [before, after] = await Promise.all([
    oldRecipientsViaPostgrest(target),
    (async () => {
      const scope = await findNotificationScope(db, toNotificationTarget(target))
      return findNotificationRecipients(db, scope)
    })(),
  ])
  const problem = diff(`live ${describe(target)}`, before, after)
  if (problem) problems.push(problem)
}
console.log(`pass 1 — ${targets.length} targets on live data`)

// Pass 2 — seeded grants, rolled back.
let seededComparisons = 0
try {
  await db.transaction(async (tx) => {
    const people = await tx.select({ id: profiles.id }).from(profiles).limit(6)
    if (people.length < 3) throw new Error("not enough profiles to seed grants")

    const courseRows = await tx
      .select({ id: courses.id, departmentId: courses.departmentId })
      .from(courses)
      .limit(10)

    // Every other course gets a maintainer, every other department an admin, so
    // the comparison covers targets with and without each grant.
    for (const [index, course] of courseRows.entries()) {
      if (index % 2 === 0) {
        await tx
          .insert(courseMaintainers)
          .values({ courseId: course.id, userId: people[index % people.length].id })
          .onConflictDoNothing()
      }
      if (index % 3 === 0) {
        await tx
          .insert(departmentAdmins)
          .values({
            departmentId: course.departmentId,
            userId: people[(index + 1) % people.length].id,
          })
          .onConflictDoNothing()
      }
    }

    const seededCourseIds = new Set(courseRows.map((course) => course.id))
    const seededTargets = targets.filter(
      (target) =>
        !target.target_course_id || seededCourseIds.has(target.target_course_id),
    )

    for (const target of seededTargets) {
      const before = await oldRecipientsOnTx(tx, target)
      const scope = await findNotificationScope(tx, toNotificationTarget(target))
      const after = await findNotificationRecipients(tx, scope)
      seededComparisons++

      const problem = diff(`seeded ${describe(target)}`, before, after)
      if (problem) problems.push(problem)
    }

    const withGrants = await tx
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(courseMaintainers)
    console.log(
      `pass 2 — ${seededComparisons} targets with ${withGrants[0].count} maintainer grants seeded`,
    )

    tx.rollback()
  })
} catch (error) {
  if (!(error instanceof TransactionRollbackError)) {
    console.error(error)
    await closeDb()
    process.exit(1)
  }
}

await closeDb()

if (seededComparisons === 0) {
  console.error("✘ pass 2 compared nothing — the seeding did not take")
  process.exitCode = 1
} else if (problems.length === 0) {
  console.log(
    `✔ nobody lost a notification; ${widened} targets now reach more people`,
  )
} else {
  console.error(`✘ ${problems.length} divergences`)
  for (const problem of problems) console.error(`  ${problem}`)
  process.exitCode = 1
}
