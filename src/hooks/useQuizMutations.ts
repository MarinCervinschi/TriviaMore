"use client";

import { useMutation } from "@tanstack/react-query";

interface StartQuizParams {
	sectionId: string;
	questionCount?: number;
	timeLimit?: number;
	quizMode: "STUDY" | "EXAM_SIMULATION";
	evaluationModeId: string;
}

interface StartQuizResponse {
	quizId: string;
	attemptId: string;
	quiz: any;
}

interface CompleteQuizParams {
	quizAttemptId: string;
	answers: Array<{
		questionId: string;
		userAnswer: string;
		score: number;
	}>;
	timeSpent: number;
}

interface CompleteQuizResponse {
	success: boolean;
	data?: any;
	error?: string;
}

/**
 * Hook per la mutation di avvio quiz
 * Gestisce l'avvio di un nuovo quiz per utenti autenticati
 */
export function useStartQuizMutation() {
	return useMutation<StartQuizResponse, Error, StartQuizParams>({
		mutationFn: async (params: StartQuizParams): Promise<StartQuizResponse> => {
			const response = await fetch("/api/protected/quiz/start", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(params),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Errore nell'avvio del quiz");
			}

			const data = await response.json();

			if (!data.quizId || !data.attemptId || !data.quiz) {
				throw new Error("Dati del quiz incompleti ricevuti dal server");
			}

			return data;
		},
		onError: error => {
			console.error("Errore nell'avvio del quiz:", error);
		},
	});
}

interface CompleteQuizParams {
	quizAttemptId: string;
	answers: Array<{
		questionId: string;
		userAnswer: string;
		score: number;
	}>;
	timeSpent: number;
}

interface CompleteQuizResponse {
	success: boolean;
	data?: any;
	error?: string;
}

export function useCompleteQuizMutation() {
	return useMutation<CompleteQuizResponse, Error, CompleteQuizParams>({
		mutationFn: async (params: CompleteQuizParams): Promise<CompleteQuizResponse> => {
			const response = await fetch("/api/protected/quiz/complete", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(params),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Errore nel salvataggio risultati");
			}

			const data = await response.json();
			return {
				success: true,
				data,
			};
		},
		onError: error => {
			console.error("Errore nel completamento del quiz:", error);
		},
	});
}

export function useQuizCompletion() {
	const completeQuizMutation = useCompleteQuizMutation();

	const completeQuiz = async (
		params: CompleteQuizParams,
		options?: {
			onSuccess?: (data: any) => void;
			onError?: (error: Error) => void;
		}
	) => {
		try {
			const result = await completeQuizMutation.mutateAsync(params);
			options?.onSuccess?.(result.data);
			return result;
		} catch (error) {
			options?.onError?.(error as Error);
			throw error;
		}
	};

	return {
		completeQuiz,
		isLoading: completeQuizMutation.isPending,
		error: completeQuizMutation.error?.message || null,
		isError: completeQuizMutation.isError,
		isSuccess: completeQuizMutation.isSuccess,
		reset: completeQuizMutation.reset,
	};
}
