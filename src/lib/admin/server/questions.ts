import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"

import { requireAdmin } from "@/lib/auth/guards"
import { catalogQuery, createServerSupabaseClient } from "@/lib/supabase/server"

import {
  assertSectionScope,
  requireContentManagerForQuestion,
  requireContentManagerForSection,
} from "./access"
import { idSchema, questionSchema, updateQuestionSchema } from "../schemas"

// ─── Questions ───

export const getAdminQuestionDetailFn = createServerFn({ method: "GET" })
  .inputValidator(idSchema)
  .handler(async ({ data: { id } }) => {
    await requireAdmin()
    const supabase = createServerSupabaseClient()

    const { data: question, error } = await catalogQuery(supabase)
      .from("questions")
      .select(
        "*, section:sections(*, class:classes(*, course_classes(course:courses(*, department:departments(*)))))",
      )
      .eq("id", id)
      .single()

    if (error) throw new Error(error.message)
    return question
  })

export const createQuestionFn = createServerFn({ method: "POST" })
  .inputValidator(questionSchema)
  .handler(async ({ data }) => {
    await requireContentManagerForSection(data.section_id)
    const supabase = createServerSupabaseClient()

    const { data: question, error } = await catalogQuery(supabase)
      .from("questions")
      .insert({
        id: crypto.randomUUID(),
        content: data.content,
        question_type: data.question_type,
        options: data.options ?? null,
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
    const user = await requireAdmin()
    // Scope-check every distinct target section for maintainers.
    const sectionIds = [...new Set(questions.map((q) => q.section_id))]
    for (const sectionId of sectionIds) {
      await assertSectionScope(user, sectionId)
    }
    const supabase = createServerSupabaseClient()

    const rows = questions.map((q) => ({
      id: crypto.randomUUID(),
      content: q.content,
      question_type: q.question_type,
      options: q.options ?? null,
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
    await requireContentManagerForQuestion(id)
    const supabase = createServerSupabaseClient()

    const updateData: Record<string, unknown> = {}
    if (updates.content !== undefined) updateData.content = updates.content
    if (updates.question_type !== undefined)
      updateData.question_type = updates.question_type
    if (updates.options !== undefined)
      updateData.options = updates.options ?? null
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
    await requireContentManagerForQuestion(id)
    const supabase = createServerSupabaseClient()

    const { error } = await catalogQuery(supabase).from("questions").delete().eq("id", id)
    if (error) throw new Error(error.message)
  })
