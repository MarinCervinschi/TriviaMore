import { createServerFn } from "@tanstack/react-start"

import { requireAdmin } from "@/lib/auth/guards"
import { createNotification, notifyAdminsInScope } from "@/lib/notifications/helpers"
import { supabaseAdmin, catalogAdmin } from "@/lib/supabase/admin"
import { createServerSupabaseClient, catalogQuery } from "@/lib/supabase/server"

import { storedContentSchema } from "./schemas"
import type { AdminContentRequest, ContentRequestWithMeta, SubmittedContent } from "./types"

const ID_LETTERS = "abcdefghijklmnopqrstuvwxyz"

/** Validate JSONB content from DB against Zod schema at runtime */
function parseSubmittedContent(raw: unknown): SubmittedContent {
  const result = storedContentSchema.safeParse(raw)
  if (!result.success) {
    throw new Error("Contenuto della proposta non valido")
  }
  return result.data as SubmittedContent
}

function toDbOptions(options: string[] | null | undefined) {
  if (!options) return null
  return options.map((text, i) => ({ id: ID_LETTERS[i], text }))
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
      .select("name, class:classes(name, course:courses(name, department:departments(name)))")
      .eq("id", request.target_section_id)
      .single()
    if (data) {
      const cls = data.class as { name: string; course: { name: string; department: { name: string } } }
      parts.push(cls.course.department.name, cls.course.name, cls.name, data.name)
    }
  } else if (request.target_class_id) {
    const { data } = await catalogQuery(supabase)
      .from("classes")
      .select("name, course:courses(name, department:departments(name))")
      .eq("id", request.target_class_id)
      .single()
    if (data) {
      const course = data.course as { name: string; department: { name: string } }
      parts.push(course.department.name, course.name, data.name)
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
      const { data: cls } = await catalogQuery(supabase)
        .from("classes")
        .select("course_id")
        .eq("id", targetClassId)
        .single()
      if (cls) {
        targetCourseId = cls.course_id
        const { data: course } = await catalogQuery(supabase)
          .from("courses")
          .select("department_id")
          .eq("id", cls.course_id)
          .single()
        if (course) targetDeptId = course.department_id
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
    await notifyAdminsInScope(supabaseAdmin, {
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
    const { supabase, user } = await getAuthUser()

    const { data: existing, error: fetchError } = await supabase
      .from("content_requests")
      .select("*")
      .eq("id", data.id)
      .eq("user_id", user.id)
      .eq("status", "NEEDS_REVISION")
      .single()

    if (fetchError || !existing)
      throw new Error("Proposta non trovata o non modificabile")

    const { error } = await supabase
      .from("content_requests")
      .update({
        status: "PENDING" as const,
        submitted_content: JSON.parse(JSON.stringify(data.submitted_content)),
        admin_note: null,
      })
      .eq("id", data.id)

    if (error) throw new Error("Errore nell'aggiornamento della proposta")

    if (existing.handled_by) {
      await createNotification(supabaseAdmin, {
        userId: existing.handled_by,
        type: "REQUEST_REVISED",
        title: "Proposta aggiornata",
        body: generateTitle(parseSubmittedContent(data.submitted_content)),
        referenceId: data.id,
        referenceType: "content_request",
        link: `/admin/requests/${data.id}`,
      })
    }
  })

// ─── Admin Queries ───

export const getAdminRequestsFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<AdminContentRequest[]> => {
    await requireAdmin()
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from("content_requests")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw new Error("Errore nel caricamento delle proposte")

    const userIds = [...new Set((data ?? []).map((r) => r.user_id))]
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("id, name, email, image")
      .in("id", userIds.length > 0 ? userIds : ["__none__"])

    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]))

    const requests: AdminContentRequest[] = []
    for (const req of data ?? []) {
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
      })
    }

    return requests
  },
)

export const getAdminRequestCountFn = createServerFn({
  method: "GET",
}).handler(async (): Promise<number> => {
  await requireAdmin()
  const supabase = createServerSupabaseClient()

  const { count, error } = await supabase
    .from("content_requests")
    .select("*", { count: "exact", head: true })
    .eq("status", "PENDING")

  if (error) throw new Error("Errore nel conteggio delle proposte")
  return count ?? 0
})

export const getRequestDetailFn = createServerFn({ method: "GET" })
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data: { id } }): Promise<ContentRequestWithMeta> => {
    const { supabase, user } = await getAuthUser()

    const { data: request, error } = await supabase
      .from("content_requests")
      .select("*")
      .eq("id", id)
      .single()

    if (error || !request) throw new Error("Proposta non trovata")

    // Verify ownership or admin access
    if (request.user_id !== user.id) {
      await requireAdmin()
    }

    const target_label = await buildTargetLabel(supabase, request)
    const submitted = parseSubmittedContent(request.submitted_content)

    return { ...request, target_label, submitted }
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
    const admin = await requireAdmin()
    const supabase = createServerSupabaseClient()

    const { data: request, error: fetchError } = await supabase
      .from("content_requests")
      .select("user_id")
      .eq("id", data.id)
      .single()

    if (fetchError || !request) throw new Error("Proposta non trovata")

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

    await createNotification(supabaseAdmin, {
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
    const admin = await requireAdmin()
    const supabase = createServerSupabaseClient()

    const { data: request, error: fetchError } = await supabase
      .from("content_requests")
      .select("*")
      .eq("id", data.id)
      .single()

    if (fetchError || !request) throw new Error("Proposta non trovata")
    if (request.status !== "PENDING") throw new Error("La proposta non è in attesa")

    const submitted = parseSubmittedContent(request.submitted_content)

    // Reports and file uploads are acknowledged, not approved
    if (submitted.type === "report" || submitted.type === "file_upload") {
      throw new Error("Questo tipo di richiesta non può essere approvato")
    }

    // Create the actual content in the main DB
    if (submitted.type === "section") {
      const targetClassId = request.target_class_id
      if (!targetClassId) throw new Error("Classe target mancante")

      const { count } = await catalogAdmin
        .from("sections")
        .select("*", { count: "exact", head: true })
        .eq("class_id", targetClassId)

      const { error } = await catalogAdmin
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
        options: toDbOptions(q.options),
        correct_answer: q.correct_answer,
        explanation: q.explanation || null,
        difficulty: q.difficulty,
        section_id: targetSectionId,
      }))

      const { error } = await catalogAdmin.from("questions").insert(rows)
      if (error) throw new Error("Errore nella creazione delle domande: " + error.message)
    }

    // Mark request as approved
    const { error: updateError } = await supabase
      .from("content_requests")
      .update({
        status: "APPROVED" as const,
        handled_by: admin.id,
        handled_at: new Date().toISOString(),
      })
      .eq("id", data.id)

    if (updateError) throw new Error("Errore nell'aggiornamento della proposta")

    // Notify the user
    await createNotification(supabaseAdmin, {
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
    const admin = await requireAdmin()
    const supabase = createServerSupabaseClient()

    const { data: request, error: fetchError } = await supabase
      .from("content_requests")
      .select("user_id, request_type")
      .eq("id", data.id)
      .single()

    if (fetchError || !request) throw new Error("Proposta non trovata")

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

    await createNotification(supabaseAdmin, {
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

    const { data: urlData, error } = await supabaseAdmin.storage
      .from("contributions")
      .createSignedUrl(data.filePath, 3600)

    if (error || !urlData?.signedUrl) throw new Error("Errore nel download del file")
    return urlData.signedUrl
  })
