import { queryOptions } from "@tanstack/react-query";

import { STALE_TIME } from "@/lib/shared/cache";

import {
	getEvaluationModesFn,
	getOpenAttemptFn,
	getQuizFn,
	getQuizResultsFn,
} from "./api";

export const quizQueries = {
	openAttempt: () =>
		queryOptions({
			queryKey: ["quiz", "open-attempt"],
			queryFn: () => getOpenAttemptFn(),
			staleTime: STALE_TIME.FAST,
		}),

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
};
