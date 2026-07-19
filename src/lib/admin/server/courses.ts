import { createServerFn } from "@tanstack/react-start"

import { getCatalogAdmin } from "@/lib/supabase/admin"

import { requireCourseAccess, requireStructureManager } from "./access"
import { courseSchema, idSchema, updateCourseSchema } from "../schemas"

// ─── Courses ───

export const getAdminCourseDetailFn = createServerFn({ method: "GET" })
  .inputValidator(idSchema)
  .handler(async ({ data: { id } }) => {
    await requireCourseAccess(id)

    const { data: course, error: courseError } = await getCatalogAdmin()
      .from("courses")
      .select("*, department:departments(*)")
      .eq("id", id)
      .single()

    if (courseError) throw new Error(courseError.message)

    const { data: courseClasses, error: classesError } = await getCatalogAdmin()
      .from("course_classes")
      .select("*, class:classes(*, sections(name, is_public))")
      .eq("course_id", id)
      .order("position")

    if (classesError) throw new Error(classesError.message)

    return { ...course, course_classes: courseClasses }
  })

export const createCourseFn = createServerFn({ method: "POST" })
  .inputValidator(courseSchema)
  .handler(async ({ data }) => {
    await requireStructureManager()

    const { count } = await getCatalogAdmin()
      .from("courses")
      .select("*", { count: "exact", head: true })
      .eq("department_id", data.department_id)

    const { data: course, error } = await getCatalogAdmin()
      .from("courses")
      .insert({
        name: data.name,
        code: data.code,
        description: data.description || null,
        department_id: data.department_id,
        course_type: data.course_type,
        location: data.location || null,
        cfu: data.cfu ?? null,
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
    await requireStructureManager()

    const updateData: Record<string, unknown> = {}
    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.code !== undefined) updateData.code = updates.code
    if (updates.description !== undefined)
      updateData.description = updates.description || null
    if (updates.course_type !== undefined)
      updateData.course_type = updates.course_type
    if (updates.location !== undefined)
      updateData.location = updates.location || null
    if (updates.cfu !== undefined) updateData.cfu = updates.cfu ?? null
    if (updates.position !== undefined) updateData.position = updates.position

    const { data: course, error } = await getCatalogAdmin()
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
    await requireStructureManager()

    const { count } = await getCatalogAdmin()
      .from("course_classes")
      .select("*", { count: "exact", head: true })
      .eq("course_id", id)

    if (count && count > 0) {
      throw new Error(
        "Impossibile eliminare: il corso ha delle classi collegate. Scollega prima le classi.",
      )
    }

    const { error } = await getCatalogAdmin().from("courses").delete().eq("id", id)
    if (error) throw new Error(error.message)
  })
