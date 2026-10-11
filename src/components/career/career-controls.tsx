import type { ReactNode } from "react";

import { MinusGlyph, PlusGlyph } from "@/components/icons";
import { ScoreRing } from "@/components/progress/score-ring";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { HONOURS_STEP, formatStep } from "./career-model";

export function Stepper({
	value,
	onChange,
	min,
	max,
	step = 1,
	label,
	children,
	className,
}: {
	value: number;
	onChange: (value: number) => void;
	min: number;
	max: number;
	step?: number;
	/** The accessible name of the value, e.g. "Voto previsto per Smart Robotics". */
	label: string;
	/** What sits between the buttons; the bare value when omitted. */
	children?: ReactNode;
	className?: string;
}) {
	const set = (next: number) =>
		onChange(Math.max(min, Math.min(max, Math.round(next / step) * step)));

	return (
		<div
			role="group"
			aria-label={label}
			className={cn("inline-flex items-center gap-1.5", className)}
		>
			<Button
				type="button"
				variant="outline"
				size="icon"
				className="size-8 rounded-lg"
				disabled={value <= min}
				onClick={() => set(value - step)}
				aria-label="Diminuisci"
			>
				<MinusGlyph />
			</Button>
			<output aria-live="polite" className="flex min-w-9 justify-center tabular-nums">
				{children ?? <span className="text-sm font-semibold">{value}</span>}
			</output>
			<Button
				type="button"
				variant="outline"
				size="icon"
				className="size-8 rounded-lg"
				disabled={value >= max}
				onClick={() => set(value + step)}
				aria-label="Aumenta"
			>
				<PlusGlyph />
			</Button>
		</div>
	);
}

/** An exam grade as a ring that closes at 30 e lode, the 31st step. */
export function GradeRing({ step, size = 36 }: { step: number; size?: number }) {
	return (
		<ScoreRing score={step} label={formatStep(step)} max={HONOURS_STEP} size={size} />
	);
}
