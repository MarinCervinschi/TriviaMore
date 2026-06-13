import { createServerFn } from "@tanstack/react-start"
import { redirect } from "@tanstack/react-router"

import { requireAdmin } from "@/lib/auth/guards"
import { maintainedCourseIds } from "@/lib/admin/server/access"
import { createNotification, notifyAdminsInScope } from "@/lib/notifications/helpers"
import { getSupabaseAdmin, getCatalogAdmin } from "@/lib/supabase/admin"
import { createServerSupabaseClient, catalogQuery } from "@/lib/supabase/server"
import type { AuthUser } from "@/lib/auth/types"

import { storedContentSchema } from "./schemas"
import type {
  AdminContentRequest,
  ContentRequestDetail,
  ContentRequestWithMeta,
  ReportedQuestion,
  RequestUser,
  SubmittedContent,
} from "./types"

// Admin guard for the requests area. Maintainers only see requests targeting a
// course they maintain; ADMIN/SUPERADMIN are unscoped (scopeCourseIds = null).
async function requireRequestAdmin(): Promise<{
  user: AuthUser
  scopeCourseIds: Set<string> | null
}> {
  const user = await requireAdmin()
  if (user.role !== "MAINTAINER") return { user, scopeCourseIds: null }
  return { user, scopeCourseIds: await maintainedCourseIds(user.id) }
}

function isInScope(
  scopeCourseIds: Set<string> | null,
  targetCourseId: string | null,
): boolean {
  if (!scopeCourseIds) return true
  return !!targetCourseId && scopeCourseIds.has(targetCourseId)
}

/** Validate JSONB content from DB against Zod schema at runtime */
function parseSubmittedContent(raw: unknown): SubmittedContent {
  const result = storedContentSchema.safeParse(raw)
  if (!result.success) {
    throw new Error("Contenuto della proposta non valido")
  }
  return result.data as SubmittedContent
}

// Helper: get authenticated user or throw
async function getAuthUser() {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) throw new Error("Non autenticato")
  return { supabase, user }
}

// Helper: build target label from hierarchy
async function buildTargetLabel(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  request: {
    target_department_id: string | null
    target_course_id: string | null
    target_class_id: string | null
    target_section_id: string | null
  },
): Promise<string> {
  const parts: string[] = []

  if (request.target_section_id) {
    const { data } = await catalogQuery(supabase)
      .from("sections")
      .select("name, class:classes(name, course_classes(course:courses(name, department:departments(name))))")
      .eq("id", request.target_section_id)
      .single()
    if (data) {
      const cls = data.class as any
      const cc = cls?.course_classes?.[0]?.course
      if (cc) {
        parts.push(cc.department.name, cc.name, cls.name, data.name)
      } else {
        parts.push(cls?.name ?? "", data.name)
      }
    }
  } else if (request.target_class_id) {
    const { data } = await catalogQuery(supabase)
      .from("classes")
      .select("name, course_classes(course:courses(name, department:departments(name)))")
      .eq("id", request.target_class_id)
      .single()
    if (data) {
      const cc = (data as any).course_classes?.[0]?.course
      if (cc) {
        parts.push(cc.department.name, cc.name, data.name)
      } else {
        parts.push(data.name)
      }
    }
  } else if (request.target_course_id) {
    const { data } = await catalogQuery(supabase)
      .from("courses")
      .select("name, department:departments(name)")
      .eq("id", request.target_course_id)
      .single()
    if (data) {
      const dept = data.department as { name: string }
      parts.push(dept.name, data.name)
    }
  } else if (request.target_department_id) {
    const { data } = await catalogQuery(supabase)
      .from("departments")
      .select("name")
      .eq("id", request.target_department_id)
      .single()
    if (data) parts.push(data.name)
  }

  return parts.join(" > ") || "Sconosciuto"
}

// Helper: generate a display title from submitted content
const REPORT_REASON_LABELS: Record<string, string> = {
  errata: "Errata",
  imprecisa: "Imprecisa",
  fuori_contesto: "Fuori contesto",
  altro: "Altro",
}

function generateTitle(submitted: SubmittedContent): string {
  if (submitted.type === "section") {
    return `Nuova sezione: ${submitted.name}`
  }
  if (submitted.type === "report") {
    const firstReason = submitted.reasons[0]
    return `Segnalazione: ${REPORT_REASON_LABELS[firstReason] ?? firstReason}`
  }
  if (submitted.type === "file_upload") {
    return `File: ${submitted.file_name}`
  }
  const count = submitted.questions.length
  return `${count} ${count === 1 ? "domanda" : "domande"}`
}

// ─── Content Tree (for target selection in form) ───

export type RequestTargetTree = {
  id: string
  name: string
  courses: {
    id: string
    name: string
    classes: {
      id: string
      name: string
      sections: { id: string; name: string }[]
    }[]
  }[]
}[]

export const getContentTreeForRequestsFn = createServerFn({
  method: "GET",
}).handler(async (): Promise<RequestTargetTree> => {
  const { supabase } = await getAuthUser()

  const { data, error } = await catalogQuery(supabase)
    .from("departments")
    .select("id, name, courses(id, name, classes(id, name, sections(id, name)))")
    .order("position")

  if (error) throw new Error("Errore nel caricamento della struttura")
  return data as RequestTargetTree
})

// ─── User Queries ───

export const getUserRequestsFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<ContentRequestWithMeta[]> => {
    const { supabase, user } = await getAuthUser()

    const { data, error } = await supabase
      .from("content_requests")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) throw new Error("Errore nel caricamento delle proposte")

    const requests: ContentRequestWithMeta[] = []
    for (const req of data ?? []) {
      const target_label = await buildTargetLabel(supabase, req)
      const submitted = parseSubmittedContent(req.submitted_content)
      requests.push({ ...req, target_label, submitted })
    }

    return requests
  },
)

// ─── User Mutations ───

export const createRequestFn = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      type: "section" | "questions" | "report" | "file_upload"
      target_class_id?: string
      target_section_id?: string
      submitted_content: unknown
    }) => input,
  )
  .handler(async ({ data }) => {
    const { supabase, user } = await getAuthUser()

    const submitted = parseSubmittedContent(data.submitted_content)
    const id = crypto.randomUUID()

    // Resolve target hierarchy for the request
    let targetDeptId: string | null = null
    let targetCourseId: string | null = null
    let targetClassId = data.target_class_id ?? null
    let targetSectionId = data.target_section_id ?? null

    // For reports, resolve hierarchy from question_id
    if (data.type === "report" && submitted.type === "report") {
      const { data: question } = await catalogQuery(supabase)
        .from("questions")
        .select("section_id")
        .eq("id", submitted.question_id)
        .single()
      if (question) targetSectionId = question.section_id
    }

    // Walk up to fill parent IDs
    if (targetSectionId) {
      const { data: section } = await catalogQuery(supabase)
        .from("sections")
        .select("class_id")
        .eq("id", targetSectionId)
        .single()
      if (section) targetClassId = section.class_id
    }

    if (targetClassId) {
      const { data: courseClass } = await catalogQuery(supabase)
        .from("course_classes")
        .select("course_id, course:courses(department_id)")
        .eq("class_id", targetClassId)
        .limit(1)
        .single()
      if (courseClass) {
        targetCourseId = courseClass.course_id
        if (courseClass.course) targetDeptId = courseClass.course.department_id
      }
    }

    const requestTypeMap = {
      section: "NEW_SECTION" as const,
      questions: "NEW_QUESTIONS" as const,
      report: "REPORT" as const,
      file_upload: "FILE_UPLOAD" as const,
    }
    const requestType = requestTypeMap[data.type]

    const { error } = await supabase.from("content_requests").insert({
      id,
      user_id: user.id,
      request_type: requestType,
      submitted_content: JSON.parse(JSON.stringify(data.submitted_content)),
      target_department_id: targetDeptId,
      target_course_id: targetCourseId,
      target_class_id: targetClassId,
      target_section_id: targetSectionId,
    })

    if (error) throw new Error("Errore nell'invio della proposta")

    // Notify admins in scope
    await notifyAdminsInScope(getSupabaseAdmin(), {
      id,
      title: generateTitle(submitted),
      target_department_id: targetDeptId,
      target_course_id: targetCourseId,
      target_class_id: targetClassId,
      target_section_id: targetSectionId,
    })

    return { id }
  })

export const reviseRequestFn = createServerFn({ method: "POST" })
  .inputValidator(
    (input: { id: string; submitted_content: unknown }) => input,
  )
  .handler(async ({ data }) => {
    const { user } = await getAuthUser()
    const admin = getSupabaseAdmin()

    // Validate the resubmitted content before touching the row.
    const submitted = parseSubmittedContent(data.submitted_content)

    const { data: existing, error: fetchError } = await admin
      .from("content_requests")
      .select("user_id, status, handled_by")
      .eq("id", data.id)
      .single()

    if (fetchError || !existing) throw new Error("Proposta non trovata")
    if (existing.user_id !== user.id) throw new Error("Non autorizzato")
    if (existing.status !== "NEEDS_REVISION")
      throw new Error("La proposta non è modificabile")

    // RLS only grants UPDATE to admins, so use the service-role client after
    // verifying ownership + status here.
    const { error } = await admin
      .from("content_requests")
      .update({
        status: "PENDING" as const,
        submitted_content: JSON.parse(JSON.stringify(data.submitted_content)),
        admin_note: null,
      })
      .eq("id", data.id)

    if (error) throw new Error("Errore nell'aggiornamento della proposta")

    if (existing.handled_by) {
      await createNotification(admin, {
        userId: existing.handled_by,
        type: "REQUEST_REVISED",
        title: "Proposta aggiornata",
        body: generateTitle(submitted),
        referenceId: data.id,
        referenceType: "content_request",
        link: `/admin/requests/${data.id}`,
      })
    }
  })

const REPORT_REASONS = ["errata", "imprecisa", "fuori_contesto", "altro"]

// Edit own report while it is still pending (not yet handled). Uses the
// service-role client after verifying ownership + status, since RLS only
// grants UPDATE to admins.
export const updateReportFn = createServerFn({ method: "POST" })
  .inputValidator(
    (input: { id: string; reasons: string[]; comment: string | null }) => input,
  )
  .handler(async ({ data }) => {
    const { user } = await getAuthUser()
    const admin = getSupabaseAdmin()

    const { data: request, error } = await admin
      .from("content_requests")
      .select("user_id, status, request_type, submitted_content")
      .eq("id", data.id)
      .single()

    if (error || !request) throw new Error("Segnalazione non trovata")
    if (request.user_id !== user.id) throw new Error("Non autorizzato")
    if (request.request_type !== "REPORT")
      throw new Error("Solo le segnalazioni possono essere modificate qui")
    if (request.status !== "PENDING")
      throw new Error("La segnalazione è già stata gestita e non può essere modificata")

    if (
      data.reasons.length === 0 ||
      !data.reasons.every((r) => REPORT_REASONS.includes(r))
    ) {
      throw new Error("Seleziona almeno un motivo valido")
    }
    const comment = data.comment?.trim() || null
    if (data.reasons.includes("altro") && !comment) {
      throw new Error("Il commento è obbligatorio quando selezioni 'Altro'")
    }

    const existing = parseSubmittedContent(request.submitted_content)
    if (existing.type !== "report") throw new Error("Tipo di richiesta non valido")

    const updated = { ...existing, reasons: data.reasons, comment }
    const { error: updateError } = await admin
      .from("content_requests")
      .update({ submitted_content: JSON.parse(JSON.stringify(updated)) })
      .eq("id", data.id)

    if (updateError) throw new Error("Errore nell'aggiornamento della segnalazione")
  })

// Delete own report while it is still pending. Also clears the admin
// notifications that pointed to it.
export const deleteReportFn = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const { user } = await getAuthUser()
    const admin = getSupabaseAdmin()

    const { data: request, error } = await admin
      .from("content_requests")
      .select("user_id, status, request_type")
      .eq("id", data.id)
      .single()

    if (error || !request) throw new Error("Segnalazione non trovata")
    if (request.user_id !== user.id) throw new Error("Non autorizzato")
    if (request.request_type !== "REPORT")
      throw new Error("Solo le segnalazioni possono essere eliminate qui")
    if (request.status !== "PENDING")
      throw new Error("La segnalazione è già stata gestita e non può essere eliminata")

    await admin
      .from("notifications")
      .delete()
      .eq("reference_id", data.id)
      .eq("reference_type", "content_request")

    const { error: deleteError } = await admin
      .from("content_requests")
      .delete()
      .eq("id", data.id)

    if (deleteError) throw new Error("Errore nell'eliminazione della segnalazione")
  })

// ─── Admin Queries ───

export const getAdminRequestsFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<AdminContentRequest[]> => {
    const { scopeCourseIds } = await requireRequestAdmin()
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from("content_requests")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw new Error("Errore nel caricamento delle proposte")

    const rows = (data ?? []).filter((r) =>
      isInScope(scopeCourseIds, r.target_course_id),
    )

    const profileIds = [
      ...new Set(
        rows
          .flatMap((r) => [r.user_id, r.handled_by])
          .filter((v): v is string => !!v),
      ),
    ]
    const { data: profiles } = await getSupabaseAdmin()
      .from("profiles")
      .select("id, name, email, image")
      .in("id", profileIds.length > 0 ? profileIds : ["__none__"])

    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]))

    const requests: AdminContentRequest[] = []
    for (const req of rows) {
      const target_label = await buildTargetLabel(supabase, req)
      const submitted = parseSubmittedContent(req.submitted_content)
      requests.push({
        ...req,
        target_label,
        submitted,
        user: profileMap.get(req.user_id) ?? {
          id: req.user_id,
          name: null,
          email: null,
          image: null,
        },
        handledBy: req.handled_by
          ? profileMap.get(req.handled_by) ?? null
          : null,
      })
    }

    return requests
  },
)

export const getAdminRequestCountFn = createServerFn({
  method: "GET",
}).handler(async (): Promise<number> => {
  const { scopeCourseIds } = await requireRequestAdmin()
  const supabase = createServerSupabaseClient()

  if (scopeCourseIds && scopeCourseIds.size === 0) return 0

  let query = supabase
    .from("content_requests")
    .select("*", { count: "exact", head: true })
    .eq("status", "PENDING")

  if (scopeCourseIds) {
    query = query.in("target_course_id", [...scopeCourseIds])
  }

  const { count, error } = await query
  if (error) throw new Error("Errore nel conteggio delle proposte")
  return count ?? 0
})

export const getRequestDetailFn = createServerFn({ method: "GET" })
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data: { id } }): Promise<ContentRequestDetail> => {
    const { supabase, user } = await getAuthUser()

    const { data: request, error } = await supabase
      .from("content_requests")
      .select("*")
      .eq("id", id)
      .single()

    if (error || !request) throw new Error("Proposta non trovata")

    // Owner views their own request; everyone else needs admin access (and a
    // maintainer must be in scope). Admin viewers also get the author profile
    // and, when handled, the profile of the admin who handled it.
    let author: RequestUser | null = null
    let handledBy: RequestUser | null = null
    if (request.user_id !== user.id) {
      const { scopeCourseIds } = await requireRequestAdmin()
      if (!isInScope(scopeCourseIds, request.target_course_id)) {
        throw redirect({ to: "/admin/requests" })
      }
      const ids = [request.user_id, request.handled_by].filter(
        (v): v is string => !!v,
      )
      const { data: profiles } = await getSupabaseAdmin()
        .from("profiles")
        .select("id, name, email, image")
        .in("id", ids)
      const byId = new Map((profiles ?? []).map((p) => [p.id, p]))
      author = byId.get(request.user_id) ?? {
        id: request.user_id,
        name: null,
        email: null,
        image: null,
      }
      handledBy = request.handled_by
        ? byId.get(request.handled_by) ?? null
        : null
    }

    const target_label = await buildTargetLabel(supabase, request)
    const submitted = parseSubmittedContent(request.submitted_content)

    let reported_question: ReportedQuestion | null = null
    if (submitted.type === "report") {
      const { data: question } = await catalogQuery(supabase)
        .from("questions")
        .select("id, content, question_type, options, correct_answer, explanation, difficulty")
        .eq("id", submitted.question_id)
        .single()
      if (question) reported_question = question as ReportedQuestion
    }

    return {
      ...request,
      target_label,
      submitted,
      reported_question,
      user: author,
      handledBy,
    }
  })

// ─── Admin Mutations ───

export const handleRequestFn = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      id: string
      status: "REJECTED" | "NEEDS_REVISION"
      admin_note?: string
    }) => input,
  )
  .handler(async ({ data }) => {
    const { user: admin, scopeCourseIds } = await requireRequestAdmin()
    const supabase = createServerSupabaseClient()

    const { data: request, error: fetchError } = await supabase
      .from("content_requests")
      .select("user_id, target_course_id")
      .eq("id", data.id)
      .single()

    if (fetchError || !request) throw new Error("Proposta non trovata")
    if (!isInScope(scopeCourseIds, request.target_course_id)) {
      throw new Error("Non hai i permessi per gestire questa richiesta.")
    }

    const { error } = await supabase
      .from("content_requests")
      .update({
        status: data.status,
        handled_by: admin.id,
        handled_at: new Date().toISOString(),
        admin_note: data.admin_note ?? null,
      })
      .eq("id", data.id)

    if (error) throw new Error("Errore nella gestione della proposta")

    const statusLabels = {
      REJECTED: "rifiutata",
      NEEDS_REVISION: "necessita di modifiche",
    }

    const notificationType =
      data.status === "NEEDS_REVISION"
        ? ("REQUEST_NEEDS_REVISION" as const)
        : ("REQUEST_STATUS_CHANGED" as const)

    await createNotification(getSupabaseAdmin(), {
      userId: request.user_id,
      type: notificationType,
      title: `Proposta ${statusLabels[data.status]}`,
      referenceId: data.id,
      referenceType: "content_request",
      link: `/user/requests`,
    })
  })

export const approveRequestFn = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const { user: admin, scopeCourseIds } = await requireRequestAdmin()
    const supabase = createServerSupabaseClient()

    if (scopeCourseIds) {
      const { data: target } = await supabase
        .from("content_requests")
        .select("target_course_id")
        .eq("id", data.id)
        .single()
      if (!target || !isInScope(scopeCourseIds, target.target_course_id)) {
        throw new Error("Non hai i permessi per gestire questa richiesta.")
      }
    }

    // Atomic claim: transition PENDING → APPROVED in a single statement so
    // concurrent clicks cannot both proceed to insert catalog content.
    // The `status = 'PENDING'` precondition is the idempotency key.
    const { data: claimedRows, error: claimError } = await supabase
      .from("content_requests")
      .update({
        status: "APPROVED" as const,
        handled_by: admin.id,
        handled_at: new Date().toISOString(),
      })
      .eq("id", data.id)
      .eq("status", "PENDING")
      .select("*")
    if (claimError) throw new Error("Errore nell'aggiornamento della proposta")

    if (!claimedRows || claimedRows.length === 0) {
      // Already handled by another concurrent request, or never existed.
      const { data: existing } = await supabase
        .from("content_requests")
        .select("id")
        .eq("id", data.id)
        .single()
      if (!existing) throw new Error("Proposta non trovata")
      throw new Error("La proposta non è in attesa")
    }

    const request = claimedRows[0]
    const submitted = parseSubmittedContent(request.submitted_content)

    // Reports and file uploads are acknowledged, not approved. The claim
    // already happened so we must roll back to leave the request handleable.
    if (submitted.type === "report" || submitted.type === "file_upload") {
      await supabase
        .from("content_requests")
        .update({ status: "PENDING" as const, handled_by: null, handled_at: null })
        .eq("id", data.id)
      throw new Error("Questo tipo di richiesta non può essere approvato")
    }

    // Create the actual content in the main DB
    if (submitted.type === "section") {
      const targetClassId = request.target_class_id
      if (!targetClassId) throw new Error("Classe target mancante")

      const { count } = await getCatalogAdmin()
        .from("sections")
        .select("*", { count: "exact", head: true })
        .eq("class_id", targetClassId)

      const { error } = await getCatalogAdmin()
        .from("sections")
        .insert({
          id: crypto.randomUUID(),
          name: submitted.name,
          description: submitted.description || null,
          class_id: targetClassId,
          is_public: true,
          position: (count ?? 0) + 1,
        })

      if (error) throw new Error("Errore nella creazione della sezione: " + error.message)
    } else if (submitted.type === "questions") {
      const targetSectionId = request.target_section_id
      if (!targetSectionId) throw new Error("Sezione target mancante")

      const rows = submitted.questions.map((q) => ({
        id: crypto.randomUUID(),
        content: q.content,
        question_type: q.question_type,
        options: q.options ?? null,
        correct_answer: q.correct_answer,
        explanation: q.explanation || null,
        difficulty: q.difficulty,
        section_id: targetSectionId,
      }))

      const { error } = await getCatalogAdmin().from("questions").insert(rows)
      if (error) throw new Error("Errore nella creazione delle domande: " + error.message)
    }

    // Notify the user
    await createNotification(getSupabaseAdmin(), {
      userId: request.user_id,
      type: "REQUEST_STATUS_CHANGED",
      title: "Proposta approvata!",
      body: generateTitle(submitted),
      referenceId: data.id,
      referenceType: "content_request",
      link: `/user/requests`,
    })
  })

export const acknowledgeRequestFn = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string; admin_note?: string }) => input)
  .handler(async ({ data }) => {
    const { user: admin, scopeCourseIds } = await requireRequestAdmin()
    const supabase = createServerSupabaseClient()

    const { data: request, error: fetchError } = await supabase
      .from("content_requests")
      .select("user_id, request_type, target_course_id")
      .eq("id", data.id)
      .single()

    if (fetchError || !request) throw new Error("Proposta non trovata")
    if (!isInScope(scopeCourseIds, request.target_course_id)) {
      throw new Error("Non hai i permessi per gestire questa richiesta.")
    }

    const { error } = await supabase
      .from("content_requests")
      .update({
        status: "APPROVED" as const,
        handled_by: admin.id,
        handled_at: new Date().toISOString(),
        admin_note: data.admin_note?.trim() || null,
      })
      .eq("id", data.id)

    if (error) throw new Error("Errore nella gestione della proposta")

    const titleMap: Record<string, string> = {
      REPORT: "Segnalazione presa in carico",
      FILE_UPLOAD: "Contributo preso in carico",
    }

    await createNotification(getSupabaseAdmin(), {
      userId: request.user_id,
      type: "REQUEST_STATUS_CHANGED",
      title: titleMap[request.request_type] ?? "Proposta presa in carico",
      body: data.admin_note?.trim() || undefined,
      referenceId: data.id,
      referenceType: "content_request",
      link: `/user/requests`,
    })
  })

export const getFileDownloadUrlFn = createServerFn({ method: "GET" })
  .inputValidator((input: { filePath: string }) => input)
  .handler(async ({ data }): Promise<string> => {
    await requireAdmin()

    if (data.filePath.includes("..")) {
      throw new Error("Percorso file non valido")
    }

    const { data: urlData, error } = await getSupabaseAdmin().storage
      .from("contributions")
      .createSignedUrl(data.filePath, 3600)

    if (error || !urlData?.signedUrl) throw new Error("Errore nel download del file")
    return urlData.signedUrl
  })
