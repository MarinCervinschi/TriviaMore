import { createServerFn } from "@tanstack/react-start"

import { requireAdmin } from "@/lib/auth/guards"
import { createServerSupabaseClient } from "@/lib/supabase/server"

import { classSchema, idSchema, updateClassSchema } from "../schemas"

// ─── Classes ───

export const getAdminClassDetailFn = createServerFn({ method: "GET" })
  .inputValidator(idSchema)
  .handler(async ({ data: { id } }) => {
    await requireAdmin()
    const supabase = createServerSupabaseClient()

    const { data: cls, error: clsError } = await supabase
      .from("classes")
      .select("*, course:courses(*, department:departments(*))")
      .eq("id", id)
      .single()

    if (clsError) throw new Error(clsError.message)

    const { data: sections, error: sectionsError } = await supabase
      .from("sections")
      .select("*, questions(count)")
      .eq("class_id", id)
      .order("position")

    if (sectionsError) throw new Error(sectionsError.message)

    return { ...cls, sections }
  })

export const createClassFn = createServerFn({ method: "POST" })
  .inputValidator(classSchema)
  .handler(async ({ data }) => {
    await requireAdmin()
    const supabase = createServerSupabaseClient()

    const { count } = await supabase
      .from("classes")
      .select("*", { count: "exact", head: true })
      .eq("course_id", data.course_id)

    const { data: cls, error } = await supabase
      .from("classes")
      .insert({
        id: crypto.randomUUID(),
        name: data.name,
        code: data.code,
        description: data.description || null,
        course_id: data.course_id,
        class_year: data.class_year,
        position: (count ?? 0) + 1,
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
    if (updates.code !== undefined) updateData.code = updates.code
    if (updates.description !== undefined)
      updateData.description = updates.description || null
    if (updates.class_year !== undefined)
      updateData.class_year = updates.class_year
    if (updates.position !== undefined) updateData.position = updates.position

    const { data: cls, error } = await supabase
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

    const { count } = await supabase
      .from("sections")
      .select("*", { count: "exact", head: true })
      .eq("class_id", id)

    if (count && count > 0) {
      throw new Error(
        "Impossibile eliminare: la classe contiene delle sezioni. Elimina prima le sezioni.",
      )
    }

    const { error } = await supabase.from("classes").delete().eq("id", id)
    if (error) throw new Error(error.message)
  })
