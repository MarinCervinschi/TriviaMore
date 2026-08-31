import { ReportButton } from "@/components/requests/report-button";
import { Checkbox } from "@/components/ui/checkbox";
import { InsetCard } from "@/components/ui/inset-card";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { parseOptions } from "@/lib/quiz/options";
import type { QuizQuestion } from "@/lib/quiz/types";
import { cn } from "@/lib/utils";

import { BookmarkButton } from "./bookmark-button";
import { QuestionHeader } from "./question-header";

/**
 * The question and its answers. The two used to weigh the same — both at
 * `prose-sm`, and the options carrying `border-2` against the question's single
 * hairline, so the thing to read looked lighter than the things to pick. The
 * question now takes the weight and a step up in size; the options take the
 * app's ordinary card edge.
 */
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
	const trueFalse = question.questionType === "TRUE_FALSE";

	const handleOptionToggle = (optionId: string) => {
		if (trueFalse) {
			onAnswerChange(selectedAnswers.includes(optionId) ? [] : [optionId]);
			return;
		}
		onAnswerChange(
			selectedAnswers.includes(optionId)
				? selectedAnswers.filter(a => a !== optionId)
				: [...selectedAnswers, optionId]
		);
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

			<InsetCard className="mb-8">
				<div className="p-6 leading-relaxed font-semibold">
					<MarkdownRenderer
						content={question.content}
						size="base"
						className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
					/>
				</div>
			</InsetCard>

			<div
				className={trueFalse ? "grid grid-cols-1 gap-3 sm:grid-cols-2" : "space-y-3"}
			>
				{options.map((option, index) => {
					const selected = selectedAnswers.includes(option.id);

					// Two wide pressables, so they are sized as controls: `rounded-xl` is the
					// step a button takes, and the label stays under the question rather than
					// over it.
					if (trueFalse) {
						return (
							<button
								key={option.id}
								type="button"
								aria-pressed={selected}
								onClick={() => handleOptionToggle(option.id)}
								className={cn(
									"flex h-12 cursor-pointer items-center justify-center rounded-xl border px-4 text-sm transition-colors duration-200 motion-reduce:transition-none",
									selected
										? "border-primary bg-primary/10 text-brand font-semibold"
										: "border-border/60 bg-card hover:border-primary/40 font-medium"
								)}
							>
								{option.text}
							</button>
						);
					}

					return (
						<label
							key={option.id}
							className={cn(
								"flex cursor-pointer items-start gap-4 rounded-2xl border p-4 shadow-xs transition-colors duration-200 motion-reduce:transition-none",
								selected
									? "border-primary bg-primary/10"
									: "border-border/50 bg-card hover:border-primary/40"
							)}
						>
							<Checkbox
								checked={selected}
								onCheckedChange={() => handleOptionToggle(option.id)}
								className="mt-0.5"
							/>
							<span className="flex-1 text-sm">
								<span className="text-muted-foreground mr-2 font-semibold">
									{String.fromCharCode(65 + index)})
								</span>
								<MarkdownRenderer content={option.text} inline />
							</span>
						</label>
					);
				})}
			</div>
		</div>
	);
}
