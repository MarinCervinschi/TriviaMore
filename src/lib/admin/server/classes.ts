import { createServerFn } from "@tanstack/react-start"

import { requireAdmin } from "@/lib/auth/guards"
import { catalogQuery, createServerSupabaseClient } from "@/lib/supabase/server"

import {
  classSchema,
  courseClassSchema,
  idSchema,
  updateClassSchema,
  updateCourseClassSchema,
} from "../schemas"

// ─── Classes ───

export const getAdminClassDetailFn = createServerFn({ method: "GET" })
  .inputValidator(idSchema)
  .handler(async ({ data: { id } }) => {
    await requireAdmin()
    const supabase = createServerSupabaseClient()

    const { data: cls, error: clsError } = await catalogQuery(supabase)
      .from("classes")
      .select("*")
      .eq("id", id)
      .single()

    if (clsError) throw new Error(clsError.message)

    const [sectionsResult, courseClassesResult] = await Promise.all([
      catalogQuery(supabase)
        .from("sections")
        .select("*, questions(count)")
        .eq("class_id", id)
        .order("position"),
      catalogQuery(supabase)
        .from("course_classes")
        .select("*, course:courses(*, department:departments(*))")
        .eq("class_id", id)
        .order("position"),
    ])

    if (sectionsResult.error) throw new Error(sectionsResult.error.message)
    if (courseClassesResult.error) throw new Error(courseClassesResult.error.message)

    return {
      ...cls,
      sections: sectionsResult.data,
      course_classes: courseClassesResult.data,
    }
  })

export const createClassFn = createServerFn({ method: "POST" })
  .inputValidator(classSchema)
  .handler(async ({ data }) => {
    await requireAdmin()
    const supabase = createServerSupabaseClient()

    const { data: cls, error } = await catalogQuery(supabase)
      .from("classes")
      .insert({
        name: data.name,
        description: data.description || null,
        cfu: data.cfu ?? null,
        position: data.position ?? 0,
      })
      .select()
      .single()

    if (error) {
      if (error.code === "23505") {
        throw new Error("Esiste già una classe con questo codice")
      }
      throw new Error(error.message)
    }

    return cls
  })

export const updateClassFn = createServerFn({ method: "POST" })
  .inputValidator(idSchema.merge(updateClassSchema))
  .handler(async ({ data: { id, ...updates } }) => {
    await requireAdmin()
    const supabase = createServerSupabaseClient()

    const updateData: Record<string, unknown> = {}
    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.description !== undefined)
      updateData.description = updates.description || null
    if (updates.cfu !== undefined) updateData.cfu = updates.cfu ?? null
    if (updates.position !== undefined) updateData.position = updates.position

    const { data: cls, error } = await catalogQuery(supabase)
      .from("classes")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      if (error.code === "23505") {
        throw new Error("Esiste già una classe con questo codice")
      }
      throw new Error(error.message)
    }

    return cls
  })

export const deleteClassFn = createServerFn({ method: "POST" })
  .inputValidator(idSchema)
  .handler(async ({ data: { id } }) => {
    await requireAdmin()
    const supabase = createServerSupabaseClient()

    const { count } = await catalogQuery(supabase)
      .from("sections")
      .select("*", { count: "exact", head: true })
      .eq("class_id", id)

    if (count && count > 0) {
      throw new Error(
        "Impossibile eliminare: la classe contiene delle sezioni. Elimina prima le sezioni.",
      )
    }

    const { error } = await catalogQuery(supabase).from("classes").delete().eq("id", id)
    if (error) throw new Error(error.message)
  })

// ─── Course-Class Junction ───

export const addClassToCourseFn = createServerFn({ method: "POST" })
  .inputValidator(courseClassSchema)
  .handler(async ({ data }) => {
    await requireAdmin()
    const supabase = createServerSupabaseClient()

    const { data: row, error } = await catalogQuery(supabase)
      .from("course_classes")
      .insert({
        course_id: data.course_id,
        class_id: data.class_id,
        code: data.code,
        class_year: data.class_year,
        mandatory: data.mandatory,
        catalogue_url: data.catalogue_url || null,
        curriculum: data.curriculum || null,
        position: data.position ?? 0,
      })
      .select()
      .single()

    if (error) {
      if (error.code === "23505") {
        throw new Error("Questa classe è già collegata a questo corso")
      }
      throw new Error(error.message)
    }

    return row
  })

export const updateCourseClassFn = createServerFn({ method: "POST" })
  .inputValidator(
    courseClassSchema.pick({ course_id: true, class_id: true }).merge(updateCourseClassSchema),
  )
  .handler(async ({ data: { course_id, class_id, ...updates } }) => {
    await requireAdmin()
    const supabase = createServerSupabaseClient()

    const updateData: Record<string, unknown> = {}
    if (updates.code !== undefined) updateData.code = updates.code
    if (updates.class_year !== undefined) updateData.class_year = updates.class_year
    if (updates.mandatory !== undefined) updateData.mandatory = updates.mandatory
    if (updates.catalogue_url !== undefined)
      updateData.catalogue_url = updates.catalogue_url || null
    if (updates.curriculum !== undefined)
      updateData.curriculum = updates.curriculum || null
    if (updates.position !== undefined) updateData.position = updates.position

    const { data: row, error } = await catalogQuery(supabase)
      .from("course_classes")
      .update(updateData)
      .eq("course_id", course_id)
      .eq("class_id", class_id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return row
  })

export const removeClassFromCourseFn = createServerFn({ method: "POST" })
  .inputValidator(
    courseClassSchema.pick({ course_id: true, class_id: true }),
  )
  .handler(async ({ data }) => {
    await requireAdmin()
    const supabase = createServerSupabaseClient()

    const { error } = await catalogQuery(supabase)
      .from("course_classes")
      .delete()
      .eq("course_id", data.course_id)
      .eq("class_id", data.class_id)

    if (error) throw new Error(error.message)
  })
