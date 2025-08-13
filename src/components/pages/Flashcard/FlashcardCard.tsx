"use client";

import { useEffect, useState } from "react";

import { Eye, EyeOff, RotateCcw } from "lucide-react";

import { BookmarkButton } from "@/components/BookmarkButton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { FlashcardQuestion } from "@/lib/types/flashcard.types";

interface FlashcardCardProps {
	question: FlashcardQuestion;
	cardNumber: number;
	totalCards: number;
	isGuest?: boolean;
	onFlip?: () => void; // Callback quando viene girata
}

export function FlashcardCard({
	question,
	cardNumber,
	totalCards,
	isGuest = false,
	onFlip,
}: FlashcardCardProps) {
	const [isFlipped, setIsFlipped] = useState(false);
	const [showExplanation, setShowExplanation] = useState(false);

	// Reset dello stato quando cambia la domanda
	useEffect(() => {
		setIsFlipped(false);
		setShowExplanation(false);
	}, [question.id]);

	const handleFlip = () => {
		if (!isFlipped) {
			// Se è la prima volta che viene girata, notifica il container
			onFlip?.();
		}
		setIsFlipped(!isFlipped);
		if (isFlipped) {
			setShowExplanation(false);
		}
	};

	const toggleExplanation = () => {
		setShowExplanation(!showExplanation);
	};

	return (
		<div className="flex justify-center">
			<div className="w-full max-w-4xl">
				{/* Card principale con effetto flip */}
				<div className="perspective-1000 relative">
					<div
						className={`transform-style-preserve-3d relative h-[28rem] w-full cursor-pointer transition-transform duration-700 ${
							isFlipped ? "rotate-y-180" : ""
						}`}
						onClick={handleFlip}
					>
						{/* Fronte della carta - Domanda */}
						<Card className="backface-hidden absolute inset-0 h-full w-full border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-violet-100 shadow-xl transition-all duration-300 hover:shadow-2xl dark:border-purple-700 dark:from-purple-900/20 dark:to-violet-900/20">
							<div className="flex h-full flex-col p-6 md:p-8">
								<div className="mb-4 flex items-center justify-between">
									<div className="rounded-full bg-purple-600 px-3 py-1 text-sm font-medium text-white">
										Domanda {cardNumber}/{totalCards}
									</div>
									<div className="flex items-center space-x-2">
										<BookmarkButton
											questionId={question.id}
											isGuest={isGuest}
											size="sm"
											variant="ghost"
										/>
										<div className="flex items-center text-sm text-purple-600 dark:text-purple-400">
											<RotateCcw className="mr-1 h-4 w-4" />
											Clicca per girare
										</div>
									</div>
								</div>

								{/* Contenuto scrollabile per domande lunghe */}
								<div className="flashcard-content flex-1 overflow-y-auto p-2">
									<div className="flex min-h-full items-center justify-center">
										<div className="w-full space-y-4 text-center">
											<div className="flashcard-emoji text-4xl md:text-6xl">❓</div>
											<div>
												<MarkdownRenderer
													content={question.content}
													className="flashcard-markdown text-base leading-relaxed text-gray-800 dark:text-gray-200 md:text-lg"
												/>
											</div>
										</div>
									</div>
								</div>

								<div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
									Difficoltà:{" "}
									<span
										className={`font-medium ${
											question.difficulty === "EASY"
												? "text-green-600"
												: question.difficulty === "MEDIUM"
													? "text-yellow-600"
													: "text-red-600"
										}`}
									>
										{question.difficulty === "EASY"
											? "Facile"
											: question.difficulty === "MEDIUM"
												? "Media"
												: "Difficile"}
									</span>
								</div>
							</div>
						</Card>

						{/* Retro della carta - Risposta */}
						<Card className="backface-hidden rotate-y-180 absolute inset-0 h-full w-full border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-100 shadow-xl transition-all duration-300 hover:shadow-2xl dark:border-green-700 dark:from-green-900/20 dark:to-emerald-900/20">
							<div className="flex h-full flex-col p-6 md:p-8">
								<div className="mb-4 flex items-center justify-between">
									<div className="rounded-full bg-green-600 px-3 py-1 text-sm font-medium text-white">
										Risposta {cardNumber}/{totalCards}
									</div>
									<div className="flex items-center space-x-2">
										{question.explanation && (
											<Button
												variant="ghost"
												size="sm"
												onClick={e => {
													e.stopPropagation();
													toggleExplanation();
												}}
												className="text-green-600 hover:text-green-700 dark:text-green-400"
											>
												{showExplanation ? (
													<EyeOff className="h-4 w-4" />
												) : (
													<Eye className="h-4 w-4" />
												)}
												<span className="ml-1 hidden sm:inline">
													{showExplanation ? "Nascondi" : "Spiegazione"}
												</span>
											</Button>
										)}
										<div className="flex items-center text-sm text-green-600 dark:text-green-400">
											<RotateCcw className="mr-1 h-4 w-4" />
											<span className="hidden sm:inline">Clicca per girare</span>
										</div>
									</div>
								</div>

								{/* Contenuto scrollabile per risposte lunghe */}
								<div className="flashcard-content flex-1 overflow-y-auto p-2">
									<div className="flex min-h-full items-center justify-center">
										<div className="w-full space-y-4 text-center">
											<div className="flashcard-emoji text-4xl md:text-6xl">✅</div>
											<div>
												<MarkdownRenderer
													content={
														question.correctAnswer[0] || "Nessuna risposta disponibile"
													}
													className="flashcard-markdown text-base leading-relaxed text-gray-800 dark:text-gray-200 md:text-lg"
												/>
											</div>
										</div>
									</div>
								</div>
							</div>
						</Card>
					</div>
				</div>

				{/* Spiegazione (mostrata sotto la carta quando è girata) */}
				{isFlipped && showExplanation && question.explanation && (
					<Card className="mt-6 border-blue-200 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20">
						<div className="p-4 md:p-6">
							<div className="mb-4 flex items-center">
								<div className="mr-3 rounded-lg bg-blue-600 p-2 text-white">
									<Eye className="h-4 w-4" />
								</div>
								<h3 className="text-base font-semibold text-blue-800 dark:text-blue-200 md:text-lg">
									Spiegazione
								</h3>
							</div>
							<div className="max-h-80 overflow-y-auto">
								<MarkdownRenderer
									content={question.explanation}
									className="flashcard-markdown text-sm text-gray-700 dark:text-gray-300 md:text-base"
								/>
							</div>
						</div>
					</Card>
				)}
			</div>
		</div>
	);
}
