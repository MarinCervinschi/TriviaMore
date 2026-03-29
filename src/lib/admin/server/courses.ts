import { createServerFn } from "@tanstack/react-start"

import { requireAdmin } from "@/lib/auth/guards"
import { catalogQuery, createServerSupabaseClient } from "@/lib/supabase/server"

import { courseSchema, idSchema, updateCourseSchema } from "../schemas"

// ─── Courses ───

export const getAdminCourseDetailFn = createServerFn({ method: "GET" })
  .inputValidator(idSchema)
  .handler(async ({ data: { id } }) => {
    await requireAdmin()
    const supabase = createServerSupabaseClient()

    const { data: course, error: courseError } = await catalogQuery(supabase)
      .from("courses")
      .select("*, department:departments(*)")
      .eq("id", id)
      .single()

    if (courseError) throw new Error(courseError.message)

    const { data: classes, error: classesError } = await catalogQuery(supabase)
      .from("classes")
      .select("*, sections(count)")
      .eq("course_id", id)
      .order("position")

    if (classesError) throw new Error(classesError.message)

    return { ...course, classes }
  })

export const createCourseFn = createServerFn({ method: "POST" })
  .inputValidator(courseSchema)
  .handler(async ({ data }) => {
    await requireAdmin()
    const supabase = createServerSupabaseClient()

    const { count } = await catalogQuery(supabase)
      .from("courses")
      .select("*", { count: "exact", head: true })
      .eq("department_id", data.department_id)

    const { data: course, error } = await catalogQuery(supabase)
      .from("courses")
      .insert({
        id: crypto.randomUUID(),
        name: data.name,
        code: data.code,
        description: data.description || null,
        department_id: data.department_id,
        course_type: data.course_type,
        position: (count ?? 0) + 1,
      })
      .select()
      .single()

    if (error) {
      if (error.code === "23505") {
        throw new Error("Esiste già un corso con questo codice")
      }
      throw new Error(error.message)
    }

    return course
  })

export const updateCourseFn = createServerFn({ method: "POST" })
  .inputValidator(idSchema.merge(updateCourseSchema))
  .handler(async ({ data: { id, ...updates } }) => {
    await requireAdmin()
    const supabase = createServerSupabaseClient()

    const updateData: Record<string, unknown> = {}
    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.code !== undefined) updateData.code = updates.code
    if (updates.description !== undefined)
      updateData.description = updates.description || null
    if (updates.course_type !== undefined)
      updateData.course_type = updates.course_type
    if (updates.position !== undefined) updateData.position = updates.position

    const { data: course, error } = await catalogQuery(supabase)
      .from("courses")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      if (error.code === "23505") {
        throw new Error("Esiste già un corso con questo codice")
      }
      throw new Error(error.message)
    }

    return course
  })

export const deleteCourseFn = createServerFn({ method: "POST" })
  .inputValidator(idSchema)
  .handler(async ({ data: { id } }) => {
    await requireAdmin()
    const supabase = createServerSupabaseClient()

    const { count } = await catalogQuery(supabase)
      .from("classes")
      .select("*", { count: "exact", head: true })
      .eq("course_id", id)

    if (count && count > 0) {
      throw new Error(
        "Impossibile eliminare: il corso contiene delle classi. Elimina prima le classi.",
      )
    }

    const { error } = await catalogQuery(supabase).from("courses").delete().eq("id", id)
    if (error) throw new Error(error.message)
  })
