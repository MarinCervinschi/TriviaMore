"use client";

import { useRouter } from "next/navigation";

import { User } from "next-auth";

import { useQuizData, useQuizMutations } from "@/hooks";
import { clearQuizSession } from "@/lib/utils/quiz-session";

import { QuizContainer } from "./QuizContainer";
import { QuizLoader } from "./QuizLoader";

interface QuizPageComponentProps {
	quizId: string;
	isGuest: boolean;
	user?: User | null;
}

export default function QuizPageComponent({
	quizId,
	isGuest,
	user,
}: QuizPageComponentProps) {
	const router = useRouter();
	const { completeQuiz, exitQuiz } = useQuizMutations();
	const { data, isLoading, error } = useQuizData(quizId, isGuest);
	const { quiz, attemptId } = data || {};

	const handleQuizComplete = async (results: any) => {
		if (isGuest) {
			clearQuizSession(quizId);
			return;
		}

		if (!attemptId) {
			console.error("ID tentativo quiz non trovato");
			return;
		}

		await completeQuiz.mutateAsync({
			quizId,
			quizAttemptId: attemptId,
			answers: results.answers.map((answer: any) => ({
				questionId: answer.questionId,
				userAnswer: answer.answer,
				score: answer.score,
			})),
			timeSpent: results.timeSpent,
		});
	};

	const handleQuizExit = async () => {
		if (isGuest) {
			clearQuizSession(quizId);
			router.back();
		}

		if (!attemptId) return;

		exitQuiz.mutateAsync({ quizAttemptId: attemptId });
	};
	if (isLoading) {
		return <QuizLoader />;
	}

	if (error) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
				<div className="text-center">
					<h1 className="mb-4 text-2xl font-bold text-red-600 dark:text-red-400">
						Errore
					</h1>
					<p className="mb-4 text-gray-700 dark:text-gray-300">{error.message}</p>
					<button
						onClick={() => router.back()}
						className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
					>
						Torna Indietro
					</button>
				</div>
			</div>
		);
	}

	if (!quiz) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
				<div className="text-center">
					<h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
						Quiz non trovato
					</h1>
					<button
						onClick={() => router.back()}
						className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
					>
						Torna Indietro
					</button>
				</div>
			</div>
		);
	}

	return (
		<QuizContainer
			quiz={quiz}
			isGuest={isGuest}
			user={user}
			onComplete={handleQuizComplete}
			onExit={handleQuizExit}
		/>
	);
}
