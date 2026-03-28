import { queryOptions } from "@tanstack/react-query"

import { STALE_TIME } from "@/lib/shared/cache"

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
      staleTime: STALE_TIME.STANDARD,
    }),

  results: (attemptId: string) =>
    queryOptions({
      queryKey: ["quiz", "results", attemptId],
      queryFn: () => getQuizResultsFn({ data: { attemptId } }),
      staleTime: STALE_TIME.STANDARD,
    }),

  evaluationModes: () =>
    queryOptions({
      queryKey: ["quiz", "evaluation-modes"],
      queryFn: () => getEvaluationModesFn(),
      staleTime: STALE_TIME.SLOW,
    }),
}
