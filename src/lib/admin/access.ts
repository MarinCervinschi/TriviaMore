import { redirect } from "@tanstack/react-router"
import { and, eq, exists, sql } from "drizzle-orm"

import type { DbOrTx } from "@/db"
import { getDb } from "@/db"
import { courseClasses, courseMaintainers, questions, sections } from "@/db/schema"
import { requireAdmin } from "@/lib/auth/guards"
import type { AuthUser } from "@/lib/auth/types"
import { Forbidden, NotFound } from "@/lib/server/errors"

// ─── Content authorization ───
//
// Role model for the admin catalog:
//   • Departments + courses + classes (the structural catalog) are managed by
//     ADMIN and SUPERADMIN. Maintainers are content-only and are rejected for
//     these, and are redirected away from the corresponding admin pages.
//   • Sections + questions are managed by ADMIN, SUPERADMIN and MAINTAINER.
//     For a MAINTAINER, access is scoped: the owning class must belong to at
//     least one course they maintain (a class can be shared across courses).
//
// ADMIN/SUPERADMIN remain unscoped. Nothing here runs under RLS, so every rule
// the database used to enforce is spelled out.

// ─── Scope predicates ───
//
// `db` first so the same predicate runs inside a transaction — which is what the
// differential test against the pre-Drizzle implementation needs.

export async function maintainedCourseIds(
  db: DbOrTx,
  userId: string,
): Promise<Set<string>> {
  const rows = await db
    .select({ courseId: courseMaintainers.courseId })
    .from(courseMaintainers)
    .where(eq(courseMaintainers.userId, userId))
  return new Set(rows.map((row) => row.courseId))
}

async function maintainsCourse(
  db: DbOrTx,
  userId: string,
  courseId: string,
): Promise<boolean> {
  const [row] = await db
    .select({ courseId: courseMaintainers.courseId })
    .from(courseMaintainers)
    .where(
      and(
        eq(courseMaintainers.userId, userId),
        eq(courseMaintainers.courseId, courseId),
      ),
    )
    .limit(1)
  return row !== undefined
}

// A class can be taught in several courses; maintaining any one of them is
// enough to grant authority over the class.
export async function classInMaintainedScope(
  db: DbOrTx,
  userId: string,
  classId: string,
): Promise<boolean> {
  const [row] = await db
    .select({ courseId: courseClasses.courseId })
    .from(courseClasses)
    .innerJoin(
      courseMaintainers,
      and(
        eq(courseMaintainers.courseId, courseClasses.courseId),
        eq(courseMaintainers.userId, userId),
      ),
    )
    .where(eq(courseClasses.classId, classId))
    .limit(1)
  return row !== undefined
}

type SectionScope = { isPublic: boolean; inScope: boolean }

export async function sectionScope(
  db: DbOrTx,
  userId: string,
  sectionId: string,
): Promise<SectionScope | null> {
  const [row] = await db
    .select({
      isPublic: sections.isPublic,
      // Correlated on `sections.class_id`. Written with the query builder rather
      // than a `sql` template because a template renders column references
      // unqualified, and `class_id` exists on both sides of the join.
      inScope: sql<boolean>`${exists(
        db
          .select({ one: sql`1` })
          .from(courseClasses)
          .innerJoin(
            courseMaintainers,
            and(
              eq(courseMaintainers.courseId, courseClasses.courseId),
              eq(courseMaintainers.userId, userId),
            ),
          )
          .where(eq(courseClasses.classId, sections.classId)),
      )}`,
    })
    .from(sections)
    .where(eq(sections.id, sectionId))
    .limit(1)
  return row ?? null
}

// ─── Write guards ───

// Structural catalog (departments + courses + classes) — ADMIN+ only.
export async function requireStructureManager(): Promise<AuthUser> {
  const user = await requireAdmin()
  if (user.role === "MAINTAINER") {
    throw new Forbidden(
      "I maintainer non possono modificare la struttura del catalogo.",
    )
  }
  return user
}

// No-op for ADMIN/SUPERADMIN; for a MAINTAINER, requires that the class belongs
// to at least one course they maintain.
async function assertClassScope(user: AuthUser, classId: string): Promise<void> {
  if (user.role !== "MAINTAINER") return
  if (!(await classInMaintainedScope(getDb(), user.id, classId))) {
    throw new Forbidden(
      "Non hai i permessi per gestire i contenuti di questo insegnamento.",
    )
  }
}

// Exposed for bulk operations that span multiple sections.
export async function assertSectionScope(
  user: AuthUser,
  sectionId: string,
): Promise<void> {
  if (user.role !== "MAINTAINER") return

  const scope = await sectionScope(getDb(), user.id, sectionId)
  if (!scope) throw new NotFound("Sezione non trovata")
  // Private sections are access-controlled (superadmin domain); off-limits to
  // maintainers.
  if (!scope.isPublic) throw new Forbidden("Non puoi gestire sezioni private.")
  if (!scope.inScope) {
    throw new Forbidden(
      "Non hai i permessi per gestire i contenuti di questo insegnamento.",
    )
  }
}

export async function requireContentManagerForClass(
  classId: string,
): Promise<AuthUser> {
  const user = await requireAdmin()
  await assertClassScope(user, classId)
  return user
}

export async function requireContentManagerForSection(
  sectionId: string,
): Promise<AuthUser> {
  const user = await requireAdmin()
  await assertSectionScope(user, sectionId)
  return user
}

export async function requireContentManagerForQuestion(
  questionId: string,
): Promise<AuthUser> {
  const user = await requireAdmin()
  if (user.role !== "MAINTAINER") return user

  const [question] = await getDb()
    .select({ sectionId: questions.sectionId })
    .from(questions)
    .where(eq(questions.id, questionId))
    .limit(1)
  if (!question) throw new NotFound("Domanda non trovata")

  await assertSectionScope(user, question.sectionId)
  return user
}

// ─── Read-access guards for admin detail pages ───
//
// A MAINTAINER who opens a page outside the courses they maintain is redirected
// back to the dashboard; departments are off-limits to maintainers entirely.

export async function requireDepartmentAccess(): Promise<AuthUser> {
  const user = await requireAdmin()
  if (user.role === "MAINTAINER") throw redirect({ to: "/admin" })
  return user
}

export async function requireCourseAccess(courseId: string): Promise<AuthUser> {
  const user = await requireAdmin()
  if (
    user.role === "MAINTAINER" &&
    !(await maintainsCourse(getDb(), user.id, courseId))
  ) {
    throw redirect({ to: "/admin" })
  }
  return user
}

export async function requireClassAccess(classId: string): Promise<AuthUser> {
  const user = await requireAdmin()
  if (
    user.role === "MAINTAINER" &&
    !(await classInMaintainedScope(getDb(), user.id, classId))
  ) {
    throw redirect({ to: "/admin" })
  }
  return user
}

export async function requireSectionAccess(
  sectionId: string,
): Promise<AuthUser> {
  const user = await requireAdmin()
  if (user.role !== "MAINTAINER") return user

  const scope = await sectionScope(getDb(), user.id, sectionId)
  if (!scope?.isPublic || !scope.inScope) throw redirect({ to: "/admin" })
  return user
}

export async function requireQuestionAccess(
  questionId: string,
): Promise<AuthUser> {
  const user = await requireAdmin()
  if (user.role !== "MAINTAINER") return user

  const db = getDb()
  const [question] = await db
    .select({ sectionId: questions.sectionId })
    .from(questions)
    .where(eq(questions.id, questionId))
    .limit(1)
  if (!question) throw redirect({ to: "/admin" })

  const scope = await sectionScope(db, user.id, question.sectionId)
  if (!scope?.isPublic || !scope.inScope) throw redirect({ to: "/admin" })
  return user
}
