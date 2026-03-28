import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import type { Json } from "@/lib/supabase/database.types"
import { selectRandomItems, shuffleArray } from "./randomization"
import type { EvaluationMode, Quiz, QuizAttemptResult, QuizQuestion } from "./types"

function shuffleJsonOptions(options: Json | null): Json | null {
  if (!Array.isArray(options)) return options
  return shuffleArray(options) as Json[]
}

async function getAuthenticatedUser() {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) return { supabase, user: null }
  return { supabase, user }
}

export const getEvaluationModesFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<EvaluationMode[]> => {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from("evaluation_modes")
      .select("*")
      .order("name")
    if (error) throw new Error(error.message)
    return data ?? []
  },
)

export const startQuizFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      sectionId: z.string(),
      questionCount: z.number().min(1).max(100).default(30),
      timeLimit: z.number().nullable().default(30),
      quizMode: z.enum(["STUDY", "EXAM_SIMULATION"]).default("STUDY"),
      evaluationModeId: z.string().optional(),
    }),
  )
  .handler(
    async ({
      data,
    }): Promise<{ quizId: string; attemptId: string }> => {
      const { supabase, user } = await getAuthenticatedUser()
      if (!user) throw new Error("Non autenticato")

      // Get evaluation mode
      let evalModeId = data.evaluationModeId
      if (!evalModeId) {
        const { data: modes } = await supabase
          .from("evaluation_modes")
          .select("id")
          .limit(1)
          .single()
        if (!modes) throw new Error("Nessuna modalità di valutazione disponibile")
        evalModeId = modes.id
      }

      // Fetch quiz-eligible questions
      let questions: { id: string; options: Json | null }[]

      if (data.quizMode === "EXAM_SIMULATION") {
        // Get all sections in the same class
        const { data: section } = await supabase
          .from("sections")
          .select("class_id")
          .eq("id", data.sectionId)
          .single()
        if (!section) throw new Error("Sezione non trovata")

        const { data: classSections } = await supabase
          .from("sections")
          .select("id")
          .eq("class_id", section.class_id)

        const sectionIds = (classSections ?? []).map((s) => s.id)

        const { data: qs } = await supabase
          .from("questions")
          .select("id, options")
          .in("section_id", sectionIds)
          .in("question_type", ["MULTIPLE_CHOICE", "TRUE_FALSE"])

        questions = qs ?? []
      } else {
        const { data: qs } = await supabase
          .from("questions")
          .select("id, options")
          .eq("section_id", data.sectionId)
          .in("question_type", ["MULTIPLE_CHOICE", "TRUE_FALSE"])

        questions = qs ?? []
      }

      if (questions.length === 0)
        throw new Error("Nessuna domanda disponibile per il quiz")

      // Select random subset
      const selected = selectRandomItems(questions, data.questionCount)

      // Create quiz
      const quizId = crypto.randomUUID()
      const { error: quizError } = await supabase.from("quizzes").insert({
        id: quizId,
        section_id: data.sectionId,
        evaluation_mode_id: evalModeId,
        quiz_mode: data.quizMode,
        time_limit: data.timeLimit,
      })
      if (quizError) throw new Error(quizError.message)

      // Create quiz_questions with shuffled options stored in order
      const quizQuestions = selected.map((q, index) => ({
        id: crypto.randomUUID(),
        quiz_id: quizId,
        question_id: q.id,
        order: index + 1,
      }))

      const { error: qqError } = await supabase
        .from("quiz_questions")
        .insert(quizQuestions)
      if (qqError) throw new Error(qqError.message)

      // Create quiz_attempt
      const attemptId = crypto.randomUUID()
      const { error: attemptError } = await supabase
        .from("quiz_attempts")
        .insert({
          id: attemptId,
          user_id: user.id,
          quiz_id: quizId,
          score: 0,
        })
      if (attemptError) throw new Error(attemptError.message)

      return { quizId, attemptId }
    },
  )

export const getQuizFn = createServerFn({ method: "GET" })
  .inputValidator((input: { quizId: string }) => input)
  .handler(async ({ data }): Promise<Quiz | null> => {
    const { supabase, user } = await getAuthenticatedUser()
    if (!user) return null

    // Get quiz with section chain
    const { data: quiz } = await supabase
      .from("quizzes")
      .select(
        "*, section:sections(id, name, class:classes(name, course:courses(name, department:departments(name)))), evaluation_mode:evaluation_modes(*)",
      )
      .eq("id", data.quizId)
      .single()

    if (!quiz) return null

    // Get quiz questions in order
    const { data: quizQuestions } = await supabase
      .from("quiz_questions")
      .select("question_id, order")
      .eq("quiz_id", data.quizId)
      .order("order")

    if (!quizQuestions || quizQuestions.length === 0) return null

    // Get full question data
    const questionIds = quizQuestions.map((qq) => qq.question_id)
    const { data: questions } = await supabase
      .from("questions")
      .select("*")
      .in("id", questionIds)

    if (!questions) return null

    // Order questions and shuffle options
    const orderedQuestions: QuizQuestion[] = quizQuestions.map((qq) => {
      const q = questions.find((q) => q.id === qq.question_id)!
      return {
        id: q.id,
        content: q.content,
        question_type: q.question_type,
        options: shuffleJsonOptions(q.options),
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        difficulty: q.difficulty,
        order: qq.order,
      }
    })

    // Get attempt ID
    const { data: attempt } = await supabase
      .from("quiz_attempts")
      .select("id")
      .eq("quiz_id", data.quizId)
      .eq("user_id", user.id)
      .is("completed_at", null)
      .single()

    return {
      id: quiz.id,
      time_limit: quiz.time_limit,
      quiz_mode: quiz.quiz_mode,
      evaluation_mode: quiz.evaluation_mode as unknown as EvaluationMode,
      section: quiz.section as unknown as Quiz["section"],
      questions: orderedQuestions,
      attempt_id: attempt?.id,
    }
  })

export const completeQuizFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      quizAttemptId: z.string(),
      answers: z.array(
        z.object({
          questionId: z.string(),
          userAnswer: z.array(z.string()),
          score: z.number(),
        }),
      ),
      totalScore: z.number(),
      timeSpent: z.number(),
    }),
  )
  .handler(async ({ data }): Promise<{ attemptId: string }> => {
    const { supabase, user } = await getAuthenticatedUser()
    if (!user) throw new Error("Non autenticato")

    // Verify attempt belongs to user and not completed
    const { data: attempt } = await supabase
      .from("quiz_attempts")
      .select("id, quiz_id, user_id, completed_at")
      .eq("id", data.quizAttemptId)
      .single()

    if (!attempt) throw new Error("Tentativo non trovato")
    if (attempt.user_id !== user.id) throw new Error("Non autorizzato")
    if (attempt.completed_at) throw new Error("Quiz già completato")

    // Insert answer attempts
    const answerAttempts = data.answers.map((a) => ({
      id: crypto.randomUUID(),
      quiz_attempt_id: data.quizAttemptId,
      question_id: a.questionId,
      user_answer: a.userAnswer,
      score: a.score,
    }))

    const { error: answersError } = await supabase
      .from("answer_attempts")
      .insert(answerAttempts)
    if (answersError) throw new Error(answersError.message)

    // Update quiz attempt
    const { error: updateError } = await supabase
      .from("quiz_attempts")
      .update({
        score: data.totalScore,
        time_spent: data.timeSpent,
        completed_at: new Date().toISOString(),
      })
      .eq("id", data.quizAttemptId)
    if (updateError) throw new Error(updateError.message)

    // Update progress
    const { data: quiz } = await supabase
      .from("quizzes")
      .select("section_id, quiz_mode")
      .eq("id", attempt.quiz_id)
      .single()

    if (quiz) {
      const { data: existingProgress } = await supabase
        .from("progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("section_id", quiz.section_id)
        .eq("quiz_mode", quiz.quiz_mode)
        .maybeSingle()

      if (existingProgress) {
        const newQuizzesTaken = existingProgress.quizzes_taken + 1
        const newAvg =
          ((existingProgress.average_score ?? 0) *
            existingProgress.quizzes_taken +
            data.totalScore) /
          newQuizzesTaken
        const newBest = Math.max(
          existingProgress.best_score ?? 0,
          data.totalScore,
        )

        const { error: progressError } = await supabase
          .from("progress")
          .update({
            quizzes_taken: newQuizzesTaken,
            average_score: Math.round(newAvg * 100) / 100,
            best_score: newBest,
            total_time_spent:
              existingProgress.total_time_spent + data.timeSpent,
            last_accessed_at: new Date().toISOString(),
          })
          .eq("id", existingProgress.id)
        if (progressError) throw new Error("Errore nell'aggiornamento del progresso")
      } else {
        const { error: progressError } = await supabase.from("progress").insert({
          id: crypto.randomUUID(),
          user_id: user.id,
          section_id: quiz.section_id,
          quiz_mode: quiz.quiz_mode,
          quizzes_taken: 1,
          average_score: data.totalScore,
          best_score: data.totalScore,
          total_time_spent: data.timeSpent,
        })
        if (progressError) throw new Error("Errore nel salvataggio del progresso")
      }
    }

    return { attemptId: data.quizAttemptId }
  })

export const cancelQuizFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ quizAttemptId: z.string() }))
  .handler(async ({ data }) => {
    const { supabase, user } = await getAuthenticatedUser()
    if (!user) throw new Error("Non autenticato")

    // Get attempt to find quiz ID
    const { data: attempt } = await supabase
      .from("quiz_attempts")
      .select("id, quiz_id, user_id")
      .eq("id", data.quizAttemptId)
      .single()

    if (!attempt || attempt.user_id !== user.id) return

    // Delete the attempt
    await supabase
      .from("quiz_attempts")
      .delete()
      .eq("id", data.quizAttemptId)

    // Check if quiz has other attempts
    const { count } = await supabase
      .from("quiz_attempts")
      .select("*", { count: "exact", head: true })
      .eq("quiz_id", attempt.quiz_id)

    // If no other attempts, delete the quiz (cascades to quiz_questions)
    if ((count ?? 0) === 0) {
      await supabase
        .from("quiz_questions")
        .delete()
        .eq("quiz_id", attempt.quiz_id)
      await supabase.from("quizzes").delete().eq("id", attempt.quiz_id)
    }
  })

export const getQuizResultsFn = createServerFn({ method: "GET" })
  .inputValidator((input: { attemptId: string }) => input)
  .handler(async ({ data }): Promise<QuizAttemptResult | null> => {
    const { supabase, user } = await getAuthenticatedUser()
    if (!user) return null

    // Get attempt with quiz info
    const { data: attempt } = await supabase
      .from("quiz_attempts")
      .select(
        "id, score, time_spent, completed_at, quiz:quizzes(id, quiz_mode, time_limit, section:sections(id, name, class:classes(name, course:courses(name, department:departments(name)))), evaluation_mode:evaluation_modes(*))",
      )
      .eq("id", data.attemptId)
      .eq("user_id", user.id)
      .single()

    if (!attempt || !attempt.completed_at) return null

    // Get quiz questions in order
    const quizId = (attempt.quiz as unknown as { id: string }).id
    const { data: quizQuestions } = await supabase
      .from("quiz_questions")
      .select("question_id, order")
      .eq("quiz_id", quizId)
      .order("order")

    if (!quizQuestions) return null

    const questionIds = quizQuestions.map((qq) => qq.question_id)
    const { data: questions } = await supabase
      .from("questions")
      .select("*")
      .in("id", questionIds)

    // Get answer attempts
    const { data: answers } = await supabase
      .from("answer_attempts")
      .select("question_id, user_answer, score")
      .eq("quiz_attempt_id", data.attemptId)

    // Order questions by quiz order
    const orderedQuestions = quizQuestions
      .map((qq) => questions?.find((q) => q.id === qq.question_id))
      .filter((q): q is NonNullable<typeof q> => Boolean(q))

    const quiz = attempt.quiz as unknown as {
      id: string
      quiz_mode: "STUDY" | "EXAM_SIMULATION"
      time_limit: number | null
      section: QuizAttemptResult["quiz"]["section"]
      evaluation_mode: EvaluationMode
    }

    return {
      id: attempt.id,
      score: attempt.score,
      time_spent: attempt.time_spent,
      completed_at: attempt.completed_at,
      quiz: {
        id: quiz.id,
        quiz_mode: quiz.quiz_mode,
        time_limit: quiz.time_limit,
        section: quiz.section,
        evaluation_mode: quiz.evaluation_mode,
        questions: orderedQuestions as QuizAttemptResult["quiz"]["questions"],
      },
      answers: (answers ?? []) as QuizAttemptResult["answers"],
    }
  })
