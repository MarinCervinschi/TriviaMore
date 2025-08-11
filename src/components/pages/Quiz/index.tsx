"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { Quiz } from "@/lib/types/quiz.types";
import { clearQuizSession, getQuizSession } from "@/lib/utils/quiz-session";

import { QuizContainer } from "./QuizContainer";
import { QuizLoader } from "./QuizLoader";

interface QuizPageComponentProps {
	quizId: string;
	isGuest: boolean;
	user?: {
		id: string;
		name?: string | null;
		email?: string | null;
	} | null;
}

export default function QuizPageComponent({
	quizId,
	isGuest,
	user,
}: QuizPageComponentProps) {
	const [quiz, setQuiz] = useState<Quiz | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();

	useEffect(() => {
		const loadQuiz = async () => {
			try {
				setLoading(true);
				setError(null);

				if (isGuest) {
					// Recupera parametri dalla sessione
					const sessionParams = getQuizSession(quizId);

					if (!sessionParams) {
						setError("Sessione quiz non trovata o scaduta");
						return;
					}

					// Carica quiz guest tramite API
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
					setQuiz(data.quiz);
				} else {
					// TODO: Implementare caricamento quiz utenti autenticati
					throw new Error("Quiz utenti non ancora implementato");
				}
			} catch (err) {
				console.error("Errore caricamento quiz:", err);
				setError(err instanceof Error ? err.message : "Errore sconosciuto");
			} finally {
				setLoading(false);
			}
		};

		loadQuiz();
	}, [quizId, isGuest]);
	const handleQuizComplete = async (results: any) => {
		// Pulisci la sessione per guest
		if (isGuest) {
			clearQuizSession(quizId);
			// Per i guest, i risultati vengono mostrati inline dal QuizContainer
			return;
		}

		// Per utenti autenticati, salviamo nel database e navighiamo ai risultati
		try {
			// TODO: Implementare API per salvare risultati utenti autenticati
			/*
			const response = await fetch('/api/quiz/complete', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					quizId: quiz.id,
					userId: user?.id,
					answers: results.answers,
					timeSpent: results.timeSpent,
					totalScore: results.totalScore
				})
			});

			if (!response.ok) {
				throw new Error('Errore nel salvataggio risultati');
			}

			const { attemptId } = await response.json();
			router.push(`/quiz/results/${attemptId}`);
			*/

			console.log("Quiz completato (utente):", results);
			// Per ora, reindirizza alla browse
			router.push("/browse");
		} catch (error) {
			console.error("Errore salvataggio risultati:", error);
			// In caso di errore, mostra comunque i risultati inline
		}
	};

	const handleQuizExit = () => {
		// Torna alla pagina precedente o alla browse
		router.back();
	};

	if (loading) {
		return <QuizLoader />;
	}

	if (error) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
				<div className="text-center">
					<h1 className="mb-4 text-2xl font-bold text-red-600 dark:text-red-400">
						Errore
					</h1>
					<p className="mb-4 text-gray-700 dark:text-gray-300">{error}</p>
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
