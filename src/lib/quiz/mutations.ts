import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"

import { startQuizFn } from "./server"

export function useStartQuiz(onSuccess?: () => void) {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: {
      sectionId: string
      questionCount: number
      timeLimit: number | null
      quizMode: "STUDY" | "EXAM_SIMULATION"
      evaluationModeId?: string
    }) => startQuizFn({ data }),
    onSuccess: (result) => {
      onSuccess?.()
      navigate({ to: "/quiz/$quizId", params: { quizId: result.quizId } })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
