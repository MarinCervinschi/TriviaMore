import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"

import { requireAdmin } from "@/lib/auth/guards"
import { catalogQuery, createServerSupabaseClient } from "@/lib/supabase/server"

import { idSchema, questionSchema, updateQuestionSchema } from "../schemas"

const ID_LETTERS = "abcdefghijklmnopqrstuvwxyz"

/** Convert plain string options to {id, text} format for DB storage */
function toDbOptions(
  options: string[] | null | undefined,
): Array<{ id: string; text: string }> | null {
  if (!options) return null
  return options.map((text, i) => ({ id: ID_LETTERS[i], text }))
}

// ─── Questions ───

export const getAdminQuestionDetailFn = createServerFn({ method: "GET" })
  .inputValidator(idSchema)
  .handler(async ({ data: { id } }) => {
    await requireAdmin()
    const supabase = createServerSupabaseClient()

    const { data: question, error } = await catalogQuery(supabase)
      .from("questions")
      .select(
        "*, section:sections(*, class:classes(*, course:courses(*, department:departments(*))))",
      )
      .eq("id", id)
      .single()

    if (error) throw new Error(error.message)
    return question
  })

export const createQuestionFn = createServerFn({ method: "POST" })
  .inputValidator(questionSchema)
  .handler(async ({ data }) => {
    await requireAdmin()
    const supabase = createServerSupabaseClient()

    const { data: question, error } = await catalogQuery(supabase)
      .from("questions")
      .insert({
        id: crypto.randomUUID(),
        content: data.content,
        question_type: data.question_type,
        options: toDbOptions(data.options),
        correct_answer: data.correct_answer,
        explanation: data.explanation || null,
        difficulty: data.difficulty,
        section_id: data.section_id,
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return question
  })

export const createQuestionsBulkFn = createServerFn({ method: "POST" })
  .inputValidator(z.array(questionSchema))
  .handler(async ({ data: questions }) => {
    await requireAdmin()
    const supabase = createServerSupabaseClient()

    const rows = questions.map((q) => ({
      id: crypto.randomUUID(),
      content: q.content,
      question_type: q.question_type,
      options: toDbOptions(q.options),
      correct_answer: q.correct_answer,
      explanation: q.explanation || null,
      difficulty: q.difficulty,
      section_id: q.section_id,
    }))

    const { data, error } = await catalogQuery(supabase)
      .from("questions")
      .insert(rows)
      .select()

    if (error) throw new Error(error.message)
    return data
  })

export const updateQuestionFn = createServerFn({ method: "POST" })
  .inputValidator(idSchema.merge(updateQuestionSchema))
  .handler(async ({ data: { id, ...updates } }) => {
    await requireAdmin()
    const supabase = createServerSupabaseClient()

    const updateData: Record<string, unknown> = {}
    if (updates.content !== undefined) updateData.content = updates.content
    if (updates.question_type !== undefined)
      updateData.question_type = updates.question_type
    if (updates.options !== undefined)
      updateData.options = toDbOptions(updates.options)
    if (updates.correct_answer !== undefined)
      updateData.correct_answer = updates.correct_answer
    if (updates.explanation !== undefined)
      updateData.explanation = updates.explanation || null
    if (updates.difficulty !== undefined)
      updateData.difficulty = updates.difficulty

    const { data: question, error } = await catalogQuery(supabase)
      .from("questions")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return question
  })

export const deleteQuestionFn = createServerFn({ method: "POST" })
  .inputValidator(idSchema)
  .handler(async ({ data: { id } }) => {
    await requireAdmin()
    const supabase = createServerSupabaseClient()

    const { error } = await catalogQuery(supabase).from("questions").delete().eq("id", id)
    if (error) throw new Error(error.message)
  })
