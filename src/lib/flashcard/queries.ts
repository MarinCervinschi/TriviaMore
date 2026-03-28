import { queryOptions } from "@tanstack/react-query"

import { getFlashcardSessionFn } from "./server"

export const flashcardQueries = {
  session: (sessionId: string) =>
    queryOptions({
      queryKey: ["flashcard", "session", sessionId],
      queryFn: () => getFlashcardSessionFn({ data: { sessionId } }),
    }),
}
