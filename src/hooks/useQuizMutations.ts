"use client";

import { useRouter } from "next/navigation";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface StartQuizParams {
	sectionId: string;
	questionCount?: number;
	timeLimit?: number;
	quizMode: "STUDY" | "EXAM_SIMULATION";
	evaluationModeId: string;
}
interface CompleteQuizParams {
	quizId: string;
	quizAttemptId: string;
	totalScore: number;
	answers: Array<{
		questionId: string;
		userAnswer: string[];
		score: number;
	}>;
	timeSpent: number;
}

const completeQuizFetch = async (
	params: CompleteQuizParams
): Promise<{ redirectUrl: string }> => {
	const response = await fetch("/api/protected/quiz/complete", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(params),
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.error || "Errore nel salvataggio risultati");
	}

	const location = response.headers.get("Location");
	if (!location) {
		throw new Error("Location header mancante nella risposta");
	}

	return {
		redirectUrl: location,
	};
};

const startQuizFetch = async (
	params: StartQuizParams
): Promise<{ redirectUrl: string }> => {
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

	const location = response.headers.get("Location");

	if (!location) {
		throw new Error("Location header mancante nella risposta");
	}

	return { redirectUrl: location };
};

const cancelQuizFetch = async (params: { quizAttemptId: string }): Promise<void> => {
	const response = await fetch("/api/protected/quiz/cancel", {
		method: "DELETE",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(params),
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.error || "Errore nella cancellazione del quiz");
	}
};

export function useQuizMutations(userId: string) {
	const router = useRouter();
	const queryClient = useQueryClient();

	const startQuiz = useMutation({
		mutationFn: startQuizFetch,
		onSuccess: (data: { redirectUrl: string }) => {
			const { redirectUrl } = data;
			router.push(redirectUrl);
		},
		onError: (error: Error) => {
			console.error("Errore nell'avvio del quiz:", error);
			toast.error("Errore nell'avvio del quiz");
		},
	});

	const completeQuiz = useMutation({
		mutationFn: completeQuizFetch,
		onSuccess: (data: { redirectUrl: string }) => {
			const { redirectUrl } = data;
			queryClient.invalidateQueries({ queryKey: ["userProgress", userId] });

			router.push(redirectUrl);
		},
		onError: (error: Error) => {
			console.error("Errore nel completamento del quiz:", error);
			toast.error("Errore nel completamento del quiz");
		},
	});

	const exitQuiz = useMutation({
		mutationFn: cancelQuizFetch,
		onSuccess: () => {
			toast.success("Quiz chiuso con successo");
			router.back();
		},
		onError: (error: Error) => {
			console.error("Errore nella chiusura del quiz:", error);
			toast.error("Errore nella chiusura del quiz");
		},
	});

	return {
		startQuiz,
		completeQuiz,
		exitQuiz,
		isLoading: startQuiz.isPending || completeQuiz.isPending || exitQuiz.isPending,
	};
}
