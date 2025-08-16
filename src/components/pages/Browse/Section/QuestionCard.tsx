"use client";

import { useState } from "react";

import { BookOpen, Edit, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";

interface QuestionCard {
	id: string;
	content: string;
	sectionId: string;
	questionType: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER";
	difficulty: "EASY" | "MEDIUM" | "HARD";
	options?: any;
	correctAnswer: string[];
	explanation?: string;
	createdAt: string;
	updatedAt: string;
}

interface QuestionCardProps {
	question: QuestionCard;
	onEditAction?: (action: "edit" | "delete", data?: QuestionCard) => void;
}

export function QuestionCard({ question, onEditAction }: QuestionCardProps) {
	const [isExpanded, setIsExpanded] = useState(false);

	const getTypeLabel = (type: string) => {
		switch (type) {
			case "MULTIPLE_CHOICE":
				return "Scelta multipla";
			case "TRUE_FALSE":
				return "Vero/Falso";
			case "SHORT_ANSWER":
				return "Risposta breve";
			default:
				return type;
		}
	};

	const getDifficultyColor = (difficulty: string) => {
		switch (difficulty) {
			case "EASY":
				return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200";
			case "MEDIUM":
				return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200";
			case "HARD":
				return "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200";
			default:
				return "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-200";
		}
	};

	const getDifficultyLabel = (difficulty: string) => {
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

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("it-IT", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const renderOptions = () => {
		if (question.questionType === "MULTIPLE_CHOICE" && question.options) {
			const options = Array.isArray(question.options)
				? question.options
				: question.options.options || [];
			return (
				<div className="mt-3 space-y-2">
					<p className="text-sm font-medium text-gray-700 dark:text-gray-300">
						Opzioni:
					</p>
					{options.map((option: string, index: number) => (
						<div
							key={index}
							className={`flex items-center rounded-md border p-2 text-sm ${
								question.correctAnswer.includes(option)
									? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
									: "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
							}`}
						>
							<span className="mr-2 font-medium">
								{String.fromCharCode(65 + index)}.
							</span>
							<MarkdownRenderer content={option} className="inline" />
						</div>
					))}
				</div>
			);
		}

		if (question.questionType === "TRUE_FALSE") {
			return (
				<div className="mt-3">
					<p className="text-sm font-medium text-gray-700 dark:text-gray-300">
						Risposta corretta:{" "}
						<Badge variant="secondary">{question.correctAnswer[0]}</Badge>
					</p>
				</div>
			);
		}

		if (question.questionType === "SHORT_ANSWER") {
			return (
				<div className="mt-3">
					<p className="text-sm font-medium text-gray-700 dark:text-gray-300">
						Risposte accettate:
					</p>
					<div className="mt-1 flex flex-wrap gap-1">
						{question.correctAnswer.map((answer, index) => (
							<Badge key={index} variant="secondary">
								<MarkdownRenderer content={answer} className="flashcard-markdown" />
							</Badge>
						))}
					</div>
				</div>
			);
		}

		return null;
	};

	return (
		<>
			<Card className="transition-shadow hover:shadow-md">
				<CardHeader className="pb-3">
					<div className="flex items-start justify-between">
						<div className="flex-1">
							<div className="mb-2 flex items-center gap-2">
								<Badge variant="outline">{getTypeLabel(question.questionType)}</Badge>
								<Badge className={getDifficultyColor(question.difficulty)}>
									{getDifficultyLabel(question.difficulty)}
								</Badge>
							</div>
							<p className="text-sm text-gray-600 dark:text-gray-400">
								Creata: {formatDate(question.createdAt)}
								{question.updatedAt !== question.createdAt && (
									<span className="ml-2">
										• Modificata: {formatDate(question.updatedAt)}
									</span>
								)}
							</p>
						</div>
						<div className="flex items-center gap-2">
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setIsExpanded(!isExpanded)}
							>
								<BookOpen className="h-4 w-4" />
								{isExpanded ? "Nascondi" : "Dettagli"}
							</Button>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => onEditAction?.("edit", question)}
							>
								<Edit className="h-4 w-4" />
							</Button>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => onEditAction?.("delete", question)}
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</CardHeader>

				<CardContent>
					<div className="space-y-3">
						<div>
							<MarkdownRenderer
								content={question.content}
								className="font-medium text-gray-900 dark:text-white"
							/>
						</div>

						{isExpanded && (
							<div className="space-y-3 border-t pt-3">
								{renderOptions()}

								{question.explanation && (
									<div>
										<p className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
											Spiegazione:
										</p>
										<div className="rounded bg-blue-50 p-2 text-sm text-gray-600 dark:bg-blue-900/20 dark:text-gray-400">
											<MarkdownRenderer content={question.explanation} />
										</div>
									</div>
								)}
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</>
	);
}
