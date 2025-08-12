"use client";

import { User } from "next-auth";

import { Quiz } from "@/lib/types/quiz.types";
import {
	clearQuizDataFromSession,
	getQuizDataFromSession,
} from "@/lib/utils/authenticated-quiz";
import { clearQuizSession, getQuizSession } from "@/lib/utils/quiz-session";
import { useVolatileQuery } from "@/providers/react-query-provider";

interface UseQuizProps {
	quizId: string;
	isGuest: boolean;
	user?: User | null;
}

interface QuizData {
	quiz: Quiz;
	attemptId?: string;
}

export function useQuiz({ quizId, isGuest, user }: UseQuizProps) {
	const queryKey = ["quiz", quizId, isGuest ? "guest" : "authenticated"];

	const { data, isLoading, error, refetch } = useVolatileQuery<QuizData, Error>({
		queryKey,
		queryFn: async (): Promise<QuizData> => {
			if (isGuest) {
				return loadGuestQuiz(quizId);
			} else {
				return loadAuthenticatedQuiz(quizId, user);
			}
		},
		retry: 1,
		refetchOnWindowFocus: false,
	});

	return {
		quiz: data?.quiz || null,
		attemptId: data?.attemptId || null,
		isLoading,
		error: error?.message || null,
		refetch,
	};
}

async function loadGuestQuiz(quizId: string): Promise<QuizData> {
	const sessionParams = getQuizSession(quizId);

	if (!sessionParams) {
		throw new Error("Sessione quiz non trovata o scaduta");
	}

	const params = new URLSearchParams({
		sectionId: sessionParams.sectionId,
		...(sessionParams.questionCount && {
			questionCount: sessionParams.questionCount.toString(),
		}),
		...(sessionParams.timeLimit && {
			timeLimit: sessionParams.timeLimit.toString(),
		}),
		...(sessionParams.evaluationModeId && {
			evaluationModeId: sessionParams.evaluationModeId,
		}),
	});

	const response = await fetch(`/api/quiz/guest?${params}`);

	if (!response.ok) {
		throw new Error("Errore nel caricamento del quiz");
	}

	const data = await response.json();

	return {
		quiz: data.quiz,
	};
}

async function loadAuthenticatedQuiz(
	quizId: string,
	user?: User | null
): Promise<QuizData> {
	if (!user?.id) {
		throw new Error("Utente non autenticato");
	}

	const quizData = getQuizDataFromSession(quizId);

	if (!quizData) {
		throw new Error("Quiz non trovato. Avvia un nuovo quiz dalla sezione appropriata.");
	}

	return {
		quiz: quizData.quiz,
		attemptId: quizData.attemptId,
	};
}

export function useQuizCleanup() {
	const clearQuizData = (quizId: string, isGuest: boolean) => {
		if (isGuest) {
			clearQuizSession(quizId);
		} else {
			clearQuizDataFromSession(quizId);
		}
	};

	return { clearQuizData };
}
