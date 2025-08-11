"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { Quiz } from "@/lib/types/quiz.types";
import {
	clearQuizDataFromSession,
	getQuizDataFromSession,
} from "@/lib/utils/authenticated-quiz";
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
	const [attemptId, setAttemptId] = useState<string | null>(null);
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
					// Carica quiz per utenti autenticati
					if (!user?.id) {
						throw new Error("Utente non autenticato");
					}

					// Per gli utenti autenticati, i dati vengono caricati tramite API start
					// e poi salvati in sessionStorage dal client che chiama l'API
					const quizData = getQuizDataFromSession(quizId);

					if (quizData) {
						setQuiz(quizData.quiz);
						setAttemptId(quizData.attemptId);
					} else {
						// Se non ci sono dati salvati, significa che l'utente è arrivato direttamente
						// a questa pagina senza aver avviato un quiz
						setError(
							"Quiz non trovato. Avvia un nuovo quiz dalla sezione appropriata."
						);
					}
				}
			} catch (err) {
				console.error("Errore caricamento quiz:", err);
				setError(err instanceof Error ? err.message : "Errore sconosciuto");
			} finally {
				setLoading(false);
			}
		};

		loadQuiz();
	}, [quizId, isGuest, user]);

	const handleQuizComplete = async (results: any) => {
		// Pulisci la sessione per guest
		if (isGuest) {
			clearQuizSession(quizId);
			// Per i guest, i risultati vengono mostrati inline dal QuizContainer
			return;
		}

		// Per utenti autenticati, salviamo nel database e navighiamo ai risultati
		try {
			if (!attemptId) {
				throw new Error("ID tentativo quiz non trovato");
			}

			const response = await fetch("/api/protected/quiz/complete", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					quizAttemptId: attemptId,
					answers: results.answers.map((answer: any) => ({
						questionId: answer.questionId,
						userAnswer: answer.answer, // Mappa 'answer' a 'userAnswer'
						score: answer.score,
					})),
					timeSpent: results.timeSpent,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Errore nel salvataggio risultati");
			}

			// Pulisci i dati del quiz dalla sessione
			clearQuizDataFromSession(quizId);

			// Naviga alla pagina dei risultati
			router.push(`/quiz/results/${attemptId}`);
		} catch (error) {
			console.error("Errore salvataggio risultati:", error);
			setError(
				"Errore nel salvataggio dei risultati. I dati potrebbero non essere stati salvati."
			);
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
			attemptId={attemptId}
			isGuest={isGuest}
			user={user}
			onComplete={handleQuizComplete}
			onExit={handleQuizExit}
		/>
	);
}
