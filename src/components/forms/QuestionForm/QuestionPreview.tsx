import { type Control, useWatch } from "react-hook-form";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import type { QuestionInput, UpdateQuestionInput } from "@/lib/validations/admin";

interface QuestionPreviewProps {
	control: Control<QuestionInput | UpdateQuestionInput>;
}

export function QuestionPreview({ control }: QuestionPreviewProps) {
	const content = useWatch({ control, name: "content" }) || "";
	const questionType = useWatch({ control, name: "questionType" }) || "MULTIPLE_CHOICE";
	const options = useWatch({ control, name: "options" }) || [];
	const correctAnswer = useWatch({ control, name: "correctAnswer" }) || [];
	const explanation = useWatch({ control, name: "explanation" }) || "";
	const difficulty = useWatch({ control, name: "difficulty" }) || "MEDIUM";

	const getDifficultyColor = (diff: string) => {
		switch (diff) {
			case "EASY":
				return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
			case "MEDIUM":
				return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
			case "HARD":
				return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
			default:
				return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
		}
	};

	const getQuestionTypeLabel = (type: string) => {
		switch (type) {
			case "MULTIPLE_CHOICE":
				return "Scelta Multipla";
			case "TRUE_FALSE":
				return "Vero/Falso";
			case "SHORT_ANSWER":
				return "Risposta Breve";
			default:
				return type;
		}
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="text-lg">Anteprima Domanda</CardTitle>
					<div className="flex gap-2">
						<Badge variant="outline">{getQuestionTypeLabel(questionType)}</Badge>
						<Badge className={getDifficultyColor(difficulty)}>
							{difficulty === "EASY"
								? "Facile"
								: difficulty === "MEDIUM"
									? "Medio"
									: "Difficile"}
						</Badge>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				{content && (
					<div>
						<h4 className="mb-2 font-medium">Domanda:</h4>
						<div className="rounded-md bg-gray-50 p-3 dark:bg-gray-800">
							<MarkdownRenderer content={content} className="flashcard-markdown" />
						</div>
					</div>
				)}

				{questionType === "MULTIPLE_CHOICE" && options.length > 0 && (
					<div>
						<h4 className="mb-2 font-medium">Opzioni:</h4>
						<div className="space-y-2">
							{options.map((option: string, index: number) => {
								if (!option.trim()) {return null;}
								const isCorrect = correctAnswer.includes(option);
								return (
									<div
										key={index}
										className={`rounded border p-2 ${
											isCorrect
												? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
												: "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
										}`}
									>
										<div className="flex items-center gap-2">
											<span className="font-mono text-sm">
												{String.fromCharCode(65 + index)}.
											</span>
											<MarkdownRenderer content={option} />
											{isCorrect && (
												<Badge variant="secondary" className="ml-auto">
													Corretta
												</Badge>
											)}
										</div>
									</div>
								);
							})}
						</div>
					</div>
				)}

				{questionType === "TRUE_FALSE" && correctAnswer.length > 0 && (
					<div>
						<h4 className="mb-2 font-medium">Risposta Corretta:</h4>
						<Badge
							className={
								correctAnswer[0] === "Vero"
									? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
									: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
							}
						>
							{correctAnswer[0]}
						</Badge>
					</div>
				)}

				{questionType === "SHORT_ANSWER" &&
					correctAnswer.length > 0 &&
					correctAnswer[0] && (
						<div>
							<h4 className="mb-2 font-medium">Risposta Corretta:</h4>
							<div className="rounded-md border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
								<MarkdownRenderer
									content={correctAnswer[0]}
									className="flashcard-markdown"
								/>
							</div>
						</div>
					)}

				{explanation && (
					<div>
						<h4 className="mb-2 font-medium">Spiegazione:</h4>
						<div className="rounded-md border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
							<MarkdownRenderer content={explanation} />
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
