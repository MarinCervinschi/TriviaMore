"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { CheckCircle, Clock, RotateCcw, Trophy, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface QuizResultsPageComponentProps {
	attemptId: string;
	user: {
		id: string;
		name?: string | null;
		email?: string | null;
	};
}

interface QuizResults {
	id: string;
	score: number;
	totalQuestions: number;
	correctAnswers: number;
	timeSpent: number;
	quiz: {
		section: {
			name: string;
			class: {
				name: string;
				course: {
					name: string;
				};
			};
		};
	};
	answers: Array<{
		questionId: string;
		userAnswer: string[];
		isCorrect: boolean;
		score: number;
		question: {
			content: string;
			correctAnswer: string[];
		};
	}>;
}

export default function QuizResultsPageComponent({
	attemptId,
	user,
}: QuizResultsPageComponentProps) {
	const [results, setResults] = useState<QuizResults | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();

	useEffect(() => {
		const loadResults = async () => {
			try {
				setLoading(true);
				// TODO: Chiamare API per recuperare risultati
				// const response = await fetch(`/api/quiz/results/${attemptId}`);
				// const data = await response.json();
				// setResults(data);

				// Placeholder per ora
				setError("Funzionalità non ancora implementata");
			} catch (err) {
				console.error("Errore caricamento risultati:", err);
				setError(err instanceof Error ? err.message : "Errore sconosciuto");
			} finally {
				setLoading(false);
			}
		};

		loadResults();
	}, [attemptId]);

	const formatTime = (milliseconds: number) => {
		const seconds = Math.floor(milliseconds / 1000);
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	const getScoreColor = (percentage: number) => {
		if (percentage >= 90) return "text-green-600 dark:text-green-400";
		if (percentage >= 70) return "text-blue-600 dark:text-blue-400";
		if (percentage >= 60) return "text-yellow-600 dark:text-yellow-400";
		return "text-red-600 dark:text-red-400";
	};

	const getScoreBadge = (percentage: number) => {
		if (percentage >= 90)
			return {
				label: "Eccellente",
				color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
			};
		if (percentage >= 70)
			return {
				label: "Buono",
				color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
			};
		if (percentage >= 60)
			return {
				label: "Sufficiente",
				color:
					"bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
			};
		return {
			label: "Insufficiente",
			color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
		};
	};

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
				<div className="text-center">
					<Trophy className="mx-auto mb-4 h-12 w-12 text-blue-600 dark:text-blue-400" />
					<h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
						Caricamento Risultati
					</h2>
					<p className="text-gray-600 dark:text-gray-400">
						Stiamo preparando i tuoi risultati...
					</p>
				</div>
			</div>
		);
	}

	if (error || !results) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
				<div className="text-center">
					<XCircle className="mx-auto mb-4 h-12 w-12 text-red-600 dark:text-red-400" />
					<h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
						Errore
					</h2>
					<p className="mb-4 text-gray-600 dark:text-gray-400">
						{error || "Risultati non trovati"}
					</p>
					<Button onClick={() => router.push("/browse")}>Torna alla Browse</Button>
				</div>
			</div>
		);
	}

	const percentage = Math.round(
		(results.correctAnswers / results.totalQuestions) * 100
	);
	const scoreBadge = getScoreBadge(percentage);

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
			<div className="mx-auto max-w-4xl px-4 py-8">
				{/* Header */}
				<div className="mb-8 text-center">
					<Trophy className={`mx-auto mb-4 h-16 w-16 ${getScoreColor(percentage)}`} />
					<h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
						Quiz Completato!
					</h1>
					<p className="text-lg text-gray-600 dark:text-gray-400">
						{results.quiz.section.name}
					</p>
					<p className="text-gray-500 dark:text-gray-500">
						{results.quiz.section.class.course.name} - {results.quiz.section.class.name}
					</p>
				</div>

				{/* Risultati Principali */}
				<Card className="mb-8">
					<CardHeader>
						<div className="flex items-center justify-between">
							<h2 className="text-xl font-semibold">I Tuoi Risultati</h2>
							<Badge className={scoreBadge.color}>{scoreBadge.label}</Badge>
						</div>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
							<div className="text-center">
								<div className={`text-3xl font-bold ${getScoreColor(percentage)}`}>
									{percentage}%
								</div>
								<p className="text-sm text-gray-600 dark:text-gray-400">Punteggio</p>
							</div>
							<div className="text-center">
								<div className="text-3xl font-bold text-gray-900 dark:text-white">
									{results.correctAnswers}/{results.totalQuestions}
								</div>
								<p className="text-sm text-gray-600 dark:text-gray-400">
									Risposte Corrette
								</p>
							</div>
							<div className="text-center">
								<div className="flex items-center justify-center text-3xl font-bold text-gray-900 dark:text-white">
									<Clock className="mr-1 h-6 w-6" />
									{formatTime(results.timeSpent)}
								</div>
								<p className="text-sm text-gray-600 dark:text-gray-400">
									Tempo Impiegato
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Revisione Risposte */}
				<Card className="mb-8">
					<CardHeader>
						<h2 className="text-xl font-semibold">Revisione Risposte</h2>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{results.answers.map((answer, index) => (
								<div key={answer.questionId} className="rounded-lg border p-4">
									<div className="mb-2 flex items-start justify-between">
										<div className="flex-1">
											<p className="font-medium text-gray-900 dark:text-white">
												Domanda {index + 1}
											</p>
											<p className="mt-1 text-gray-700 dark:text-gray-300">
												{answer.question.content}
											</p>
										</div>
										{answer.isCorrect ? (
											<CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
										) : (
											<XCircle className="mt-1 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
										)}
									</div>
									<div className="text-sm">
										<p className="text-gray-600 dark:text-gray-400">
											Tua risposta: {answer.userAnswer.join(", ")}
										</p>
										{!answer.isCorrect && (
											<p className="text-green-600 dark:text-green-400">
												Risposta corretta: {answer.question.correctAnswer.join(", ")}
											</p>
										)}
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				{/* Azioni */}
				<div className="flex flex-col justify-center gap-4 sm:flex-row">
					<Button
						onClick={() => router.push("/browse")}
						variant="outline"
						className="flex items-center"
					>
						<RotateCcw className="mr-2 h-4 w-4" />
						Torna alla Browse
					</Button>
					<Button
						onClick={() => {
							// TODO: Implementare retry quiz
							console.log("Rifai quiz");
						}}
						className="flex items-center"
					>
						<Trophy className="mr-2 h-4 w-4" />
						Rifai Quiz
					</Button>
				</div>
			</div>
		</div>
	);
}
