import { queryOptions } from "@tanstack/react-query"

import { STALE_TIME } from "@/lib/shared/cache"

import { getFlashcardSessionFn } from "./server"

export const flashcardQueries = {
  session: (sessionId: string) =>
    queryOptions({
      queryKey: ["flashcard", "session", sessionId],
      queryFn: () => getFlashcardSessionFn({ data: { sessionId } }),
      staleTime: STALE_TIME.STANDARD,
    }),
}
