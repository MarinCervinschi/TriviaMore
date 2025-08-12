"use client";

import { CheckCircle, Clock, Home, RotateCcw, Trophy, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";

interface QuizResultsProps {
	results: {
		totalScore: number;
		correctAnswers: number;
		totalQuestions: number;
		timeSpent: number;
		answers: Array<{
			questionId: string;
			userAnswer: string[];
			isCorrect?: boolean;
			score?: number;
		}>;
		evaluationMode?: {
			name: string;
			description?: string;
			correctAnswerPoints: number;
			incorrectAnswerPoints: number;
			partialCreditEnabled: boolean;
		};
	};
	questions: Array<{
		id: string;
		content: string;
		correctAnswer: string[];
		options?: string[];
	}>;
	quizTitle: string;
	onExit: () => void;
	onRetry?: () => void;
	showRetry?: boolean;
}

export function QuizResults({
	results,
	questions,
	quizTitle,
	onExit,
	onRetry,
	showRetry = false,
}: QuizResultsProps) {
	const percentage = Math.round(
		(results.correctAnswers / results.totalQuestions) * 100
	);

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

	const getPointsColor = (points: number) => {
		if (points > 0) return "text-green-600 dark:text-green-400";
		if (points < 0) return "text-red-600 dark:text-red-400";
		return "text-gray-600 dark:text-gray-400";
	};

	// Funzione per determinare il colore di un'opzione
	const getOptionStyle = (
		option: string,
		userAnswers: string[],
		correctAnswers: string[]
	) => {
		const isUserAnswer = userAnswers.includes(option);
		const isCorrect = correctAnswers.includes(option);

		if (isCorrect && isUserAnswer) {
			// Risposta corretta data dall'utente
			return "bg-green-100 border-green-500 text-green-800 dark:bg-green-900/20 dark:border-green-400 dark:text-green-300";
		} else if (isCorrect && !isUserAnswer) {
			// Risposta corretta non data dall'utente
			return "bg-blue-100 border-blue-500 text-blue-800 dark:bg-blue-900/20 dark:border-blue-400 dark:text-blue-300";
		} else if (!isCorrect && isUserAnswer) {
			// Risposta sbagliata data dall'utente
			return "bg-red-100 border-red-500 text-red-800 dark:bg-red-900/20 dark:border-red-400 dark:text-red-300";
		} else {
			// Risposta non data e non corretta
			return "bg-gray-100 border-gray-300 text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300";
		}
	};

	const getOptionIcon = (
		option: string,
		userAnswers: string[],
		correctAnswers: string[]
	) => {
		const isUserAnswer = userAnswers.includes(option);
		const isCorrect = correctAnswers.includes(option);

		if (isCorrect && isUserAnswer) {
			return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />;
		} else if (isCorrect && !isUserAnswer) {
			return <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
		} else if (!isCorrect && isUserAnswer) {
			return <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />;
		}
		return null;
	};

	const scoreBadge = getScoreBadge(percentage);

	return (
		<div className="space-y-6">
			{/* Header con titolo */}
			<div className="text-center">
				<div className="mb-4 flex items-center justify-center">
					<Trophy className="mr-2 h-8 w-8 text-yellow-500" />
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white">
						Quiz Completato!
					</h1>
				</div>
				<p className="text-lg text-gray-600 dark:text-gray-400">{quizTitle}</p>
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
					<div className="grid grid-cols-1 gap-6 md:grid-cols-4">
						<div className="text-center">
							<div className={`text-3xl font-bold ${getScoreColor(percentage)}`}>
								{percentage}%
							</div>
							<p className="text-sm text-gray-600 dark:text-gray-400">Percentuale</p>
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
							<div
								className={`text-3xl font-bold ${getPointsColor(results.totalScore)}`}
							>
								{results.totalScore > 0 ? "+" : ""}
								{results.totalScore}
							</div>
							<p className="text-sm text-gray-600 dark:text-gray-400">Punti Totali</p>
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

			{/* Modalità di Correzione - Solo se disponibile */}
			{results.evaluationMode && (
				<Card className="mb-8">
					<CardHeader>
						<h2 className="text-xl font-semibold">Modalità di Correzione</h2>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<span className="font-medium text-gray-900 dark:text-white">
									Modalità:
								</span>
								<Badge variant="secondary">{results.evaluationMode.name}</Badge>
							</div>

							<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
								<div className="rounded-lg border p-3 text-center">
									<div className="text-lg font-bold text-green-600 dark:text-green-400">
										+{results.evaluationMode.correctAnswerPoints}
									</div>
									<p className="text-xs text-gray-600 dark:text-gray-400">
										Risposta Corretta
									</p>
								</div>
								<div className="rounded-lg border p-3 text-center">
									<div className="text-lg font-bold text-red-600 dark:text-red-400">
										{results.evaluationMode.incorrectAnswerPoints > 0 ? "+" : ""}
										{results.evaluationMode.incorrectAnswerPoints}
									</div>
									<p className="text-xs text-gray-600 dark:text-gray-400">
										Risposta Sbagliata
									</p>
								</div>
								<div className="rounded-lg border p-3 text-center">
									<div className="text-lg font-bold text-gray-600 dark:text-gray-400">
										{results.evaluationMode.partialCreditEnabled ? "Sì" : "No"}
									</div>
									<p className="text-xs text-gray-600 dark:text-gray-400">
										Punteggio Parziale
									</p>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Revisione Dettagliata Risposte */}
			<Card>
				<CardHeader>
					<h2 className="text-xl font-semibold">Revisione Dettagliata</h2>
					<p className="text-sm text-gray-600 dark:text-gray-400">
						<span className="mr-4 inline-flex items-center">
							<span className="mr-1 h-3 w-3 rounded-full bg-green-500"></span>
							Corrette
						</span>
						<span className="mr-4 inline-flex items-center">
							<span className="mr-1 h-3 w-3 rounded-full bg-red-500"></span>
							Sbagliate
						</span>
						<span className="inline-flex items-center">
							<span className="mr-1 h-3 w-3 rounded-full bg-blue-500"></span>
							Non date
						</span>
					</p>
				</CardHeader>
				<CardContent>
					<div className="space-y-6">
						{questions.map((question, index) => {
							const userAnswer = results.answers.find(
								a => a.questionId === question.id
							);
							const isCorrect = userAnswer?.isCorrect || false;
							const userScore = userAnswer?.score || 0;

							return (
								<div
									key={question.id}
									className="rounded-lg border bg-white p-6 dark:bg-gray-800"
								>
									{/* Header della domanda */}
									<div className="mb-4 flex items-start justify-between">
										<div className="flex-1">
											<div className="mb-3 flex items-center gap-3">
												<span className="text-sm font-medium text-gray-500 dark:text-gray-400">
													Domanda {index + 1}
												</span>
												<Badge
													variant="outline"
													className={
														userScore > 0
															? "border-green-500 text-green-700 dark:text-green-400"
															: userScore < 0
																? "border-red-500 text-red-700 dark:text-red-400"
																: "border-gray-500 text-gray-700 dark:text-gray-400"
													}
												>
													{userScore > 0 ? "+" : ""}
													{userScore} punti
												</Badge>
											</div>
											<div className="text-gray-900 dark:text-white">
												<MarkdownRenderer
													content={question.content}
													className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
												/>
											</div>
										</div>
										{isCorrect ? (
											<CheckCircle className="mt-1 h-6 w-6 flex-shrink-0 text-green-600 dark:text-green-400" />
										) : (
											<XCircle className="mt-1 h-6 w-6 flex-shrink-0 text-red-600 dark:text-red-400" />
										)}
									</div>

									{/* Opzioni della domanda */}
									{question.options && (
										<div className="space-y-3">
											<h4 className="text-sm font-medium text-gray-900 dark:text-white">
												Opzioni di risposta:
											</h4>
											<div className="grid gap-2">
												{question.options.map((option, optionIndex) => {
													return (
														<div
															key={optionIndex}
															className={`flex items-center justify-between rounded-lg border-2 p-3 ${getOptionStyle(
																option,
																userAnswer?.userAnswer || [],
																question.correctAnswer
															)}`}
														>
															<div className="flex-1">
																<MarkdownRenderer
																	content={option}
																	className="text-sm [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
																/>
															</div>
															{getOptionIcon(
																option,
																userAnswer?.userAnswer || [],
																question.correctAnswer
															)}
														</div>
													);
												})}
											</div>
										</div>
									)}

									{/* Per domande senza opzioni multiple */}
									{!question.options && (
										<div className="space-y-3">
											<div className="rounded bg-gray-50 p-3 dark:bg-gray-700">
												<p className="mb-1 text-sm font-medium text-gray-600 dark:text-gray-400">
													Tua risposta:
												</p>
												<p className="text-gray-900 dark:text-white">
													{userAnswer?.userAnswer.length
														? userAnswer.userAnswer.join(", ")
														: "Nessuna risposta"}
												</p>
											</div>
											{!isCorrect && (
												<div className="rounded bg-green-50 p-3 dark:bg-green-900/20">
													<p className="mb-1 text-sm font-medium text-green-700 dark:text-green-400">
														Risposta corretta:
													</p>
													<p className="text-green-800 dark:text-green-300">
														{question.correctAnswer.join(", ")}
													</p>
												</div>
											)}
										</div>
									)}
								</div>
							);
						})}
					</div>
				</CardContent>
			</Card>

			{/* Azioni */}
			<div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
				{showRetry && onRetry && (
					<Button
						onClick={onRetry}
						variant="outline"
						className="flex items-center space-x-2"
					>
						<RotateCcw className="h-4 w-4" />
						<span>Riprova Quiz</span>
					</Button>
				)}
				<Button onClick={onExit} className="flex items-center space-x-2">
					<Home className="h-4 w-4" />
					<span>Torna alla Home</span>
				</Button>
			</div>
		</div>
	);
}
