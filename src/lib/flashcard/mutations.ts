import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"

import { startExamFlashcardFn, startFlashcardFn } from "./server"

export function useStartFlashcard(onSuccess?: () => void) {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: { sectionId: string; cardCount: number }) =>
      startFlashcardFn({ data }),
    onSuccess: (result) => {
      onSuccess?.()
      navigate({
        to: "/flashcard/$sessionId",
        params: { sessionId: result.sessionId },
      })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useStartExamFlashcard(onSuccess?: () => void) {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: { sectionId: string; cardCount: number }) =>
      startExamFlashcardFn({ data }),
    onSuccess: (result) => {
      onSuccess?.()
      navigate({
        to: "/flashcard/$sessionId",
        params: { sessionId: result.sessionId },
      })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
