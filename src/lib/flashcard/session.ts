import type { FlashcardSession } from "./types"

const STORAGE_PREFIX = "triviamore_guest_flashcard_"

export function setGuestFlashcardSession(
  sessionId: string,
  session: FlashcardSession,
): void {
  if (typeof window === "undefined") return
  sessionStorage.setItem(STORAGE_PREFIX + sessionId, JSON.stringify(session))
}

export function getGuestFlashcardSession(
  sessionId: string,
): FlashcardSession | null {
  if (typeof window === "undefined") return null
  const raw = sessionStorage.getItem(STORAGE_PREFIX + sessionId)
  if (!raw) return null
  try {
    return JSON.parse(raw) as FlashcardSession
  } catch {
    return null
  }
}

export function clearGuestFlashcardSession(sessionId: string): void {
  if (typeof window === "undefined") return
  sessionStorage.removeItem(STORAGE_PREFIX + sessionId)
}
