"use client";

import { useRouter } from "next/navigation";

import { User } from "next-auth";
import { toast } from "sonner";

import { useQuiz, useQuizCleanup, useQuizCompletion, useQuizExit } from "@/hooks";

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
	const { clearQuizData } = useQuizCleanup();
	const { completeQuiz, error: completionError } = useQuizCompletion();
	const { exitQuiz } = useQuizExit();

	const { quiz, attemptId, isLoading, error } = useQuiz({
		quizId,
		isGuest,
		user,
	});

	const handleQuizComplete = async (results: any) => {
		if (isGuest) {
			clearQuizData(quizId, true);
			return;
		}

		if (!attemptId) {
			console.error("ID tentativo quiz non trovato");
			return;
		}

		try {
			await completeQuiz(
				{
					quizAttemptId: attemptId,
					answers: results.answers.map((answer: any) => ({
						questionId: answer.questionId,
						userAnswer: answer.answer,
						score: answer.score,
					})),
					timeSpent: results.timeSpent,
				},
				{
					onSuccess: redirectUrl => {
						clearQuizData(quizId, false);
						const targetUrl = redirectUrl || `/quiz/results/${attemptId}`;
						router.push(targetUrl);
					},
					onError: error => {
						console.error("Errore nel completamento del quiz:", error);
						toast.error("Errore nel completamento del quiz");
					},
				}
			);
		} catch (error) {
			console.error("Errore nel completamento del quiz:", error);
			toast.error("Errore nel completamento del quiz");
		}
	};

	const handleQuizExit = async () => {
		try {
			await exitQuiz(isGuest, attemptId, {
				onSuccess: () => {
					clearQuizData(quizId, isGuest);
					router.back();
				},
				onError: error => {
					console.error("Errore nell'uscita dal quiz:", error);
					toast.error("Errore nell'uscita dal quiz");
					router.back();
				},
			});
		} catch (error) {
			console.error("Errore nell'uscita dal quiz:", error);
			router.back();
		}
	};

	if (isLoading) {
		return <QuizLoader />;
	}

	if (error || completionError) {
		const displayError = error || completionError;
		return (
			<div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
				<div className="text-center">
					<h1 className="mb-4 text-2xl font-bold text-red-600 dark:text-red-400">
						Errore
					</h1>
					<p className="mb-4 text-gray-700 dark:text-gray-300">{displayError}</p>
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
