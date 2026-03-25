import { queryOptions } from "@tanstack/react-query"

import {
  getEvaluationModesFn,
  getQuizFn,
  getQuizResultsFn,
} from "./server"

export const quizQueries = {
  quiz: (quizId: string) =>
    queryOptions({
      queryKey: ["quiz", quizId],
      queryFn: () => getQuizFn({ data: { quizId } }),
    }),

  results: (attemptId: string) =>
    queryOptions({
      queryKey: ["quiz", "results", attemptId],
      queryFn: () => getQuizResultsFn({ data: { attemptId } }),
    }),

  evaluationModes: () =>
    queryOptions({
      queryKey: ["quiz", "evaluation-modes"],
      queryFn: () => getEvaluationModesFn(),
    }),
}
