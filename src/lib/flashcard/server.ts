import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { selectRandomItems } from "@/lib/quiz/randomization"
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
  const { data: section } = await supabase
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
  const { data: questions } = await supabase
    .from("questions")
    .select("id, content, correct_answer, explanation, difficulty")
    .eq("section_id", sectionId)
    .eq("question_type", "SHORT_ANSWER")
  return questions ?? []
}

function buildFlashcardQuestions(
  questions: { id: string; content: string; correct_answer: string[]; explanation: string | null; difficulty: "EASY" | "MEDIUM" | "HARD" }[],
  count: number,
): FlashcardQuestion[] {
  const selected = selectRandomItems(questions, count)
  return selected.map((q, i) => ({
    id: q.id,
    content: q.content,
    correct_answer: q.correct_answer,
    explanation: q.explanation,
    difficulty: q.difficulty,
    order: i + 1,
  }))
}

export const generateGuestFlashcardFn = createServerFn({ method: "GET" })
  .inputValidator(
    (input: { sectionId: string; cardCount?: number }) => input,
  )
  .handler(async ({ data }): Promise<FlashcardSession | null> => {
    const supabase = createServerSupabaseClient()

    const section = await fetchSectionWithChain(supabase, data.sectionId)
    if (!section || !section.is_public) return null

    const questions = await fetchFlashcardQuestions(supabase, data.sectionId)
    if (questions.length === 0) return null

    const count = data.cardCount ?? 20
    const flashcardQuestions = buildFlashcardQuestions(questions, count)

    return {
      id: `guest-${Date.now()}`,
      section: section as unknown as FlashcardSession["section"],
      questions: flashcardQuestions,
    }
  })

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

export const getFlashcardSessionFn = createServerFn({ method: "GET" })
  .inputValidator((input: { sessionId: string }) => input)
  .handler(async ({ data }): Promise<FlashcardSession | null> => {
    const { supabase, user } = await getAuthenticatedUser()
    if (!user) return null

    // Parse session ID: user.{timestamp}.{base64(sectionId:cardCount)}
    const parts = data.sessionId.split(".")
    if (parts.length !== 3 || parts[0] !== "user") return null

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

    const questions = await fetchFlashcardQuestions(supabase, sectionId)
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
