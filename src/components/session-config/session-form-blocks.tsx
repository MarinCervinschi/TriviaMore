import { useId } from "react";

import { InfoCircleIcon } from "@solar-icons/react/linear/info-circle";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import type { EvaluationMode } from "@/lib/quiz/types";
import { cn } from "@/lib/utils";

type SliderWithInputProps = {
	label: string;
	value: number;
	onChange: (value: number) => void;
	min: number;
	max: number;
	step?: number;
	hint?: string;
	className?: string;
};

export function SliderWithInput({
	label,
	value,
	onChange,
	min,
	max,
	step = 1,
	hint,
	className,
}: SliderWithInputProps) {
	const id = useId();

	const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		const raw = e.target.value;
		if (raw === "") return;
		const n = Number(raw);
		if (Number.isNaN(n)) return;
		onChange(Math.min(max, Math.max(min, n)));
	};

	return (
		<div className={cn("flex flex-col gap-3", className)}>
			<div className="flex items-center justify-between gap-2">
				<Label htmlFor={id} className="text-sm font-medium">
					{label}
				</Label>
				<Input
					id={id}
					type="number"
					min={min}
					max={max}
					step={step}
					value={value}
					onChange={handleInput}
					className="h-8 w-20 text-right tabular-nums"
				/>
			</div>
			<Slider
				value={[value]}
				onValueChange={([v]) => onChange(v)}
				min={min}
				max={max}
				step={step}
				aria-label={label}
			/>
			{hint && <div className="text-muted-foreground text-xs tabular-nums">{hint}</div>}
		</div>
	);
}

type TimeTickRowProps = {
	/** Discrete time steps in minutes; an extra ∞ tick is rendered at index === steps.length. */
	steps: readonly number[];
	index: number;
	onChange: (index: number) => void;
	className?: string;
};

export function TimeTickRow({ steps, index, onChange, className }: TimeTickRowProps) {
	const unlimitedIndex = steps.length;

	const ticks: {
		idx: number;
		label: string;
		ariaLabel: string;
	}[] = [
		...steps.map((m, i) => ({
			idx: i,
			label: `${m}`,
			ariaLabel: `${m} minuti`,
		})),
		{
			idx: unlimitedIndex,
			label: "∞",
			ariaLabel: "Tempo illimitato",
		},
	];

	return (
		<div className={cn("flex flex-col gap-2", className)}>
			<div className="flex items-center justify-between">
				<Label className="text-sm font-medium">Tempo limite</Label>
				<span className="text-muted-foreground text-xs font-medium tabular-nums">
					{index >= unlimitedIndex ? "Illimitato" : `${steps[index]} min`}
				</span>
			</div>
			<div className="grid grid-cols-5 gap-1 sm:grid-cols-10">
				{ticks.map(t => {
					const active = t.idx === index;
					return (
						<button
							key={t.idx}
							type="button"
							aria-label={t.ariaLabel}
							aria-pressed={active}
							onClick={() => onChange(t.idx)}
							className={cn(
								"flex h-11 items-center justify-center rounded-md border text-xs font-medium tabular-nums transition-colors sm:h-9",
								"focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none",
								active
									? "border-primary bg-primary text-primary-foreground shadow-sm"
									: "border-border bg-background text-foreground hover:border-primary/40 hover:bg-muted"
							)}
						>
							{t.label}
						</button>
					);
				})}
			</div>
		</div>
	);
}

type EvalSelectProps = {
	modes: EvaluationMode[];
	value: string | undefined;
	onChange: (value: string) => void;
	className?: string;
};

export function EvalSelect({ modes, value, onChange, className }: EvalSelectProps) {
	return (
		<div className={cn("flex flex-col gap-2", className)}>
			<Label className="text-sm font-medium">Modalità di valutazione</Label>
			<Select value={value ?? modes[0]?.id} onValueChange={onChange}>
				<SelectTrigger>
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{modes.map(mode => (
						<SelectItem key={mode.id} value={mode.id}>
							{mode.name}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}

type EvalInfoCardProps = {
	mode: EvaluationMode;
	className?: string;
};

export function EvalInfoCard({ mode, className }: EvalInfoCardProps) {
	if (!mode.description) return null;

	return (
		<div
			className={cn(
				"bg-muted/50 text-muted-foreground flex gap-2 rounded-lg p-3 text-xs",
				className
			)}
		>
			<InfoCircleIcon className="text-brand mt-0.5 h-3.5 w-3.5 shrink-0" />
			<p className="leading-relaxed">{mode.description}</p>
		</div>
	);
}
