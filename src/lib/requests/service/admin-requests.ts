import { and, count, desc, eq, sql } from "drizzle-orm"

import { getDb } from "@/db"
import { contentRequests, questions, sections } from "@/db/schema"
import { createNotification } from "@/lib/notifications/service"
import { getSupabaseAdmin } from "@/lib/supabase/admin"
import { Conflict, Invalid, NotFound } from "@/lib/server/errors"

import type {
  AdminContentRequest,
  ContentRequestDetail,
  ReportedQuestion,
} from "../types"
import {
  assertInScope,
  findRequestOrThrow,
  findRequestUsers,
  generateTitle,
  parseSubmittedContent,
  requestScope,
  requireRequestAdmin,
  resolveTargetLabels,
  targetKey,
  unknownUser,
} from "./shared"

export async function getAdminRequests(): Promise<AdminContentRequest[]> {
  const { scopeCourseIds } = await requireRequestAdmin()
  const db = getDb()

  // Scoping in the query rather than after the fetch: a maintainer of one course
  // used to receive every request in the database and filter in memory.
  if (scopeCourseIds && scopeCourseIds.size === 0) return []

  const rows = await db
    .select()
    .from(contentRequests)
    .where(requestScope(db, scopeCourseIds))
    .orderBy(desc(contentRequests.createdAt))

  const [labels, users] = await Promise.all([
    resolveTargetLabels(db, rows),
    findRequestUsers(db, [
      ...new Set(
        rows.flatMap((row) => [row.userId, row.handledBy]).filter((id): id is string => !!id),
      ),
    ]),
  ])

  return rows.map(({ submittedContent, ...row }) => ({
    ...row,
    targetLabel: labels.get(targetKey(row)) ?? "Sconosciuto",
    submitted: parseSubmittedContent(submittedContent),
    user: users.get(row.userId) ?? unknownUser(row.userId),
    handledByUser: row.handledBy ? users.get(row.handledBy) ?? null : null,
  }))
}

export async function getAdminRequestCount(): Promise<number> {
  const { scopeCourseIds } = await requireRequestAdmin()
  if (scopeCourseIds && scopeCourseIds.size === 0) return 0
  const db = getDb()

  const [row] = await db
    .select({ value: count() })
    .from(contentRequests)
    .where(
      and(
        eq(contentRequests.status, "PENDING"),
        requestScope(db, scopeCourseIds),
      ),
    )

  return row?.value ?? 0
}

export async function getRequestDetail(
  userId: string,
  id: string,
): Promise<ContentRequestDetail> {
  const db = getDb()
  const request = await findRequestOrThrow(db, id)

  // The owner sees their own request; anyone else needs admin access, and a
  // maintainer has to be in scope. Only admins get the profiles.
  let author = null
  let handledByUser = null
  if (request.userId !== userId) {
    const { scopeCourseIds } = await requireRequestAdmin()
    await assertInScope(db, scopeCourseIds, request)

    const users = await findRequestUsers(
      db,
      [request.userId, request.handledBy].filter((v): v is string => !!v),
    )
    author = users.get(request.userId) ?? unknownUser(request.userId)
    handledByUser = request.handledBy
      ? users.get(request.handledBy) ?? null
      : null
  }

  const submitted = parseSubmittedContent(request.submittedContent)
  const labels = await resolveTargetLabels(db, [request])

  let reportedQuestion: ReportedQuestion | null = null
  if (submitted.type === "report") {
    const [question] = await db
      .select({
        id: questions.id,
        content: questions.content,
        questionType: questions.questionType,
        options: questions.options,
        correctAnswer: questions.correctAnswer,
        explanation: questions.explanation,
        difficulty: questions.difficulty,
      })
      .from(questions)
      .where(eq(questions.id, submitted.question_id))
      .limit(1)
    reportedQuestion = question ?? null
  }

  const { submittedContent, ...wire } = request
  return {
    ...wire,
    targetLabel: labels.get(targetKey(request)) ?? "Sconosciuto",
    submitted,
    reportedQuestion,
    user: author,
    handledByUser,
  }
}

export async function handleRequest(input: {
  id: string
  status: "REJECTED" | "NEEDS_REVISION"
  admin_note?: string
}) {
  const { user: admin, scopeCourseIds } = await requireRequestAdmin()

  await getDb().transaction(async (tx) => {
    const request = await findRequestOrThrow(tx, input.id)
    await assertInScope(tx, scopeCourseIds, request)

    await tx
      .update(contentRequests)
      .set({
        status: input.status,
        handledBy: admin.id,
        handledAt: sql`now()`,
        adminNote: input.admin_note ?? null,
      })
      .where(eq(contentRequests.id, input.id))

    const statusLabels = {
      REJECTED: "rifiutata",
      NEEDS_REVISION: "necessita di modifiche",
    }

    await createNotification(tx, {
      userId: request.userId,
      type:
        input.status === "NEEDS_REVISION"
          ? "REQUEST_NEEDS_REVISION"
          : "REQUEST_STATUS_CHANGED",
      title: `Proposta ${statusLabels[input.status]}`,
      referenceId: input.id,
      referenceType: "content_request",
      link: `/user/requests`,
    })
  })
}

export async function approveRequest(id: string) {
  const { user: admin, scopeCourseIds } = await requireRequestAdmin()

  await getDb().transaction(async (tx) => {
    const target = await findRequestOrThrow(tx, id)
    await assertInScope(tx, scopeCourseIds, target)

    // Atomic claim: PENDING → APPROVED in one statement, so two concurrent
    // clicks cannot both go on to insert catalog content. Inside a transaction a
    // later failure undoes the claim, which is why the previous implementation
    // needed a manual rollback to leave the request handleable.
    const [claimed] = await tx
      .update(contentRequests)
      .set({ status: "APPROVED", handledBy: admin.id, handledAt: sql`now()` })
      .where(
        and(eq(contentRequests.id, id), eq(contentRequests.status, "PENDING")),
      )
      .returning()

    if (!claimed) throw new Conflict("La proposta non è in attesa")

    const submitted = parseSubmittedContent(claimed.submittedContent)

    if (submitted.type === "report" || submitted.type === "file_upload") {
      throw new Invalid("Questo tipo di richiesta non può essere approvato")
    }

    if (submitted.type === "section") {
      if (!claimed.targetClassId) throw new Invalid("Classe target mancante")

      const [last] = await tx
        .select({ position: sql<number>`coalesce(max(${sections.position}), 0)`.mapWith(Number) })
        .from(sections)
        .where(eq(sections.classId, claimed.targetClassId))

      await tx.insert(sections).values({
        name: submitted.name,
        description: submitted.description || null,
        classId: claimed.targetClassId,
        isPublic: true,
        position: last.position + 1,
      })
    } else {
      if (!claimed.targetSectionId) throw new Invalid("Sezione target mancante")

      await tx.insert(questions).values(
        submitted.questions.map((question) => ({
          content: question.content,
          questionType: question.question_type,
          options: question.options ?? null,
          correctAnswer: question.correct_answer,
          explanation: question.explanation || null,
          difficulty: question.difficulty,
          sectionId: claimed.targetSectionId!,
        })),
      )
    }

    await createNotification(tx, {
      userId: claimed.userId,
      type: "REQUEST_STATUS_CHANGED",
      title: "Proposta approvata!",
      body: generateTitle(submitted),
      referenceId: id,
      referenceType: "content_request",
      link: `/user/requests`,
    })
  })
}

export async function acknowledgeRequest(input: {
  id: string
  admin_note?: string
}) {
  const { user: admin, scopeCourseIds } = await requireRequestAdmin()

  await getDb().transaction(async (tx) => {
    const request = await findRequestOrThrow(tx, input.id)
    await assertInScope(tx, scopeCourseIds, request)

    const note = input.admin_note?.trim() || null

    await tx
      .update(contentRequests)
      .set({
        status: "APPROVED",
        handledBy: admin.id,
        handledAt: sql`now()`,
        adminNote: note,
      })
      .where(eq(contentRequests.id, input.id))

    const titleMap: Record<string, string> = {
      REPORT: "Segnalazione presa in carico",
      FILE_UPLOAD: "Contributo preso in carico",
    }

    await createNotification(tx, {
      userId: request.userId,
      type: "REQUEST_STATUS_CHANGED",
      title: titleMap[request.requestType] ?? "Proposta presa in carico",
      body: note ?? undefined,
      referenceId: input.id,
      referenceType: "content_request",
      link: `/user/requests`,
    })
  })
}

export async function getFileDownloadUrl(filePath: string): Promise<string> {
  if (filePath.includes("..")) throw new Invalid("Percorso file non valido")

  const { data, error } = await getSupabaseAdmin()
    .storage.from("contributions")
    .createSignedUrl(filePath, 3600)

  if (error || !data?.signedUrl) throw new NotFound("Errore nel download del file")
  return data.signedUrl
}
