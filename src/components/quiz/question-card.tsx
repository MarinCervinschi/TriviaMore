import { ReportButton } from "@/components/requests/report-button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { parseOptions } from "@/lib/quiz/options";
import type { QuizQuestion } from "@/lib/quiz/types";

import { BookmarkButton } from "./bookmark-button";
import { QuestionHeader } from "./question-header";

export function QuestionCard({
	question,
	questionNumber,
	selectedAnswers,
	onAnswerChange,
}: {
	question: QuizQuestion;
	questionNumber: number;
	selectedAnswers: string[];
	onAnswerChange: (answers: string[]) => void;
}) {
	const options = parseOptions(question.options);

	const handleOptionToggle = (optionId: string) => {
		if (question.questionType === "TRUE_FALSE") {
			if (selectedAnswers.includes(optionId)) {
				onAnswerChange([]);
			} else {
				onAnswerChange([optionId]);
			}
		} else {
			if (selectedAnswers.includes(optionId)) {
				onAnswerChange(selectedAnswers.filter(a => a !== optionId));
			} else {
				onAnswerChange([...selectedAnswers, optionId]);
			}
		}
	};

	return (
		<div className="mx-auto max-w-3xl">
			<QuestionHeader
				number={questionNumber}
				difficulty={question.difficulty}
				className="mb-6"
				actions={
					<>
						<ReportButton questionId={question.id} questionContent={question.content} />
						<BookmarkButton questionId={question.id} />
					</>
				}
			/>

			{/* Question content */}
			<Card className="mb-8 p-6">
				<div className="text-lg leading-relaxed">
					<MarkdownRenderer
						content={question.content}
						className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
					/>
				</div>
			</Card>

			{/* Options */}
			{question.questionType === "TRUE_FALSE" ? (
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					{options.map(option => (
						<button
							key={option.id}
							onClick={() => handleOptionToggle(option.id)}
							className={`rounded-2xl border-2 p-5 text-center text-lg font-semibold transition-all duration-200 ${
								selectedAnswers.includes(option.id)
									? "border-primary bg-primary/10 text-brand scale-[1.02] shadow-sm"
									: "border-border bg-card hover:border-primary/40 hover:bg-muted/50"
							}`}
						>
							{option.text}
						</button>
					))}
				</div>
			) : (
				<div className="space-y-3">
					{options.map((option, index) => (
						<label
							key={option.id}
							className={`flex cursor-pointer items-start gap-4 rounded-2xl border-2 p-5 transition-all duration-200 ${
								selectedAnswers.includes(option.id)
									? "border-primary bg-primary/10 scale-[1.01] shadow-sm"
									: "border-border bg-card hover:border-primary/40 hover:bg-muted/50"
							}`}
						>
							<Checkbox
								checked={selectedAnswers.includes(option.id)}
								onCheckedChange={() => handleOptionToggle(option.id)}
								className="mt-0.5"
							/>
							<span className="flex-1">
								<span className="text-muted-foreground mr-2 font-semibold">
									{String.fromCharCode(65 + index)})
								</span>
								<MarkdownRenderer content={option.text} inline />
							</span>
						</label>
					))}
				</div>
			)}
		</div>
	);
}
