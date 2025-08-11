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
	const handleQuizComplete = (results: any) => {
		// Pulisci la sessione
		if (isGuest) {
			clearQuizSession(quizId);
		}

		// Per i guest, mostriamo solo i risultati senza salvare
		if (isGuest) {
			console.log("Quiz completato (guest):", results);
			// TODO: Mostrare risultati inline per guest
			return;
		}

		// Per utenti autenticati, salviamo nel database e navighiamo ai risultati
		// TODO: Implementare salvataggio risultati e navigazione
		console.log("Quiz completato (utente):", results);
		// router.push(`/quiz/results/${attemptId}`);
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
