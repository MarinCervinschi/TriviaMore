import { z } from "zod"

export const startFlashcardSchema = z.object({
  sectionId: z.string().uuid(),
  cardCount: z.number().min(1).max(100).default(20),
})

export const sessionIdSchema = z.object({ sessionId: z.string() })

export type StartFlashcardInput = z.infer<typeof startFlashcardSchema>
