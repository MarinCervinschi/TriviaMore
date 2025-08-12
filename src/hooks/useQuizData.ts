"use client";

import { Quiz } from "@/lib/types/quiz.types";
import { getQuizSession } from "@/lib/utils/quiz-session";
import { useVolatileQuery } from "@/providers/react-query-provider";

interface QuizData {
	quiz: Quiz;
	attemptId?: string;
}

const fetchUserQuiz = async (quizId: string): Promise<QuizData> => {
	try {
		const response = await fetch(`/api/protected/quiz?quizId=${quizId}`);

		if (!response.ok) {
			throw new Error("Errore nel caricamento del quiz per l'utente");
		}

		return await response.json();
	} catch (error) {
		throw new Error("Errore nel caricamento del quiz per l'utente: " + error);
	}
};

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

export const useQuizData = (quizId: string, isGuest: boolean) => {
	return useVolatileQuery<QuizData>({
		queryKey: ["quiz", quizId],
		queryFn: () => (isGuest ? loadGuestQuiz(quizId) : fetchUserQuiz(quizId)),
		retry: 1,
		refetchOnWindowFocus: false,
	});
};
