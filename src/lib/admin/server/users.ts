import { createServerFn } from "@tanstack/react-start"

import { requireAdmin, requireSuperadmin } from "@/lib/auth/guards"
import { catalogAdmin, quizAdmin, supabaseAdmin } from "@/lib/supabase/admin"
import { catalogQuery, createServerSupabaseClient } from "@/lib/supabase/server"

import {
  courseMaintainerSchema,
  departmentAdminSchema,
  idSchema,
  sectionAccessSchema,
  userRoleSchema,
} from "../schemas"
import type { AdminUser, AdminUserDetail, AdminUserStats } from "../types"

// ─── Users ───

export const getAdminUsersFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<AdminUser[]> => {
    await requireSuperadmin()

    const { data: profiles, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw new Error(error.message)

    // Get quiz attempt counts per user
    const { data: counts } = await quizAdmin
      .from("quiz_attempts")
      .select("user_id")
      .not("completed_at", "is", null)

    const countMap = new Map<string, number>()
    for (const row of counts ?? []) {
      countMap.set(row.user_id, (countMap.get(row.user_id) ?? 0) + 1)
    }

    return (profiles ?? []).map((p) => ({
      id: p.id,
      name: p.name,
      email: p.email,
      image: p.image,
      role: p.role,
      created_at: p.created_at,
      quiz_attempts_count: countMap.get(p.id) ?? 0,
    }))
  },
)

export const getAdminUserDetailFn = createServerFn({ method: "GET" })
  .inputValidator(idSchema)
  .handler(async ({ data: { id } }): Promise<AdminUserDetail> => {
    await requireSuperadmin()

    const [profileRes, deptAdminsRes, maintainersRes, accessRes, statsRes] =
      await Promise.all([
        supabaseAdmin.from("profiles").select("*").eq("id", id).single(),
        catalogAdmin
          .from("department_admins")
          .select("department_id, departments(id, name, code)")
          .eq("user_id", id),
        catalogAdmin
          .from("course_maintainers")
          .select(
            "course_id, courses(id, name, code, department:departments(name))",
          )
          .eq("user_id", id),
        catalogAdmin
          .from("section_access")
          .select("section_id, sections(id, name, class:classes(name))")
          .eq("user_id", id),
        quizAdmin
          .from("quiz_attempts")
          .select("score, completed_at")
          .eq("user_id", id)
          .not("completed_at", "is", null)
          .order("completed_at", { ascending: false }),
      ])

    if (profileRes.error) throw new Error(profileRes.error.message)
    const profile = profileRes.data

    const quizzes = statsRes.data ?? []
    const avgScore =
      quizzes.length > 0
        ? quizzes.reduce((sum, q) => sum + q.score, 0) / quizzes.length
        : null

    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      image: profile.image,
      role: profile.role,
      created_at: profile.created_at,
      managed_departments: (deptAdminsRes.data ?? []).map((d) => {
        const dept = d.departments as unknown as {
          id: string
          name: string
          code: string
        }
        return { id: dept.id, name: dept.name, code: dept.code }
      }),
      maintained_courses: (maintainersRes.data ?? []).map((c) => {
        const course = c.courses as unknown as {
          id: string
          name: string
          code: string
          department: { name: string }
        }
        return {
          id: course.id,
          name: course.name,
          code: course.code,
          department_name: course.department?.name ?? "",
        }
      }),
      section_accesses: (accessRes.data ?? []).map((s) => {
        const section = s.sections as unknown as {
          id: string
          name: string
          class: { name: string }
        }
        return {
          id: section.id,
          name: section.name,
          class_name: section.class?.name ?? "",
        }
      }),
      stats: {
        total_quizzes: quizzes.length,
        average_score: avgScore,
        last_quiz_at: quizzes[0]?.completed_at ?? null,
      },
    }
  })

export const updateUserRoleFn = createServerFn({ method: "POST" })
  .inputValidator(userRoleSchema)
  .handler(async ({ data: { id, role } }) => {
    await requireSuperadmin()

    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ role })
      .eq("id", id)

    if (error) throw new Error(error.message)
  })

export const addDepartmentAdminFn = createServerFn({ method: "POST" })
  .inputValidator(departmentAdminSchema)
  .handler(async ({ data }) => {
    await requireSuperadmin()
    const { error } = await catalogAdmin
      .from("department_admins")
      .insert(data)

    if (error) {
      if (error.code === "23505") {
        throw new Error("L'utente è già admin di questo dipartimento")
      }
      throw new Error(error.message)
    }
  })

export const removeDepartmentAdminFn = createServerFn({ method: "POST" })
  .inputValidator(departmentAdminSchema)
  .handler(async ({ data }) => {
    await requireSuperadmin()
    const { error } = await catalogAdmin
      .from("department_admins")
      .delete()
      .eq("user_id", data.user_id)
      .eq("department_id", data.department_id)

    if (error) throw new Error(error.message)
  })

export const addCourseMaintainerFn = createServerFn({ method: "POST" })
  .inputValidator(courseMaintainerSchema)
  .handler(async ({ data }) => {
    await requireSuperadmin()
    const { error } = await catalogAdmin
      .from("course_maintainers")
      .insert(data)

    if (error) {
      if (error.code === "23505") {
        throw new Error("L'utente è già maintainer di questo corso")
      }
      throw new Error(error.message)
    }
  })

export const removeCourseMaintainerFn = createServerFn({ method: "POST" })
  .inputValidator(courseMaintainerSchema)
  .handler(async ({ data }) => {
    await requireSuperadmin()
    const { error } = await catalogAdmin
      .from("course_maintainers")
      .delete()
      .eq("user_id", data.user_id)
      .eq("course_id", data.course_id)

    if (error) throw new Error(error.message)
  })

export const addSectionAccessFn = createServerFn({ method: "POST" })
  .inputValidator(sectionAccessSchema)
  .handler(async ({ data }) => {
    await requireSuperadmin()
    const { error } = await catalogAdmin
      .from("section_access")
      .insert(data)

    if (error) {
      if (error.code === "23505") {
        throw new Error("L'utente ha già accesso a questa sezione")
      }
      throw new Error(error.message)
    }
  })

export const removeSectionAccessFn = createServerFn({ method: "POST" })
  .inputValidator(sectionAccessSchema)
  .handler(async ({ data }) => {
    await requireSuperadmin()
    const { error } = await catalogAdmin
      .from("section_access")
      .delete()
      .eq("user_id", data.user_id)
      .eq("section_id", data.section_id)

    if (error) throw new Error(error.message)
  })

export const deleteUserFn = createServerFn({ method: "POST" })
  .inputValidator(idSchema)
  .handler(async ({ data: { id } }) => {
    const currentUser = await requireSuperadmin()

    if (currentUser.id === id) {
      throw new Error("Non puoi eliminare il tuo stesso account")
    }

    const { error } = await supabaseAdmin.auth.admin.deleteUser(id)
    if (error) throw new Error("Errore nell'eliminazione dell'utente: " + error.message)
  })

export const getAllCoursesFn = createServerFn({ method: "GET" }).handler(
  async () => {
    await requireAdmin()
    const supabase = createServerSupabaseClient()

    const { data, error } = await catalogQuery(supabase)
      .from("courses")
      .select("id, name, code, department:departments(name)")
      .order("name")

    if (error) throw new Error(error.message)
    return (data ?? []).map((c) => ({
      id: c.id,
      name: c.name,
      code: c.code,
      department_name: (c.department as unknown as { name: string })?.name ?? "",
    }))
  },
)

export const getAdminUserStatsFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<AdminUserStats> => {
    await requireSuperadmin()

    const [profilesRes, attemptsRes, recentRes] = await Promise.all([
      supabaseAdmin.from("profiles").select("role"),
      quizAdmin
        .from("quiz_attempts")
        .select("user_id, score")
        .not("completed_at", "is", null),
      quizAdmin
        .from("quiz_attempts")
        .select("*", { count: "exact", head: true })
        .not("completed_at", "is", null)
        .gte(
          "completed_at",
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        ),
    ])

    const profiles = profilesRes.data ?? []
    const attempts = attemptsRes.data ?? []

    const byRole: Record<string, number> = {}
    for (const p of profiles) {
      byRole[p.role] = (byRole[p.role] ?? 0) + 1
    }

    const avgScore =
      attempts.length > 0
        ? attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length
        : null

    const activeUserIds = new Set(attempts.map((a) => a.user_id))

    return {
      totalUsers: profiles.length,
      byRole,
      totalQuizAttempts: attempts.length,
      recentQuizAttempts: recentRes.count ?? 0,
      averageScore: avgScore,
      activeUsers: activeUserIds.size,
    }
  },
)

export const getPrivateSectionsFn = createServerFn({ method: "GET" }).handler(
  async () => {
    await requireSuperadmin()

    const { data, error } = await catalogAdmin
      .from("sections")
      .select("id, name, class:classes(name)")
      .eq("is_public", false)
      .order("name")

    if (error) throw new Error(error.message)
    return (data ?? []).map((s) => ({
      id: s.id,
      name: s.name,
      class_name: (s.class as unknown as { name: string })?.name ?? "",
    }))
  },
)

export const getSectionAccessUsersFn = createServerFn({ method: "GET" })
  .inputValidator(sectionAccessSchema.pick({ section_id: true }))
  .handler(async ({ data: { section_id } }) => {
    await requireSuperadmin()

    const { data, error } = await catalogAdmin
      .from("section_access")
      .select("user_id, profiles(id, name, email)")
      .eq("section_id", section_id)

    if (error) throw new Error(error.message)
    return (data ?? []).map((row) => {
      const profile = row.profiles as unknown as {
        id: string
        name: string | null
        email: string | null
      }
      return {
        id: profile.id,
        name: profile.name,
        email: profile.email,
      }
    })
  })
