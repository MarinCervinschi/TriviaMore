import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"

import { createServerSupabaseClient, quizQuery } from "@/lib/supabase/server"
import type {
  RecentClass,
  RecentQuizAttempt,
  UserBookmark,
  UserClass,
  UserProfile,
  UserProgress,
  UserStats,
} from "./types"

// Helper: get authenticated user or return null
async function getAuthenticatedUser() {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) return { supabase, user: null }
  return { supabase, user }
}

export const getUserProfileFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<UserProfile | null> => {
    const { supabase, user } = await getAuthenticatedUser()
    if (!user) return null

    // Fetch profile + counts + recent data in parallel
    const [
      profileResult,
      quizAttemptsCount,
      userClassesCount,
      bookmarksCount,
      progressResult,
      recentClassesResult,
      recentAttemptsResult,
    ] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      quizQuery(supabase)
        .from("quiz_attempts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .not("completed_at", "is", null),
      supabase
        .from("user_classes")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id),
      supabase
        .from("bookmarks")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id),
      supabase
        .from("progress")
        .select("quizzes_taken, average_score")
        .eq("user_id", user.id),
      supabase
        .from("user_recent_classes_detail")
        .select("*")
        .eq("user_id", user.id)
        .order("last_visited", { ascending: false })
        .limit(6),
      quizQuery(supabase)
        .from("quiz_attempts_detail")
        .select("*")
        .eq("user_id", user.id)
        .not("completed_at", "is", null)
        .order("completed_at", { ascending: false })
        .limit(3),
    ])

    if (profileResult.error || !profileResult.data) return null

    // Calculate stats from progress data
    const progressData = progressResult.data ?? []
    const totalQuizzes = progressData.reduce(
      (sum, p) => sum + p.quizzes_taken,
      0,
    )
    const scores = progressData
      .map((p) => p.average_score)
      .filter((s): s is number => s !== null && s > 0)
    const averageScore =
      scores.length > 0
        ? Math.round(
            (scores.reduce((sum, s) => sum + s, 0) / scores.length) * 100,
          ) / 100
        : 0

    const stats: UserStats = {
      quiz_attempts_count: quizAttemptsCount.count ?? 0,
      user_classes_count: userClassesCount.count ?? 0,
      bookmarks_count: bookmarksCount.count ?? 0,
      total_quizzes: totalQuizzes,
      average_score: averageScore,
    }

    const recent_classes: RecentClass[] = (recentClassesResult.data ?? []).map((r) => ({
      last_visited: r.last_visited!,
      visit_count: r.visit_count!,
      class_id: r.class_id!,
      class_name: r.class_name!,
      class_code: r.class_code,
      class_year: r.class_year,
      mandatory: r.mandatory,
      catalogue_url: r.catalogue_url,
      curriculum: r.curriculum,
      course_id: r.course_id!,
      course_name: r.course_name!,
      course_code: r.course_code!,
      course_type: r.course_type!,
      department_id: r.department_id!,
      department_name: r.department_name!,
      department_code: r.department_code!,
    }))

    const recent_quiz_attempts: RecentQuizAttempt[] = (recentAttemptsResult.data ?? []).map((a) => ({
      id: a.id!,
      score: a.score!,
      completed_at: a.completed_at!,
      section_id: a.section_id!,
      section_name: a.section_name!,
      class_id: a.class_id!,
      class_name: a.class_name!,
      course_id: a.course_id!,
      course_name: a.course_name!,
      department_id: a.department_id!,
      department_name: a.department_name!,
    }))

    return {
      ...profileResult.data,
      stats,
      recent_classes,
      recent_quiz_attempts,
    }
  },
)

export const getUserClassesFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<UserClass[]> => {
    const { supabase, user } = await getAuthenticatedUser()
    if (!user) return []

    const { data, error } = await supabase
      .from("user_classes_detail")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) throw new Error(error.message)
    return (data ?? []).map((r) => ({
      created_at: r.created_at!,
      class_id: r.class_id!,
      class_name: r.class_name!,
      class_code: r.class_code,
      class_year: r.class_year,
      mandatory: r.mandatory,
      catalogue_url: r.catalogue_url,
      curriculum: r.curriculum,
      course_id: r.course_id!,
      course_name: r.course_name!,
      course_code: r.course_code!,
      course_type: r.course_type!,
      department_id: r.department_id!,
      department_name: r.department_name!,
      department_code: r.department_code!,
    })) satisfies UserClass[]
  },
)

export const addUserClassFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ classId: z.string(), courseId: z.string() }))
  .handler(async ({ data }) => {
    const { supabase, user } = await getAuthenticatedUser()
    if (!user) throw new Error("Non autenticato")

    const { error } = await supabase
      .from("user_classes")
      .insert({ user_id: user.id, class_id: data.classId, course_id: data.courseId })

    if (error) {
      if (error.code === "23505")
        throw new Error("La classe è già nella tua lista")
      throw new Error(error.message)
    }

    return { success: true }
  })

export const removeUserClassFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ classId: z.string() }))
  .handler(async ({ data }) => {
    const { supabase, user } = await getAuthenticatedUser()
    if (!user) throw new Error("Non autenticato")

    const { error } = await supabase
      .from("user_classes")
      .delete()
      .eq("user_id", user.id)
      .eq("class_id", data.classId)

    if (error) throw new Error(error.message)
    return { success: true }
  })

export const isClassSavedFn = createServerFn({ method: "GET" })
  .inputValidator((input: { classId: string }) => input)
  .handler(async ({ data }): Promise<boolean> => {
    const { supabase, user } = await getAuthenticatedUser()
    if (!user) return false

    const { count } = await supabase
      .from("user_classes")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("class_id", data.classId)

    return (count ?? 0) > 0
  })

export const getUserBookmarksFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<UserBookmark[]> => {
    const { supabase, user } = await getAuthenticatedUser()
    if (!user) return []

    const { data, error } = await supabase
      .from("bookmarks_detail")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) throw new Error(error.message)
    return (data ?? []).map((r) => ({
      question_id: r.question_id!,
      created_at: r.created_at!,
      content: r.content!,
      question_type: r.question_type!,
      options: r.options,
      correct_answer: r.correct_answer!,
      explanation: r.explanation,
      difficulty: r.difficulty!,
      section_id: r.section_id!,
      section_name: r.section_name!,
      class_id: r.class_id!,
      class_name: r.class_name!,
      course_id: r.course_id!,
      course_name: r.course_name!,
      department_id: r.department_id!,
      department_name: r.department_name!,
    })) satisfies UserBookmark[]
  },
)

export const toggleBookmarkFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ questionId: z.string() }))
  .handler(
    async ({ data }): Promise<{ action: "added" | "removed" }> => {
      const { supabase, user } = await getAuthenticatedUser()
      if (!user) throw new Error("Non autenticato")

      // Check if bookmark exists
      const { data: existing } = await supabase
        .from("bookmarks")
        .select("question_id")
        .eq("user_id", user.id)
        .eq("question_id", data.questionId)
        .maybeSingle()

      if (existing) {
        const { error } = await supabase
          .from("bookmarks")
          .delete()
          .eq("user_id", user.id)
          .eq("question_id", data.questionId)
        if (error) throw new Error(error.message)
        return { action: "removed" }
      } else {
        const { error } = await supabase
          .from("bookmarks")
          .insert({ user_id: user.id, question_id: data.questionId })
        if (error) throw new Error(error.message)
        return { action: "added" }
      }
    },
  )

export const getUserProgressFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<UserProgress[]> => {
    const { supabase, user } = await getAuthenticatedUser()
    if (!user) return []

    const { data, error } = await supabase
      .from("progress_detail")
      .select("*")
      .eq("user_id", user.id)
      .order("last_accessed_at", { ascending: false })

    if (error) throw new Error(error.message)
    return (data ?? []).map((r) => ({
      id: r.id!,
      quiz_mode: r.quiz_mode!,
      quizzes_taken: r.quizzes_taken!,
      average_score: r.average_score,
      best_score: r.best_score,
      total_time_spent: r.total_time_spent!,
      last_accessed_at: r.last_accessed_at!,
      section_id: r.section_id!,
      section_name: r.section_name!,
      class_id: r.class_id!,
      class_name: r.class_name!,
      course_id: r.course_id!,
      course_name: r.course_name!,
      department_id: r.department_id!,
      department_name: r.department_name!,
    })) satisfies UserProgress[]
  },
)

export const getRecentClassesFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<RecentClass[]> => {
    const { supabase, user } = await getAuthenticatedUser()
    if (!user) return []

    const { data, error } = await supabase
      .from("user_recent_classes_detail")
      .select("*")
      .eq("user_id", user.id)
      .order("last_visited", { ascending: false })
      .limit(6)

    if (error) throw new Error(error.message)
    return (data ?? []) as unknown as RecentClass[]
  },
)

export const updateProfileFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      name: z.string().min(1, "Il nome è obbligatorio").max(100),
      image: z.string().url().nullable().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { supabase, user } = await getAuthenticatedUser()
    if (!user) throw new Error("Non autenticato")

    const { error } = await supabase
      .from("profiles")
      .update({
        name: data.name,
        image: data.image ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (error) throw new Error(error.message)

    // Also update Supabase auth metadata
    await supabase.auth.updateUser({
      data: { name: data.name },
    })

    return { success: true }
  })

// TODO: implement deleteAccountFn with proper RLS DELETE policies

export const updateRecentClassFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ classId: z.string(), courseId: z.string() }))
  .handler(async ({ data }) => {
    const { supabase, user } = await getAuthenticatedUser()
    if (!user) return

    // Upsert: update visit_count + last_visited if exists, otherwise insert
    const { data: existing } = await supabase
      .from("user_recent_classes")
      .select("visit_count")
      .eq("user_id", user.id)
      .eq("class_id", data.classId)
      .maybeSingle()

    if (existing) {
      await supabase
        .from("user_recent_classes")
        .update({
          last_visited: new Date().toISOString(),
          visit_count: existing.visit_count + 1,
          course_id: data.courseId,
        })
        .eq("user_id", user.id)
        .eq("class_id", data.classId)
    } else {
      await supabase.from("user_recent_classes").insert({
        user_id: user.id,
        class_id: data.classId,
        course_id: data.courseId,
        last_visited: new Date().toISOString(),
        visit_count: 1,
      })
    }
  })
