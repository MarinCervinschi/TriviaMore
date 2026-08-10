import type { ReactNode } from "react";

import {
	formatScaledScore,
	formatScaledSigned,
	getNormalizedEvaluationScale,
} from "@/lib/quiz/scoring";
import type { EvaluationMode } from "@/lib/quiz/types";
import { cn } from "@/lib/utils";

import { ClockFace } from "./clock-face";

export function Eyebrow({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"text-muted-foreground text-[10px] font-semibold tracking-[0.16em] uppercase",
				className
			)}
		>
			{children}
		</div>
	);
}

type MetricBlockProps = {
	eyebrow: string;
	value: number | string;
	total?: number;
	hint?: string;
	showBar?: boolean;
};

export function MetricBlock({
	eyebrow,
	value,
	total,
	hint,
	showBar,
}: MetricBlockProps) {
	const numericValue = typeof value === "number" ? value : Number(value);
	const ratio =
		showBar && total && total > 0 && Number.isFinite(numericValue)
			? Math.max(0, Math.min(1, numericValue / total))
			: 0;

	return (
		<div className="flex flex-col gap-1.5">
			<Eyebrow>{eyebrow}</Eyebrow>
			<div className="flex items-baseline gap-1.5">
				<div className="text-foreground text-3xl leading-none font-bold tabular-nums">
					{value}
				</div>
				{total !== undefined && (
					<div className="text-muted-foreground text-xs">/ {total}</div>
				)}
			</div>
			{showBar && total !== undefined && (
				<div className="bg-muted mt-1 h-1 w-full overflow-hidden rounded-full">
					<div
						className="bg-primary h-full rounded-full transition-[width] duration-300"
						style={{ width: `${ratio * 100}%` }}
					/>
				</div>
			)}
			{hint && <div className="text-muted-foreground/80 text-xs">{hint}</div>}
		</div>
	);
}

type TimeBlockProps = {
	/** Total minutes for the session, or null for unlimited. */
	minutes: number | null;
	/** Number of questions/cards in the session, used for per-question hint. */
	questionCount: number;
};

export function TimeBlock({ minutes, questionCount }: TimeBlockProps) {
	const isUnlimited = minutes === null;
	const perQuestion =
		!isUnlimited && questionCount > 0 ? minutes / questionCount : null;

	const fmtPerQ = (n: number) => {
		if (n >= 1) return `${n.toFixed(n % 1 === 0 ? 0 : 1)} min/dom.`;
		return `${Math.round(n * 60)}s/dom.`;
	};

	return (
		<div className="flex items-center gap-3">
			<ClockFace minutes={minutes} size={64} />
			<div className="flex flex-col gap-1">
				<Eyebrow>Durata</Eyebrow>
				<div className="flex items-baseline gap-1.5">
					<div className="text-foreground text-2xl leading-none font-bold tabular-nums">
						{isUnlimited ? "∞" : minutes}
					</div>
					{!isUnlimited && <div className="text-muted-foreground text-xs">min</div>}
				</div>
				<div className="text-muted-foreground/80 text-xs">
					{isUnlimited
						? "Tempo illimitato"
						: perQuestion !== null
							? `≈ ${fmtPerQ(perQuestion)}`
							: null}
				</div>
			</div>
		</div>
	);
}

type CardStackBlockProps = {
	count: number;
	max: number;
};

export function CardStackBlock({ count, max }: CardStackBlockProps) {
	return (
		<div className="flex items-center gap-4">
			<div className="relative h-[120px] w-[96px]">
				<div className="border-border bg-muted absolute inset-0 rotate-[-8deg] rounded-xl border" />
				<div className="border-border bg-muted/80 absolute inset-0 rotate-[-3deg] rounded-xl border" />
				<div className="to-primary absolute inset-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#fb6f3d] text-white shadow-md">
					<div className="text-3xl leading-none font-bold tabular-nums">{count}</div>
				</div>
			</div>
			<div className="flex flex-col gap-1">
				<Eyebrow>Carte</Eyebrow>
				<div className="flex items-baseline gap-1.5">
					<div className="text-foreground text-2xl leading-none font-bold tabular-nums">
						{count}
					</div>
					<div className="text-muted-foreground text-xs">/ {max}</div>
				</div>
			</div>
		</div>
	);
}

type EvalBlockProps = {
	mode: EvaluationMode;
	questionCount: number;
};

export function EvalBlock({ mode, questionCount }: EvalBlockProps) {
	const { maxScaled, minScaled, perQuestionMax, perQuestionMin, hasPenalty } =
		getNormalizedEvaluationScale(mode, questionCount);

	return (
		<div className="flex flex-col gap-3">
			<div className="flex flex-col gap-1.5">
				<Eyebrow>Valutazione</Eyebrow>
				<div className="text-foreground text-sm leading-tight font-semibold">
					{mode.name}
				</div>
			</div>

			<div className="flex flex-col gap-3">
				{/* Punteggio max — total prominent + per-question secondary */}
				<ScorePair
					label="Punteggio max"
					totalValue={`+${maxScaled}`}
					perQuestionLabel="Per domanda corretta"
					perQuestionValue={`+${formatScaledScore(perQuestionMax)}`}
					tone="positive"
				/>

				{hasPenalty && (
					<ScorePair
						label="Punteggio min"
						totalValue={formatScaledSigned(minScaled)}
						perQuestionLabel="Per domanda errata"
						perQuestionValue={formatScaledSigned(perQuestionMin)}
						tone="negative"
					/>
				)}

				{mode.partialCreditEnabled && (
					<div className="border-border/50 flex items-center justify-between border-t pt-2">
						<span className="text-muted-foreground text-xs font-medium">
							Credito parziale
						</span>
						<span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
							Attivo
						</span>
					</div>
				)}
			</div>
		</div>
	);
}

function ScorePair({
	label,
	totalValue,
	perQuestionLabel,
	perQuestionValue,
	tone,
}: {
	label: string;
	totalValue: string;
	perQuestionLabel: string;
	perQuestionValue: string;
	tone: "positive" | "negative";
}) {
	const totalColor =
		tone === "positive"
			? "text-emerald-600 dark:text-emerald-400"
			: "text-red-600 dark:text-red-400";
	const perQuestionColor =
		tone === "positive"
			? "text-emerald-600/70 dark:text-emerald-400/70"
			: "text-red-600/70 dark:text-red-400/70";

	return (
		<div className="flex flex-col gap-0.5">
			<div className="flex items-baseline justify-between">
				<span className="text-muted-foreground text-xs font-medium">{label}</span>
				<span
					className={cn("text-base leading-none font-bold tabular-nums", totalColor)}
				>
					{totalValue}
				</span>
			</div>
			<div className="flex items-baseline justify-between pl-3">
				<span className="text-muted-foreground/70 text-2xs">{perQuestionLabel}</span>
				<span className={cn("text-xs font-medium tabular-nums", perQuestionColor)}>
					{perQuestionValue}
				</span>
			</div>
		</div>
	);
}
