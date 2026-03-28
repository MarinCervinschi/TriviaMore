import { createServerFn } from "@tanstack/react-start"

import { requireAdmin } from "@/lib/auth/guards"
import { createNotification, notifyAdminsInScope } from "@/lib/notifications/helpers"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { createServerSupabaseClient } from "@/lib/supabase/server"

import type {
  ContentRequestCommentWithUser,
  ContentRequestDetail,
  ContentRequestWithMeta,
} from "./types"

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

// Helper: build a human-readable target label from the hierarchy
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
    const { data } = await supabase
      .from("sections")
      .select("name, class:classes(name, course:courses(name, department:departments(name)))")
      .eq("id", request.target_section_id)
      .single()
    if (data) {
      const cls = data.class as { name: string; course: { name: string; department: { name: string } } }
      parts.push(cls.course.department.name, cls.course.name, cls.name, data.name)
    }
  } else if (request.target_class_id) {
    const { data } = await supabase
      .from("classes")
      .select("name, course:courses(name, department:departments(name))")
      .eq("id", request.target_class_id)
      .single()
    if (data) {
      const course = data.course as { name: string; department: { name: string } }
      parts.push(course.department.name, course.name, data.name)
    }
  } else if (request.target_course_id) {
    const { data } = await supabase
      .from("courses")
      .select("name, department:departments(name)")
      .eq("id", request.target_course_id)
      .single()
    if (data) {
      const dept = data.department as { name: string }
      parts.push(dept.name, data.name)
    }
  } else if (request.target_department_id) {
    const { data } = await supabase
      .from("departments")
      .select("name")
      .eq("id", request.target_department_id)
      .single()
    if (data) {
      parts.push(data.name)
    }
  }

  return parts.join(" > ") || "Sconosciuto"
}

// ─── Content Tree (for target selection in request form) ───

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

  const { data, error } = await supabase
    .from("departments")
    .select(
      "id, name, courses(id, name, classes(id, name, sections(id, name)))",
    )
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

    if (error) throw new Error("Errore nel caricamento delle richieste")

    // Build target labels
    const requests: ContentRequestWithMeta[] = []
    for (const req of data ?? []) {
      const target_label = await buildTargetLabel(supabase, req)
      requests.push({
        ...req,
        user: { id: user.id, name: null, email: null, image: null },
        target_label,
      })
    }

    return requests
  },
)

export const getRequestDetailFn = createServerFn({ method: "GET" })
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data: { id } }): Promise<ContentRequestDetail> => {
    const { supabase } = await getAuthUser()

    // Fetch request (RLS ensures user sees own + admin scope)
    const { data: request, error } = await supabase
      .from("content_requests")
      .select("*")
      .eq("id", id)
      .single()

    if (error || !request) throw new Error("Richiesta non trovata")

    // Fetch request owner profile (own profile is always accessible via RLS)
    const { data: ownerProfile } = await supabase
      .from("profiles")
      .select("id, name, email, image")
      .eq("id", request.user_id)
      .single()

    // Fetch comments
    const { data: commentsData } = await supabase
      .from("content_request_comments")
      .select("*")
      .eq("request_id", id)
      .order("created_at", { ascending: true })

    // Try to fetch profiles for all comment authors
    // RLS: students can only see their own profile, admins/superadmins can see all
    const commentUserIds = [
      ...new Set((commentsData ?? []).map((c) => c.user_id)),
    ]
    const { data: commentProfiles } = commentUserIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, name, email, image, role")
          .in("id", commentUserIds)
      : { data: [] }

    const profileMap = new Map(
      (commentProfiles ?? []).map((p) => [p.id, p]),
    )

    // For comment authors not visible via RLS (staff profiles seen by students),
    // brand them as "TriviaMore Team"
    const comments: ContentRequestCommentWithUser[] = (commentsData ?? []).map(
      (c) => {
        const profile = profileMap.get(c.user_id)
        if (profile) {
          return { ...c, user: profile }
        }
        // Profile not accessible via RLS — this is a staff member seen by a student
        return {
          ...c,
          user: {
            id: c.user_id,
            name: "TriviaMore Team",
            email: null,
            image: "/logo192.png",
            role: "ADMIN" as const,
          },
        }
      },
    )

    const target_label = await buildTargetLabel(supabase, request)

    return {
      ...request,
      user: ownerProfile ?? {
        id: request.user_id,
        name: null,
        email: null,
        image: null,
      },
      target_label,
      comments,
    }
  })

// ─── User Mutations ───

export const createRequestFn = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      request_type: string
      title: string
      description: string
      target_department_id?: string | null
      target_course_id?: string | null
      target_class_id?: string | null
      target_section_id?: string | null
      question_id?: string | null
    }) => input,
  )
  .handler(async ({ data }) => {
    const { supabase, user } = await getAuthUser()

    const id = crypto.randomUUID()

    const { error } = await supabase.from("content_requests").insert({
      id,
      user_id: user.id,
      request_type: data.request_type as "NEW_SECTION" | "NEW_QUESTIONS" | "ERROR_REPORT" | "CONTENT_REQUEST",
      title: data.title,
      description: data.description,
      target_department_id: data.target_department_id ?? null,
      target_course_id: data.target_course_id ?? null,
      target_class_id: data.target_class_id ?? null,
      target_section_id: data.target_section_id ?? null,
      question_id: data.question_id ?? null,
    })

    if (error) throw new Error("Errore nella creazione della richiesta")

    // Notify admins in scope
    await notifyAdminsInScope(supabaseAdmin, {
      id,
      title: data.title,
      target_department_id: data.target_department_id ?? null,
      target_course_id: data.target_course_id ?? null,
      target_class_id: data.target_class_id ?? null,
      target_section_id: data.target_section_id ?? null,
    })

    return { id }
  })

export const reviseRequestFn = createServerFn({ method: "POST" })
  .inputValidator(
    (input: { id: string; title?: string; description?: string }) => input,
  )
  .handler(async ({ data }) => {
    const { supabase, user } = await getAuthUser()

    // Verify the request belongs to the user and is NEEDS_REVISION
    const { data: existing, error: fetchError } = await supabase
      .from("content_requests")
      .select("*")
      .eq("id", data.id)
      .eq("user_id", user.id)
      .eq("status", "NEEDS_REVISION")
      .single()

    if (fetchError || !existing)
      throw new Error("Richiesta non trovata o non modificabile")

    const updates: Record<string, unknown> = { status: "PENDING" }
    if (data.title) updates.title = data.title
    if (data.description) updates.description = data.description

    const { error } = await supabase
      .from("content_requests")
      .update(updates)
      .eq("id", data.id)

    if (error) throw new Error("Errore nell'aggiornamento della richiesta")

    // Notify the admin who handled it
    if (existing.handled_by) {
      await createNotification(supabaseAdmin, {
        userId: existing.handled_by,
        type: "REQUEST_REVISED",
        title: "Richiesta revisionata",
        body: existing.title,
        referenceId: data.id,
        referenceType: "content_request",
        link: `/admin/requests/${data.id}`,
      })
    }
  })

// ─── Admin Queries ───

export const getAdminRequestsFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<ContentRequestWithMeta[]> => {
    await requireAdmin()
    const supabase = createServerSupabaseClient()

    // RLS ensures admin only sees requests in their scope
    const { data, error } = await supabase
      .from("content_requests")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw new Error("Errore nel caricamento delle richieste")

    // Fetch user profiles for all requests
    const userIds = [...new Set((data ?? []).map((r) => r.user_id))]
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, name, email, image")
      .in("id", userIds.length > 0 ? userIds : ["__none__"])

    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]))

    const requests: ContentRequestWithMeta[] = []
    for (const req of data ?? []) {
      const target_label = await buildTargetLabel(supabase, req)
      requests.push({
        ...req,
        user: profileMap.get(req.user_id) ?? {
          id: req.user_id,
          name: null,
          email: null,
          image: null,
        },
        target_label,
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

  if (error) throw new Error("Errore nel conteggio delle richieste")

  return count ?? 0
})

// ─── Admin Mutations ───

export const handleRequestFn = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      id: string
      status: "APPROVED" | "REJECTED" | "NEEDS_REVISION"
      admin_note?: string
    }) => input,
  )
  .handler(async ({ data }) => {
    const admin = await requireAdmin()
    const supabase = createServerSupabaseClient()

    // Fetch request to get the owner
    const { data: request, error: fetchError } = await supabase
      .from("content_requests")
      .select("user_id, title")
      .eq("id", data.id)
      .single()

    if (fetchError || !request) throw new Error("Richiesta non trovata")

    const { error } = await supabase
      .from("content_requests")
      .update({
        status: data.status,
        handled_by: admin.id,
        handled_at: new Date().toISOString(),
        admin_note: data.admin_note ?? null,
      })
      .eq("id", data.id)

    if (error) throw new Error("Errore nella gestione della richiesta")

    // Notify the request owner
    const statusLabels: Record<string, string> = {
      APPROVED: "approvata",
      REJECTED: "rifiutata",
      NEEDS_REVISION: "necessita di revisione",
    }

    const notificationType =
      data.status === "NEEDS_REVISION"
        ? ("REQUEST_NEEDS_REVISION" as const)
        : ("REQUEST_STATUS_CHANGED" as const)

    await createNotification(supabaseAdmin, {
      userId: request.user_id,
      type: notificationType,
      title: `Richiesta ${statusLabels[data.status]}`,
      body: request.title,
      referenceId: data.id,
      referenceType: "content_request",
      link: `/user/requests/${data.id}`,
    })
  })

export const addRequestCommentFn = createServerFn({ method: "POST" })
  .inputValidator(
    (input: { request_id: string; content: string }) => input,
  )
  .handler(async ({ data }) => {
    const { supabase, user } = await getAuthUser()

    const id = crypto.randomUUID()

    const { error } = await supabase
      .from("content_request_comments")
      .insert({
        id,
        request_id: data.request_id,
        user_id: user.id,
        content: data.content,
      })

    if (error) throw new Error("Errore nell'aggiunta del commento")

    // Notify the other party about the new comment
    const { data: commenterProfile } = await supabase
      .from("profiles")
      .select("role, name")
      .eq("id", user.id)
      .single()

    const { data: request } = await supabase
      .from("content_requests")
      .select("user_id, title, handled_by, target_department_id, target_course_id, target_class_id, target_section_id")
      .eq("id", data.request_id)
      .single()

    if (request && commenterProfile) {
      const isStaff = commenterProfile.role !== "STUDENT"
      const snippet = data.content.slice(0, 100)

      if (isStaff && request.user_id !== user.id) {
        // Staff commenting → notify the request owner
        await createNotification(supabaseAdmin, {
          userId: request.user_id,
          type: "REQUEST_STATUS_CHANGED",
          title: "Nuovo commento sulla tua richiesta",
          body: `TriviaMore Team: ${snippet}`,
          referenceId: data.request_id,
          referenceType: "content_request",
          link: `/user/requests/${data.request_id}`,
        })
      } else if (!isStaff) {
        // Student commenting → notify admins in scope
        await notifyAdminsInScope(supabaseAdmin, {
          id: data.request_id,
          title: `${commenterProfile.name ?? "Utente"}: ${snippet}`,
          target_department_id: request.target_department_id,
          target_course_id: request.target_course_id,
          target_class_id: request.target_class_id,
          target_section_id: request.target_section_id,
        }, {
          notificationTitle: "Nuovo commento su una richiesta",
          notificationType: "REQUEST_REVISED",
        })
      }
    }

    return { id }
  })
