import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Shared header for the quiz and flashcard question cards: the question number,
// its difficulty badge, and a slot for the per-card actions (report / bookmark /
// hint). Presentational and prop-only, so it renders in isolation — the card
// bodies stay coupled to server functions, this extracted core does not.

function difficultyBadgeClass(difficulty: string): string {
	switch (difficulty) {
		case "EASY":
			return "bg-success/10 text-success border-success/20";
		case "MEDIUM":
			return "bg-warning/10 text-warning border-warning/20";
		case "HARD":
			return "bg-destructive/10 text-destructive border-destructive/20";
		default:
			return "";
	}
}

function difficultyLabel(difficulty: string): string {
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
}

export function QuestionHeader({
	number,
	difficulty,
	actions,
	className,
}: {
	number: number;
	difficulty: string;
	actions?: ReactNode;
	className?: string;
}) {
	return (
		<div className={cn("flex items-center justify-between", className)}>
			<div className="flex items-center gap-3">
				<span className="gradient-text text-2xl font-bold">{number}</span>
				<Badge className={difficultyBadgeClass(difficulty)}>
					{difficultyLabel(difficulty)}
				</Badge>
			</div>
			{actions && <div className="flex items-center gap-1">{actions}</div>}
		</div>
	);
}
