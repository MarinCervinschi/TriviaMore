"use client";

import { Difficulty, QuestionType } from "@prisma/client";

import { BookmarkButton } from "@/components/BookmarkButton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { QuizQuestion } from "@/lib/types/quiz.types";

interface QuestionCardProps {
	question: QuizQuestion;
	questionNumber: number;
	totalQuestions: number;
	selectedAnswers: string[];
	onAnswerChange: (answers: string[]) => void;
	isGuest?: boolean;
}

export function QuestionCard({
	question,
	questionNumber,
	totalQuestions,
	selectedAnswers,
	onAnswerChange,
	isGuest = false,
}: QuestionCardProps) {
	const getDifficultyColor = (difficulty: Difficulty) => {
		switch (difficulty) {
			case "EASY":
				return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
			case "MEDIUM":
				return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
			case "HARD":
				return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
			default:
				return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
		}
	};

	const getDifficultyLabel = (difficulty: Difficulty) => {
		switch (difficulty) {
			case "EASY":
				return "Facile";
			case "MEDIUM":
				return "Medio";
			case "HARD":
				return "Difficile";
			default:
				return difficulty;
		}
	};

	const handleSingleChoice = (value: string) => {
		// Se l'opzione è già selezionata, deselezionala
		if (selectedAnswers[0] === value) {
			onAnswerChange([]);
		} else {
			onAnswerChange([value]);
		}
	};

	const handleMultipleChoice = (optionContent: string, checked: boolean) => {
		if (checked) {
			onAnswerChange([...selectedAnswers, optionContent]);
		} else {
			onAnswerChange(selectedAnswers.filter(ans => ans !== optionContent));
		}
	};

	const renderAnswerOptions = () => {
		if (question.questionType === QuestionType.SHORT_ANSWER) {
			// Domanda aperta
			return (
				<div className="space-y-2">
					<Label htmlFor="open-answer">Inserisci la tua risposta:</Label>
					<textarea
						id="open-answer"
						value={selectedAnswers[0] || ""}
						onChange={e => onAnswerChange([e.target.value])}
						className="w-full rounded-md border border-gray-300 p-3 dark:border-gray-600 dark:bg-gray-700"
						rows={4}
						placeholder="Scrivi qui la tua risposta..."
					/>
				</div>
			);
		}

		if (question.questionType === QuestionType.MULTIPLE_CHOICE) {
			// Domande a scelta multipla - sempre checkbox per permettere selezioni multiple
			return (
				<div className="space-y-2">
					<p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
						{question.correctAnswer.length > 1
							? "Seleziona tutte le risposte corrette"
							: "Seleziona una o più risposte"}
					</p>
					{question.options?.map((option, index) => (
						<div key={index} className="flex items-center space-x-2">
							<Checkbox
								id={`option-${index}`}
								checked={selectedAnswers.includes(option)}
								onCheckedChange={checked =>
									handleMultipleChoice(option, checked as boolean)
								}
							/>
							<Label
								htmlFor={`option-${index}`}
								className="flex-1 cursor-pointer rounded p-2 hover:bg-gray-50 dark:hover:bg-gray-800"
							>
								<MarkdownRenderer
									content={option}
									className="option-markdown [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
								/>
							</Label>
						</div>
					))}
				</div>
			);
		}

		if (question.questionType === QuestionType.TRUE_FALSE) {
			// Vero/Falso con possibilità di deselezionare
			return (
				<div className="space-y-2">
					<div className="flex items-center space-x-2">
						<button
							type="button"
							onClick={() => handleSingleChoice("true")}
							className={`h-4 w-4 rounded-full border-2 transition-all ${
								selectedAnswers[0] === "true"
									? "border-blue-600 bg-blue-600"
									: "border-gray-300 hover:border-gray-400 dark:border-gray-600"
							}`}
						>
							{selectedAnswers[0] === "true" && (
								<div className="h-full w-full scale-50 rounded-full bg-white"></div>
							)}
						</button>
						<Label
							className="flex-1 cursor-pointer rounded p-2 hover:bg-gray-50 dark:hover:bg-gray-800"
							onClick={() => handleSingleChoice("true")}
						>
							Vero
						</Label>
					</div>
					<div className="flex items-center space-x-2">
						<button
							type="button"
							onClick={() => handleSingleChoice("false")}
							className={`h-4 w-4 rounded-full border-2 transition-all ${
								selectedAnswers[0] === "false"
									? "border-blue-600 bg-blue-600"
									: "border-gray-300 hover:border-gray-400 dark:border-gray-600"
							}`}
						>
							{selectedAnswers[0] === "false" && (
								<div className="h-full w-full scale-50 rounded-full bg-white"></div>
							)}
						</button>
						<Label
							className="flex-1 cursor-pointer rounded p-2 hover:bg-gray-50 dark:hover:bg-gray-800"
							onClick={() => handleSingleChoice("false")}
						>
							Falso
						</Label>
					</div>
					<p className="text-xs text-gray-500 dark:text-gray-400">
						Clicca di nuovo per deselezionare
					</p>
				</div>
			);
		}

		return null;
	};

	return (
		<Card className="w-full">
			<CardHeader>
				<div className="flex items-start justify-between">
					<div className="flex-1">
						<div className="mb-2 flex items-center space-x-2">
							<span className="text-sm font-medium text-gray-500 dark:text-gray-400">
								Domanda {questionNumber} di {totalQuestions}
							</span>
							<Badge className={getDifficultyColor(question.difficulty)}>
								{getDifficultyLabel(question.difficulty)}
							</Badge>
						</div>
					</div>
					<BookmarkButton
						questionId={question.id}
						isGuest={isGuest}
						size="sm"
						variant="ghost"
					/>
				</div>
				<div className="text-lg font-semibold leading-relaxed text-gray-900 dark:text-white">
					<MarkdownRenderer
						content={question.content}
						className="question-markdown [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
					/>
				</div>
			</CardHeader>

			<CardContent className="space-y-6">
				{/* Opzioni di risposta */}
				<div className="space-y-4">{renderAnswerOptions()}</div>
			</CardContent>
		</Card>
	);
}
