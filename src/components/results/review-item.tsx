import { type ReactNode, useId, useState } from "react";

import { AltArrowDownIcon } from "@solar-icons/react/linear/alt-arrow-down";
import { CheckCircleIcon } from "@solar-icons/react/linear/check-circle";
import { CloseCircleIcon } from "@solar-icons/react/linear/close-circle";
import { LightbulbMinimalisticIcon } from "@solar-icons/react/linear/lightbulb-minimalistic";
import { MinusCircleIcon } from "@solar-icons/react/linear/minus-circle";
import { RecordCircleIcon } from "@solar-icons/react/linear/record-circle";

import type { Icon } from "@/components/icons";
import { DifficultyMeter } from "@/components/shared/difficulty-bar";
import { InsetCard } from "@/components/ui/inset-card";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { isCorrectOption, parseOptions } from "@/lib/quiz/options";
import type { ReviewVerdict } from "@/lib/quiz/results";
import { formatScaledSigned } from "@/lib/quiz/scoring";
import { getDifficultyLabel } from "@/lib/user/utils";
import { cn } from "@/lib/utils";

const VERDICTS: Record<ReviewVerdict, { label: string; ink: string; icon: Icon }> = {
	correct: { label: "Corretta", ink: "text-success", icon: CheckCircleIcon },
	partial: { label: "Parziale", ink: "text-warning", icon: RecordCircleIcon },
	wrong: { label: "Errata", ink: "text-danger", icon: CloseCircleIcon },
	unanswered: {
		label: "Non risposta",
		ink: "text-muted-foreground",
		icon: MinusCircleIcon,
	},
};

export type ReviewQuestion = {
	id: string;
	content: string;
	options: string[] | null;
	correctAnswer: string[];
	explanation: string | null;
	difficulty?: string | null;
};

function IndexChip({ index }: { index: number }) {
	return (
		<span className="bg-muted flex size-8 shrink-0 items-center justify-center rounded-lg text-sm font-semibold tabular-nums">
			{index + 1}
		</span>
	);
}

/**
 * One question in the review list. Closed it is a row; open it is an `InsetCard`,
 * so the question sits on the frame, the options on the panel and the explanation
 * on the frame again — the three parts read as three parts without a rule between
 * them.
 *
 * The header carries the verdict and nothing else: an icon, its points, the
 * chevron. Everything that is about the question rather than the outcome — the
 * difficulty, the bookmark, the report — sits in a strip at the top of the panel,
 * where it is in reach only while the question is actually open.
 *
 * `actions` is a slot rather than the buttons themselves: the bookmark and the
 * report both mutate, and keeping them out leaves this component renderable
 * anywhere.
 */
export function ReviewItem({
	index,
	question,
	userAnswer,
	verdict,
	scaledScore,
	actions,
	defaultOpen = false,
}: {
	index: number;
	question: ReviewQuestion;
	userAnswer: string[];
	verdict: ReviewVerdict;
	/** The answer's contribution on the 0–33 scale. */
	scaledScore: number;
	/** Bookmark and report, when the caller can supply them. */
	actions?: ReactNode;
	defaultOpen?: boolean;
}) {
	const [open, setOpen] = useState(defaultOpen);
	const panelId = useId();
	const skin = VERDICTS[verdict];
	const difficulty = question.difficulty
		? getDifficultyLabel(question.difficulty)
		: null;
	const VerdictIcon = skin.icon;

	// Colour and icon carry the verdict for anyone looking; the word is still there
	// for anyone listening (WCAG 1.4.1 — `title` is a tooltip, not a name).
	const outcome = (
		<span
			className={cn(
				"flex shrink-0 items-center gap-1.5 text-xs font-semibold tabular-nums",
				skin.ink
			)}
			title={skin.label}
		>
			<VerdictIcon className="size-4" />
			<span className="sr-only">{skin.label},</span>
			{formatScaledSigned(scaledScore)} pt
		</span>
	);

	const chevron = (
		<AltArrowDownIcon
			className={cn(
				"text-muted-foreground size-4 transition-transform duration-200 motion-reduce:transition-none",
				open ? "rotate-0" : "-rotate-90"
			)}
		/>
	);

	const title = (
		<button
			type="button"
			aria-expanded={open}
			aria-controls={panelId}
			onClick={() => setOpen(value => !value)}
			className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left"
		>
			<IndexChip index={index} />
			<span
				className={cn(
					"min-w-0 flex-1 text-sm",
					open ? "font-semibold" : "truncate font-medium"
				)}
			>
				<MarkdownRenderer content={question.content} inline />
			</span>
		</button>
	);

	if (!open) {
		return (
			<div className="bg-card border-border/50 flex items-center gap-3 rounded-2xl border p-3.5 shadow-xs">
				{title}
				<div className="flex shrink-0 items-center gap-3">
					{outcome}
					{chevron}
				</div>
			</div>
		);
	}

	const options = parseOptions(question.options);
	const picked = new Set(userAnswer);

	return (
		<InsetCard
			bandClassName="p-0"
			header={
				<div className="flex items-center gap-3 p-2.5">
					{title}
					<div className="flex shrink-0 items-center gap-3">
						{outcome}
						{/* A second hit target for the row's own control: not in the tab order,
						    and never announced twice. */}
						<button
							type="button"
							aria-hidden
							tabIndex={-1}
							onClick={() => setOpen(false)}
							className="inline-flex cursor-pointer items-center"
						>
							{chevron}
						</button>
					</div>
				</div>
			}
			footer={
				question.explanation && (
					<div className="p-3.5 pt-3">
						<p className="eyebrow text-brand flex items-center gap-1.5">
							<LightbulbMinimalisticIcon className="size-3.5" />
							Spiegazione
						</p>
						<div className="text-foreground/90 mt-2 text-sm">
							<MarkdownRenderer
								content={question.explanation}
								className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
							/>
						</div>
					</div>
				)
			}
		>
			{(difficulty || actions) && (
				<div className="border-border/60 flex min-h-11 items-center justify-between gap-3 border-b px-4 py-2">
					{difficulty ? (
						<span className="text-muted-foreground flex items-center gap-2 text-xs">
							<DifficultyMeter level={question.difficulty ?? ""} />
							{difficulty}
						</span>
					) : (
						<span />
					)}
					{actions && <div className="flex items-center gap-1">{actions}</div>}
				</div>
			)}
			<ul id={panelId} className="space-y-1.5 p-4">
				{options.map((option, optionIndex) => {
					const correct = isCorrectOption(option.id, question.correctAnswer);
					const selected = picked.has(option.id);
					return (
						<li
							key={option.id}
							className={cn(
								"flex items-start gap-2 rounded-lg p-2.5 text-sm",
								correct && selected && "bg-success/12 text-success",
								correct && !selected && "bg-info/10 text-info",
								!correct && selected && "bg-destructive/10 text-danger",
								!correct && !selected && "bg-muted/60"
							)}
						>
							<span className="font-bold">
								{String.fromCharCode(65 + optionIndex)})
							</span>
							<span className="min-w-0 flex-1">
								<MarkdownRenderer content={option.text} inline />
							</span>
							{correct && (
								<span className="shrink-0 text-xs font-semibold">
									&#10003; Corretta
								</span>
							)}
							{!correct && selected && (
								<span className="shrink-0 text-xs font-semibold">
									&#10007; Selezionata
								</span>
							)}
						</li>
					);
				})}
			</ul>
		</InsetCard>
	);
}
