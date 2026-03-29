import { createServerFn } from "@tanstack/react-start"

import { requireAdmin } from "@/lib/auth/guards"
import { catalogQuery, createServerSupabaseClient } from "@/lib/supabase/server"

import {
  departmentSchema,
  idSchema,
  updateDepartmentSchema,
} from "../schemas"
import type { AdminCourse, AdminDepartment } from "../types"

// ─── Departments ───

export const getAdminDepartmentsFn = createServerFn({
  method: "GET",
}).handler(async (): Promise<AdminDepartment[]> => {
  await requireAdmin()
  const supabase = createServerSupabaseClient()

  const { data, error } = await catalogQuery(supabase)
    .from("departments")
    .select("*, courses(count)")
    .order("position")

  if (error) throw new Error(error.message)
  return data as AdminDepartment[]
})

export const getAdminDepartmentDetailFn = createServerFn({ method: "GET" })
  .inputValidator(idSchema)
  .handler(async ({ data: { id } }) => {
    await requireAdmin()
    const supabase = createServerSupabaseClient()

    const { data: department, error: deptError } = await catalogQuery(supabase)
      .from("departments")
      .select("*")
      .eq("id", id)
      .single()

    if (deptError) throw new Error(deptError.message)

    const { data: courses, error: coursesError } = await catalogQuery(supabase)
      .from("courses")
      .select("*, classes(count)")
      .eq("department_id", id)
      .order("position")

    if (coursesError) throw new Error(coursesError.message)

    return {
      ...department,
      courses: courses as (AdminCourse["department"] extends unknown
        ? typeof courses
        : never),
    }
  })

export const createDepartmentFn = createServerFn({ method: "POST" })
  .inputValidator(departmentSchema)
  .handler(async ({ data }) => {
    await requireAdmin()
    const supabase = createServerSupabaseClient()

    // Get next position
    const { count } = await catalogQuery(supabase)
      .from("departments")
      .select("*", { count: "exact", head: true })

    const { data: department, error } = await catalogQuery(supabase)
      .from("departments")
      .insert({
        id: crypto.randomUUID(),
        name: data.name,
        code: data.code,
        description: data.description || null,
        position: (count ?? 0) + 1,
      })
      .select()
      .single()

    if (error) {
      if (error.code === "23505") {
        throw new Error("Esiste già un dipartimento con questo codice")
      }
      throw new Error(error.message)
    }

    return department
  })

export const updateDepartmentFn = createServerFn({ method: "POST" })
  .inputValidator(idSchema.merge(updateDepartmentSchema))
  .handler(async ({ data: { id, ...updates } }) => {
    await requireAdmin()
    const supabase = createServerSupabaseClient()

    const updateData: Record<string, unknown> = {}
    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.code !== undefined) updateData.code = updates.code
    if (updates.description !== undefined)
      updateData.description = updates.description || null
    if (updates.position !== undefined) updateData.position = updates.position

    const { data: department, error } = await catalogQuery(supabase)
      .from("departments")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      if (error.code === "23505") {
        throw new Error("Esiste già un dipartimento con questo codice")
      }
      throw new Error(error.message)
    }

    return department
  })

export const deleteDepartmentFn = createServerFn({ method: "POST" })
  .inputValidator(idSchema)
  .handler(async ({ data: { id } }) => {
    await requireAdmin()
    const supabase = createServerSupabaseClient()

    // Check for child courses
    const { count } = await catalogQuery(supabase)
      .from("courses")
      .select("*", { count: "exact", head: true })
      .eq("department_id", id)

    if (count && count > 0) {
      throw new Error(
        "Impossibile eliminare: il dipartimento contiene dei corsi. Elimina prima i corsi.",
      )
    }

    const { error } = await catalogQuery(supabase)
      .from("departments")
      .delete()
      .eq("id", id)

    if (error) throw new Error(error.message)
  })
