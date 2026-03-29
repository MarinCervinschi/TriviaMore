import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"

import { catalogQuery, createServerSupabaseClient } from "@/lib/supabase/server"
import type { FlashcardQuestion, FlashcardSession } from "./types"

async function getAuthenticatedUser() {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) return { supabase, user: null }
  return { supabase, user }
}

async function fetchSectionWithChain(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  sectionId: string,
) {
  const { data: section } = await catalogQuery(supabase)
    .from("sections")
    .select(
      "id, name, is_public, class:classes(name, course:courses(name, department:departments(name)))",
    )
    .eq("id", sectionId)
    .single()
  return section
}

async function fetchFlashcardQuestions(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  sectionId: string,
) {
  const { data: questions } = await catalogQuery(supabase)
    .from("questions")
    .select("id, content, correct_answer, explanation, difficulty")
    .eq("section_id", sectionId)
    .eq("question_type", "SHORT_ANSWER")
  return questions ?? []
}

export const startFlashcardFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      sectionId: z.string(),
      cardCount: z.number().min(1).max(100).default(20),
    }),
  )
  .handler(async ({ data }): Promise<{ sessionId: string }> => {
    const { supabase, user } = await getAuthenticatedUser()
    if (!user) throw new Error("Non autenticato")

    // Verify section exists and user can access it
    const section = await fetchSectionWithChain(supabase, data.sectionId)
    if (!section) throw new Error("Sezione non trovata")

    const questions = await fetchFlashcardQuestions(supabase, data.sectionId)
    if (questions.length === 0)
      throw new Error("Nessuna flashcard disponibile per questa sezione")

    // Encode session parameters in the ID for stateless retrieval
    // Use . as separator to avoid conflicts with UUID dashes
    const params = btoa(`${data.sectionId}:${Math.min(data.cardCount, questions.length)}`)
    const sessionId = `user.${Date.now()}.${params}`

    return { sessionId }
  })

export const startExamFlashcardFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      sectionId: z.string(),
      cardCount: z.number().min(1).max(100).default(20),
    }),
  )
  .handler(async ({ data }): Promise<{ sessionId: string }> => {
    const { supabase, user } = await getAuthenticatedUser()
    if (!user) throw new Error("Non autenticato")

    // Get class_id from sentinel section
    const { data: sentinel } = await catalogQuery(supabase)
      .from("sections")
      .select("class_id")
      .eq("id", data.sectionId)
      .single()
    if (!sentinel) throw new Error("Sezione non trovata")

    // Get all real sections in the class
    const { data: classSections } = await catalogQuery(supabase)
      .from("sections")
      .select("id")
      .eq("class_id", sentinel.class_id)
      .neq("name", "Exam Simulation")

    const sectionIds = (classSections ?? []).map((s) => s.id)
    if (sectionIds.length === 0) throw new Error("Nessuna sezione trovata")

    // Fetch SHORT_ANSWER questions from all sections
    const { data: questions } = await catalogQuery(supabase)
      .from("questions")
      .select("id")
      .in("section_id", sectionIds)
      .eq("question_type", "SHORT_ANSWER")

    if (!questions || questions.length === 0)
      throw new Error("Nessuna flashcard disponibile per questa classe")

    const params = btoa(`${data.sectionId}:${Math.min(data.cardCount, questions.length)}`)
    const sessionId = `exam.${Date.now()}.${params}`

    return { sessionId }
  })

export const getFlashcardSessionFn = createServerFn({ method: "GET" })
  .inputValidator((input: { sessionId: string }) => input)
  .handler(async ({ data }): Promise<FlashcardSession | null> => {
    const { supabase, user } = await getAuthenticatedUser()
    if (!user) return null

    // Parse session ID: {prefix}.{timestamp}.{base64(sectionId:cardCount)}
    // prefix: "user" for section-level, "exam" for class-level
    const parts = data.sessionId.split(".")
    const prefix = parts[0]
    if (parts.length !== 3 || (prefix !== "user" && prefix !== "exam"))
      return null

    let sectionId: string
    let cardCount: number
    try {
      const decoded = atob(parts[2])
      const [sid, count] = decoded.split(":")
      sectionId = sid
      cardCount = parseInt(count, 10)
      if (!sectionId || isNaN(cardCount)) return null
    } catch {
      return null
    }

    const section = await fetchSectionWithChain(supabase, sectionId)
    if (!section) return null

    let questions: Awaited<ReturnType<typeof fetchFlashcardQuestions>>

    if (prefix === "exam") {
      // Exam mode: fetch from all sections in the class
      const { data: sentinel } = await catalogQuery(supabase)
        .from("sections")
        .select("class_id")
        .eq("id", sectionId)
        .single()
      if (!sentinel) return null

      const { data: classSections } = await catalogQuery(supabase)
        .from("sections")
        .select("id")
        .eq("class_id", sentinel.class_id)
        .neq("name", "Exam Simulation")

      const sectionIds = (classSections ?? []).map((s) => s.id)
      const { data: qs } = await catalogQuery(supabase)
        .from("questions")
        .select("id, content, correct_answer, explanation, difficulty")
        .in("section_id", sectionIds)
        .eq("question_type", "SHORT_ANSWER")
      questions = qs ?? []
    } else {
      questions = await fetchFlashcardQuestions(supabase, sectionId)
    }

    if (questions.length === 0) return null

    // Use timestamp from sessionId as seed for deterministic selection
    const timestamp = parseInt(parts[1], 10)
    const seededQuestions = selectRandomItemsWithSeed(
      questions,
      cardCount,
      timestamp,
    )

    const flashcardQuestions: FlashcardQuestion[] = seededQuestions.map(
      (q, i) => ({
        id: q.id,
        content: q.content,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        difficulty: q.difficulty,
        order: i + 1,
      }),
    )

    return {
      id: data.sessionId,
      section: section as unknown as FlashcardSession["section"],
      questions: flashcardQuestions,
    }
  })

/** Seeded random selection for reproducible sessions */
function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

function selectRandomItemsWithSeed<T>(
  array: T[],
  count: number,
  seed: number,
): T[] {
  const random = seededRandom(seed)
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled.slice(0, Math.min(count, shuffled.length))
}
