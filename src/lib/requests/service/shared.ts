import { eq, inArray } from "drizzle-orm"

import type { DbOrTx } from "@/db"
import { getDb } from "@/db"
import {
  classes,
  contentRequests,
  courses,
  departments,
  profiles,
  sections,
} from "@/db/schema"
import { maintainedCourseIds } from "@/lib/admin/access"
import { requireAdmin } from "@/lib/auth/guards"
import type { AuthUser } from "@/lib/auth/types"
import { Forbidden, Invalid, NotFound } from "@/lib/server/errors"

import { storedContentSchema } from "../schemas"
import type { ContentRequest, RequestUser, SubmittedContent } from "../types"

// Maintainers only see requests aimed at a course they maintain; ADMIN and
// SUPERADMIN are unscoped, which `null` stands for.
export async function requireRequestAdmin(): Promise<{
  user: AuthUser
  scopeCourseIds: Set<string> | null
}> {
  const user = await requireAdmin()
  if (user.role !== "MAINTAINER") return { user, scopeCourseIds: null }
  return { user, scopeCourseIds: await maintainedCourseIds(getDb(), user.id) }
}

export function isInScope(
  scopeCourseIds: Set<string> | null,
  targetCourseId: string | null,
): boolean {
  if (!scopeCourseIds) return true
  return !!targetCourseId && scopeCourseIds.has(targetCourseId)
}

export function assertInScope(
  scopeCourseIds: Set<string> | null,
  targetCourseId: string | null,
): void {
  if (!isInScope(scopeCourseIds, targetCourseId)) {
    throw new Forbidden("Non hai i permessi per gestire questa richiesta.")
  }
}

// submitted_content is jsonb, so its shape is only guaranteed at write time;
// every read re-validates it.
export function parseSubmittedContent(raw: unknown): SubmittedContent {
  const result = storedContentSchema.safeParse(raw)
  if (!result.success) throw new Invalid("Contenuto della proposta non valido")
  return result.data as SubmittedContent
}

const REPORT_REASON_LABELS: Record<string, string> = {
  errata: "Errata",
  imprecisa: "Imprecisa",
  fuori_contesto: "Fuori contesto",
  altro: "Altro",
}

export function generateTitle(submitted: SubmittedContent): string {
  if (submitted.type === "section") return `Nuova sezione: ${submitted.name}`
  if (submitted.type === "report") {
    const reason = submitted.reasons[0]
    return `Segnalazione: ${REPORT_REASON_LABELS[reason] ?? reason}`
  }
  if (submitted.type === "file_upload") return `File: ${submitted.file_name}`
  const count = submitted.questions.length
  return `${count} ${count === 1 ? "domanda" : "domande"}`
}

type TargetIds = Pick<
  ContentRequest,
  "targetDepartmentId" | "targetCourseId" | "targetClassId" | "targetSectionId"
>

// Breadcrumb of the target, built from the ids stored on the request rather than
// re-derived from the hierarchy: those ids are also what scoping filters on, so
// the label and the permission check can never disagree.
//
// Resolved for a whole list at once — the previous implementation ran up to four
// queries per request inside a loop.
export async function resolveTargetLabels(
  db: DbOrTx,
  requests: TargetIds[],
): Promise<Map<string, string>> {
  const ids = {
    departments: new Set<string>(),
    courses: new Set<string>(),
    classes: new Set<string>(),
    sections: new Set<string>(),
  }
  for (const request of requests) {
    if (request.targetDepartmentId) ids.departments.add(request.targetDepartmentId)
    if (request.targetCourseId) ids.courses.add(request.targetCourseId)
    if (request.targetClassId) ids.classes.add(request.targetClassId)
    if (request.targetSectionId) ids.sections.add(request.targetSectionId)
  }

  const names = async <T extends { id: unknown; name: unknown }>(
    rows: Promise<T[]>,
  ) =>
    new Map(
      (await rows).map((row) => [String(row.id), String(row.name)] as const),
    )

  const [departmentNames, courseNames, classNames, sectionNames] =
    await Promise.all([
      ids.departments.size
        ? names(
            db
              .select({ id: departments.id, name: departments.name })
              .from(departments)
              .where(inArray(departments.id, [...ids.departments])),
          )
        : new Map<string, string>(),
      ids.courses.size
        ? names(
            db
              .select({ id: courses.id, name: courses.name })
              .from(courses)
              .where(inArray(courses.id, [...ids.courses])),
          )
        : new Map<string, string>(),
      ids.classes.size
        ? names(
            db
              .select({ id: classes.id, name: classes.name })
              .from(classes)
              .where(inArray(classes.id, [...ids.classes])),
          )
        : new Map<string, string>(),
      ids.sections.size
        ? names(
            db
              .select({ id: sections.id, name: sections.name })
              .from(sections)
              .where(inArray(sections.id, [...ids.sections])),
          )
        : new Map<string, string>(),
    ])

  const labels = new Map<string, string>()
  for (const request of requests) {
    const parts = [
      request.targetDepartmentId && departmentNames.get(request.targetDepartmentId),
      request.targetCourseId && courseNames.get(request.targetCourseId),
      request.targetClassId && classNames.get(request.targetClassId),
      request.targetSectionId && sectionNames.get(request.targetSectionId),
    ].filter((part): part is string => !!part)

    labels.set(targetKey(request), parts.join(" > ") || "Sconosciuto")
  }
  return labels
}

export function targetKey(request: TargetIds): string {
  return [
    request.targetDepartmentId,
    request.targetCourseId,
    request.targetClassId,
    request.targetSectionId,
  ].join("|")
}

export async function findRequestUsers(
  db: DbOrTx,
  userIds: string[],
): Promise<Map<string, RequestUser>> {
  if (userIds.length === 0) return new Map()
  const rows = await db
    .select({
      id: profiles.id,
      name: profiles.name,
      email: profiles.email,
      image: profiles.image,
    })
    .from(profiles)
    .where(inArray(profiles.id, userIds))
  return new Map(rows.map((row) => [row.id, row]))
}

export function unknownUser(id: string): RequestUser {
  return { id, name: null, email: null, image: null }
}

export async function findRequestOrThrow(db: DbOrTx, id: string) {
  const [request] = await db
    .select()
    .from(contentRequests)
    .where(eq(contentRequests.id, id))
    .limit(1)
  if (!request) throw new NotFound("Proposta non trovata")
  return request
}
