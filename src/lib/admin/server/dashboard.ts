import { createServerFn } from "@tanstack/react-start"

import { requireAdmin } from "@/lib/auth/guards"
import { createServerSupabaseClient } from "@/lib/supabase/server"

import type {
  AdminPermissions,
  AdminStats,
  ContentTreeDepartment,
} from "../types"

// ─── Dashboard ───

export const getAdminStatsFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<AdminStats> => {
    await requireAdmin()
    const supabase = createServerSupabaseClient()

    const [departments, courses, classes, sections, questions] =
      await Promise.all([
        supabase
          .from("departments")
          .select("*", { count: "exact", head: true }),
        supabase.from("courses").select("*", { count: "exact", head: true }),
        supabase.from("classes").select("*", { count: "exact", head: true }),
        supabase.from("sections").select("*", { count: "exact", head: true }),
        supabase.from("questions").select("*", { count: "exact", head: true }),
      ])

    return {
      departmentCount: departments.count ?? 0,
      courseCount: courses.count ?? 0,
      classCount: classes.count ?? 0,
      sectionCount: sections.count ?? 0,
      questionCount: questions.count ?? 0,
    }
  },
)

export const getAdminPermissionsFn = createServerFn({
  method: "GET",
}).handler(async (): Promise<AdminPermissions> => {
  const user = await requireAdmin()
  const supabase = createServerSupabaseClient()

  const [deptAdmins, courseMaintainers] = await Promise.all([
    supabase
      .from("department_admins")
      .select("department_id")
      .eq("user_id", user.id),
    supabase
      .from("course_maintainers")
      .select("course_id")
      .eq("user_id", user.id),
  ])

  return {
    role: user.role,
    managedDepartmentIds: (deptAdmins.data ?? []).map(
      (d) => d.department_id,
    ),
    maintainedCourseIds: (courseMaintainers.data ?? []).map(
      (c) => c.course_id,
    ),
  }
})

// ─── Content Tree ───

export const getContentTreeFn = createServerFn({
  method: "GET",
}).handler(async (): Promise<ContentTreeDepartment[]> => {
  await requireAdmin()
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("departments")
    .select(
      "id, name, code, courses(id, name, code, classes(id, name, code, sections(id, name)))",
    )
    .order("position")

  if (error) throw new Error(error.message)
  return data as ContentTreeDepartment[]
})
