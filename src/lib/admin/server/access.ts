import { redirect } from "@tanstack/react-router"

import { requireAdmin } from "@/lib/auth/guards"
import { getCatalogAdmin } from "@/lib/supabase/admin"
import type { AuthUser } from "@/lib/auth/types"

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
// ADMIN/SUPERADMIN remain unscoped (unchanged behavior). All resolution uses
// the service-role catalog client since this is server-side authorization.

// Structural catalog (departments + courses + classes) — ADMIN+ only.
export async function requireStructureManager(): Promise<AuthUser> {
  const user = await requireAdmin()
  if (user.role === "MAINTAINER") {
    throw new Error("I maintainer non possono modificare la struttura del catalogo.")
  }
  return user
}

export async function maintainedCourseIds(userId: string): Promise<Set<string>> {
  const { data } = await getCatalogAdmin()
    .from("course_maintainers")
    .select("course_id")
    .eq("user_id", userId)
  return new Set((data ?? []).map((r) => r.course_id))
}

async function classInMaintainedScope(
  userId: string,
  classId: string,
): Promise<boolean> {
  const [{ data: links }, maintained] = await Promise.all([
    getCatalogAdmin()
      .from("course_classes")
      .select("course_id")
      .eq("class_id", classId),
    maintainedCourseIds(userId),
  ])
  return (links ?? []).some((l) => maintained.has(l.course_id))
}

// No-op for ADMIN/SUPERADMIN; for a MAINTAINER, requires that the class belongs
// to at least one course they maintain.
async function assertClassScope(user: AuthUser, classId: string): Promise<void> {
  if (user.role !== "MAINTAINER") return
  if (!(await classInMaintainedScope(user.id, classId))) {
    throw new Error(
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
  const { data, error } = await getCatalogAdmin()
    .from("sections")
    .select("class_id, is_public")
    .eq("id", sectionId)
    .single()
  if (error || !data) throw new Error("Sezione non trovata")
  // Private sections are access-controlled (superadmin domain); off-limits to
  // maintainers.
  if (!data.is_public) {
    throw new Error("Non puoi gestire sezioni private.")
  }
  await assertClassScope(user, data.class_id)
}

// ─── Content CRUD entry guards (sections + questions) ───

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

  const { data, error } = await getCatalogAdmin()
    .from("questions")
    .select("section_id")
    .eq("id", questionId)
    .single()
  if (error || !data) throw new Error("Domanda non trovata")

  await assertSectionScope(user, data.section_id)
  return user
}

// ─── Read-access guards for admin detail pages ───
//
// A MAINTAINER who opens a page outside the courses they maintain is redirected
// back to the dashboard; departments are off-limits to maintainers entirely.

async function sectionInMaintainedScope(
  userId: string,
  sectionId: string,
): Promise<boolean> {
  const { data } = await getCatalogAdmin()
    .from("sections")
    .select("class_id, is_public")
    .eq("id", sectionId)
    .single()
  if (!data || !data.is_public) return false
  return classInMaintainedScope(userId, data.class_id)
}

export async function requireDepartmentAccess(): Promise<AuthUser> {
  const user = await requireAdmin()
  if (user.role === "MAINTAINER") throw redirect({ to: "/admin" })
  return user
}

export async function requireCourseAccess(courseId: string): Promise<AuthUser> {
  const user = await requireAdmin()
  if (user.role === "MAINTAINER") {
    const maintained = await maintainedCourseIds(user.id)
    if (!maintained.has(courseId)) throw redirect({ to: "/admin" })
  }
  return user
}

export async function requireClassAccess(classId: string): Promise<AuthUser> {
  const user = await requireAdmin()
  if (
    user.role === "MAINTAINER" &&
    !(await classInMaintainedScope(user.id, classId))
  ) {
    throw redirect({ to: "/admin" })
  }
  return user
}

export async function requireSectionAccess(
  sectionId: string,
): Promise<AuthUser> {
  const user = await requireAdmin()
  if (
    user.role === "MAINTAINER" &&
    !(await sectionInMaintainedScope(user.id, sectionId))
  ) {
    throw redirect({ to: "/admin" })
  }
  return user
}

export async function requireQuestionAccess(
  questionId: string,
): Promise<AuthUser> {
  const user = await requireAdmin()
  if (user.role !== "MAINTAINER") return user

  const { data } = await getCatalogAdmin()
    .from("questions")
    .select("section_id")
    .eq("id", questionId)
    .single()
  if (!data || !(await sectionInMaintainedScope(user.id, data.section_id))) {
    throw redirect({ to: "/admin" })
  }
  return user
}
