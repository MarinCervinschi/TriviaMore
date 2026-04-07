import { createServerFn } from "@tanstack/react-start"

import { requireAdmin } from "@/lib/auth/guards"
import { catalogQuery, createServerSupabaseClient } from "@/lib/supabase/server"

import { idSchema, sectionSchema, updateSectionSchema } from "../schemas"

// ─── Sections ───

export const getAdminSectionDetailFn = createServerFn({ method: "GET" })
  .inputValidator(idSchema)
  .handler(async ({ data: { id } }) => {
    await requireAdmin()
    const supabase = createServerSupabaseClient()

    const { data: section, error: secError } = await catalogQuery(supabase)
      .from("sections")
      .select("*, class:classes(*, course_classes(course:courses(*, department:departments(*))))")
      .eq("id", id)
      .single()

    if (secError) throw new Error(secError.message)

    const { data: questions, error: questionsError } = await catalogQuery(supabase)
      .from("questions")
      .select("*")
      .eq("section_id", id)
      .order("created_at", { ascending: false })

    if (questionsError) throw new Error(questionsError.message)

    return { ...section, questions }
  })

export const createSectionFn = createServerFn({ method: "POST" })
  .inputValidator(sectionSchema)
  .handler(async ({ data }) => {
    await requireAdmin()
    const supabase = createServerSupabaseClient()

    const { count } = await catalogQuery(supabase)
      .from("sections")
      .select("*", { count: "exact", head: true })
      .eq("class_id", data.class_id)

    const { data: section, error } = await catalogQuery(supabase)
      .from("sections")
      .insert({
        id: crypto.randomUUID(),
        name: data.name,
        description: data.description || null,
        class_id: data.class_id,
        is_public: data.is_public ?? true,
        position: (count ?? 0) + 1,
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return section
  })

export const updateSectionFn = createServerFn({ method: "POST" })
  .inputValidator(idSchema.merge(updateSectionSchema))
  .handler(async ({ data: { id, ...updates } }) => {
    await requireAdmin()
    const supabase = createServerSupabaseClient()

    const updateData: Record<string, unknown> = {}
    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.description !== undefined)
      updateData.description = updates.description || null
    if (updates.is_public !== undefined)
      updateData.is_public = updates.is_public
    if (updates.position !== undefined) updateData.position = updates.position

    const { data: section, error } = await catalogQuery(supabase)
      .from("sections")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return section
  })

export const deleteSectionFn = createServerFn({ method: "POST" })
  .inputValidator(idSchema)
  .handler(async ({ data: { id } }) => {
    await requireAdmin()
    const supabase = createServerSupabaseClient()

    const { count } = await catalogQuery(supabase)
      .from("questions")
      .select("*", { count: "exact", head: true })
      .eq("section_id", id)

    if (count && count > 0) {
      throw new Error(
        "Impossibile eliminare: la sezione contiene delle domande. Elimina prima le domande.",
      )
    }

    const { error } = await catalogQuery(supabase).from("sections").delete().eq("id", id)
    if (error) throw new Error(error.message)
  })
