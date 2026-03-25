import type { Quiz } from "./types"

const STORAGE_PREFIX = "triviamore_guest_quiz_"

export function setGuestQuizSession(quizId: string, quiz: Quiz): void {
  if (typeof window === "undefined") return
  sessionStorage.setItem(STORAGE_PREFIX + quizId, JSON.stringify(quiz))
}

export function getGuestQuizSession(quizId: string): Quiz | null {
  if (typeof window === "undefined") return null
  const raw = sessionStorage.getItem(STORAGE_PREFIX + quizId)
  if (!raw) return null
  try {
    return JSON.parse(raw) as Quiz
  } catch {
    return null
  }
}

export function clearGuestQuizSession(quizId: string): void {
  if (typeof window === "undefined") return
  sessionStorage.removeItem(STORAGE_PREFIX + quizId)
}
