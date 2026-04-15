import type { SupabaseClient } from "@supabase/supabase-js"

import type { Database } from "@/lib/supabase/database.types"
import { getCatalogAdmin } from "@/lib/supabase/admin"

type NotificationType = Database["public"]["Enums"]["notification_type"]

const BROADCAST_BATCH_SIZE = 500

// Creates a single notification using the admin client (bypasses RLS)
export async function createNotification(
  supabaseAdmin: SupabaseClient<Database>,
  params: {
    userId: string
    type: NotificationType
    title: string
    body?: string
    referenceId?: string
    referenceType?: string
    link?: string
  },
) {
  const id = crypto.randomUUID()
  const { error } = await supabaseAdmin.from("notifications").insert({
    id,
    user_id: params.userId,
    type: params.type,
    title: params.title,
    body: params.body ?? null,
    reference_id: params.referenceId ?? null,
    reference_type: params.referenceType ?? null,
    link: params.link ?? null,
  })

  if (error) {
    console.error("Failed to create notification:", error)
  }
}

// Creates notifications for all admins/maintainers who have scope over a content request's target
export async function notifyAdminsInScope(
  supabaseAdmin: SupabaseClient<Database>,
  request: {
    id: string
    title: string
    target_department_id: string | null
    target_course_id: string | null
    target_class_id: string | null
    target_section_id: string | null
  },
  overrides?: {
    notificationTitle?: string
    notificationType?: NotificationType
  },
) {
  const adminUserIds = new Set<string>()

  // Always include superadmins
  const { data: superadmins } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("role", "SUPERADMIN")

  for (const sa of superadmins ?? []) {
    adminUserIds.add(sa.id)
  }

  // Resolve the department ID by walking up the hierarchy
  let departmentId = request.target_department_id
  let courseId = request.target_course_id

  if (request.target_section_id) {
    const { data: section } = await getCatalogAdmin()
      .from("sections")
      .select("class_id")
      .eq("id", request.target_section_id)
      .single()
    if (section) {
      const { data: cc } = await getCatalogAdmin()
        .from("course_classes")
        .select("course_id")
        .eq("class_id", section.class_id)
        .limit(1)
        .single()
      if (cc) {
        courseId = cc.course_id
      }
    }
  }

  if (request.target_class_id && !courseId) {
    const { data: cc } = await getCatalogAdmin()
      .from("course_classes")
      .select("course_id")
      .eq("class_id", request.target_class_id)
      .limit(1)
      .single()
    if (cc) {
      courseId = cc.course_id
    }
  }

  if (courseId) {
    // Add course maintainers
    const { data: maintainers } = await getCatalogAdmin()
      .from("course_maintainers")
      .select("user_id")
      .eq("course_id", courseId)

    for (const m of maintainers ?? []) {
      adminUserIds.add(m.user_id)
    }

    // Resolve department from course
    if (!departmentId) {
      const { data: course } = await getCatalogAdmin()
        .from("courses")
        .select("department_id")
        .eq("id", courseId)
        .single()
      if (course) {
        departmentId = course.department_id
      }
    }
  }

  if (departmentId) {
    // Add department admins
    const { data: deptAdmins } = await getCatalogAdmin()
      .from("department_admins")
      .select("user_id")
      .eq("department_id", departmentId)

    for (const da of deptAdmins ?? []) {
      adminUserIds.add(da.user_id)
    }
  }

  // Create notifications for all resolved admins
  const notifications = Array.from(adminUserIds).map((userId) => ({
    id: crypto.randomUUID(),
    user_id: userId,
    type: overrides?.notificationType ?? ("NEW_REQUEST_RECEIVED" as const),
    title: overrides?.notificationTitle ?? "Nuova richiesta di contenuto",
    body: request.title,
    reference_id: request.id,
    reference_type: "content_request",
    link: `/admin/requests/${request.id}`,
  }))

  if (notifications.length > 0) {
    const { error } = await supabaseAdmin
      .from("notifications")
      .insert(notifications)

    if (error) {
      console.error("Failed to notify admins:", error)
    }
  }
}

// Creates a notification for every user in the platform (batch insert)
export async function broadcastToAllUsers(
  supabaseAdmin: SupabaseClient<Database>,
  params: {
    type: NotificationType
    title: string
    body?: string
    referenceId?: string
    referenceType?: string
    link?: string
  },
) {
  const { data: profiles, error: profilesError } = await supabaseAdmin
    .from("profiles")
    .select("id")

  if (profilesError || !profiles) {
    console.error("Failed to fetch profiles for broadcast:", profilesError)
    return
  }

  const notifications = profiles.map((p) => ({
    id: crypto.randomUUID(),
    user_id: p.id,
    type: params.type,
    title: params.title,
    body: params.body ?? null,
    reference_id: params.referenceId ?? null,
    reference_type: params.referenceType ?? null,
    link: params.link ?? null,
  }))

  for (let i = 0; i < notifications.length; i += BROADCAST_BATCH_SIZE) {
    const batch = notifications.slice(i, i + BROADCAST_BATCH_SIZE)
    const { error } = await supabaseAdmin.from("notifications").insert(batch)
    if (error) {
      console.error(`Failed to insert broadcast batch ${i}:`, error)
    }
  }
}
