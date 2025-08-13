"use client";

import { CheckCircle, Clock, Home, RotateCcw, Trophy, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { QuizResultsComponentProps } from "@/lib/types/quiz.types";
import {
	formatTime,
	getOptionStyle,
	getScoreBadge,
	getScoreColor,
} from "@/lib/utils/quiz-results";

export function QuizResults({
	results,
	onExit,
	onRetry,
	showRetry = false,
}: QuizResultsComponentProps) {
	const scoreIn33 = results.totalScore;
	const scoreBadge = getScoreBadge(scoreIn33);

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
				<p className="text-lg text-gray-600 dark:text-gray-400">{results.quizTitle}</p>
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
							<div className={`text-3xl font-bold ${getScoreColor(scoreIn33)}`}>
								{scoreIn33}/33
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
						{results.questions.map((question, index) => {
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
																userAnswer?.answer || [],
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
																userAnswer?.answer || [],
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
													{userAnswer?.answer.length
														? userAnswer.answer.join(", ")
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
