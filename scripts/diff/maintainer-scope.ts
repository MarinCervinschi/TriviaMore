// Differential check for #113: the MAINTAINER content scope.
//
// `access.ts` decides who may edit what. Every other admin guard delegates to
// it, and a divergence here is either a maintainer locked out of their own
// course or — worse, and silent — a maintainer let into someone else's.
//
// #91 collapses the old three-step chain (read course_classes, read
// course_maintainers, intersect in JS) into a single join, and the section
// lookup into one query with a correlated `exists`.
//
// Two passes, as with diff:notifications:
//
//  1. **live data, real old client.** The pre-#91 algorithm on supabase-js
//     against the catalog as it stands. `course_maintainers` is empty in this
//     database, so on its own every answer is `false` on both sides and the
//     comparison proves nothing — it runs anyway, to catch a crash or a schema
//     drift on the PostgREST path.
//  2. **seeded, inside a rolled-back transaction.** Grants are inserted so both
//     the in-scope and out-of-scope branches fire. PostgREST cannot see
//     uncommitted rows, so the reference here is the old algorithm transcribed
//     onto Drizzle: same three steps, same intersection.
//
//   pnpm diff:maintainer-scope
//
// Throwaway: delete it once #91 is verified.

import { eq, inArray, or, sql } from "drizzle-orm"
import { TransactionRollbackError } from "drizzle-orm/errors"

import type { DbOrTx } from "../../src/db/index.ts"
import { closeDb, getDb } from "../../src/db/index.ts"
import {
  courseClasses,
  courseMaintainers,
  profiles,
  sections,
} from "../../src/db/schema/index.ts"
import {
  classInMaintainedScope,
  sectionScope,
} from "../../src/lib/admin/access.ts"
import { catalogRest } from "./postgrest.ts"

// ── Reference implementation #1: the old code, on supabase-js ──

async function oldMaintainedCourseIds(userId: string): Promise<Set<string>> {
  const { data } = await catalogRest()
    .from("course_maintainers")
    .select("course_id")
    .eq("user_id", userId)
  return new Set((data ?? []).map((r) => r.course_id))
}

async function oldClassInScopeViaPostgrest(
  userId: string,
  classId: string,
): Promise<boolean> {
  const [{ data: links }, maintained] = await Promise.all([
    catalogRest()
      .from("course_classes")
      .select("course_id")
      .eq("class_id", classId),
    oldMaintainedCourseIds(userId),
  ])
  return (links ?? []).some((l) => maintained.has(l.course_id))
}

// The old read guard: a section is reachable only if it is public *and* its
// class is in scope. A missing section answers `false`.
async function oldSectionInScopeViaPostgrest(
  userId: string,
  sectionId: string,
): Promise<boolean> {
  const { data } = await catalogRest()
    .from("sections")
    .select("class_id, is_public")
    .eq("id", sectionId)
    .single()
  if (!data || !data.is_public) return false
  return oldClassInScopeViaPostgrest(userId, data.class_id)
}

// ── Reference implementation #2: the same algorithm, transcribed onto a tx ──

async function oldClassInScopeOnTx(
  tx: DbOrTx,
  userId: string,
  classId: string,
): Promise<boolean> {
  const [links, maintained] = await Promise.all([
    tx
      .select({ courseId: courseClasses.courseId })
      .from(courseClasses)
      .where(eq(courseClasses.classId, classId)),
    tx
      .select({ courseId: courseMaintainers.courseId })
      .from(courseMaintainers)
      .where(eq(courseMaintainers.userId, userId)),
  ])
  const maintainedIds = new Set(maintained.map((row) => row.courseId))
  return links.some((link) => maintainedIds.has(link.courseId))
}

async function oldSectionInScopeOnTx(
  tx: DbOrTx,
  userId: string,
  sectionId: string,
): Promise<boolean> {
  const [section] = await tx
    .select({ classId: sections.classId, isPublic: sections.isPublic })
    .from(sections)
    .where(eq(sections.id, sectionId))
    .limit(1)
  if (!section || !section.isPublic) return false
  return oldClassInScopeOnTx(tx, userId, section.classId)
}

// The new read guard, expressed as the boolean the old one returned.
function newSectionInScope(scope: { isPublic: boolean; inScope: boolean } | null) {
  return scope !== null && scope.isPublic && scope.inScope
}

const problems: string[] = []
let comparisons = 0

function compare(label: string, before: boolean, after: boolean) {
  comparisons++
  if (before !== after) {
    problems.push(`${label}: was ${before}, now ${after}`)
  }
}

const db = getDb()

const people = await db.select({ id: profiles.id }).from(profiles).limit(4)
if (people.length < 2) {
  console.error("not enough profiles to compare against")
  await closeDb()
  process.exit(1)
}

const { rows: classIds } = await db.execute<{ id: string }>(sql`
  (select cl.id from catalog.classes cl
     join catalog.course_classes cc on cc.class_id = cl.id
    group by cl.id having count(*) > 1 limit 20)
  union all
  (select cl.id from catalog.classes cl limit 40)
`)

const { rows: sectionIds } = await db.execute<{ id: string }>(sql`
  (select s.id from catalog.sections s where s.is_public limit 30)
  union all
  (select s.id from catalog.sections s where not s.is_public limit 30)
`)

// Pass 1 — live data, old client.
for (const person of people) {
  for (const { id: classId } of classIds) {
    compare(
      `live class ${classId} / ${person.id}`,
      await oldClassInScopeViaPostgrest(person.id, classId),
      await classInMaintainedScope(db, person.id, classId),
    )
  }
  for (const { id: sectionId } of sectionIds) {
    compare(
      `live section ${sectionId} / ${person.id}`,
      await oldSectionInScopeViaPostgrest(person.id, sectionId),
      newSectionInScope(await sectionScope(db, person.id, sectionId)),
    )
  }
}
console.log(`pass 1 — ${comparisons} comparisons on live data`)

// Pass 2 — seeded grants, rolled back.
let seededComparisons = 0
let inScopeHits = 0
try {
  await db.transaction(async (tx) => {
    // The grants have to land on the courses that actually own the sampled
    // classes and sections, or every comparison answers `false` and the pass is
    // vacuous. Half of them are granted, so both branches fire.
    const courseRows = await tx
      .selectDistinct({ id: courseClasses.courseId })
      .from(courseClasses)
      .leftJoin(sections, eq(sections.classId, courseClasses.classId))
      .where(
        or(
          inArray(
            courseClasses.classId,
            classIds.map((row) => row.id),
          ),
          inArray(
            sections.id,
            sectionIds.map((row) => row.id),
          ),
        ),
      )
    if (courseRows.length === 0) throw new Error("no owning courses to seed")

    for (const [index, course] of courseRows.entries()) {
      if (index % 2 === 0) {
        await tx
          .insert(courseMaintainers)
          .values({
            courseId: course.id,
            userId: people[index % people.length].id,
          })
          .onConflictDoNothing()
      }
    }

    const before = comparisons
    for (const person of people) {
      for (const { id: classId } of classIds) {
        const expected = await oldClassInScopeOnTx(tx, person.id, classId)
        if (expected) inScopeHits++
        compare(
          `seeded class ${classId} / ${person.id}`,
          expected,
          await classInMaintainedScope(tx, person.id, classId),
        )
      }
      for (const { id: sectionId } of sectionIds) {
        const expected = await oldSectionInScopeOnTx(tx, person.id, sectionId)
        if (expected) inScopeHits++
        compare(
          `seeded section ${sectionId} / ${person.id}`,
          expected,
          newSectionInScope(await sectionScope(tx, person.id, sectionId)),
        )
      }
    }
    seededComparisons = comparisons - before

    console.log(
      `pass 2 — ${seededComparisons} comparisons with grants seeded, ${inScopeHits} of them in scope`,
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

if (inScopeHits === 0) {
  console.error("✘ pass 2 never hit an in-scope case — the seeding did not take")
  process.exitCode = 1
} else if (problems.length === 0) {
  console.log(`✔ ${comparisons} scope decisions identical`)
} else {
  console.error(`✘ ${problems.length} divergences`)
  for (const problem of problems.slice(0, 20)) console.error(`  ${problem}`)
  process.exitCode = 1
}
