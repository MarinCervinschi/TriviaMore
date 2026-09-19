import { CheckGlyph } from "@/components/icons";
import { cn } from "@/lib/utils";

export interface OnboardingStep {
	id: string;
	label: string;
}

/** Clickable only up to `maxReachable`, the furthest step actually reached:
 *  going back must not become a way of skipping ahead past a choice. */
export function OnboardingSteps({
	steps,
	current,
	maxReachable = current,
	onStepSelect,
	className,
}: {
	steps: OnboardingStep[];
	current: number;
	maxReachable?: number;
	onStepSelect?: (index: number) => void;
	className?: string;
}) {
	return (
		<ol className={cn("flex items-center gap-2 sm:gap-3", className)}>
			{steps.map((step, index) => {
				const done = index < current;
				const active = index === current;
				const clickable =
					onStepSelect !== undefined && index <= maxReachable && !active;

				const marker = (
					<span
						className={cn(
							"relative flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors motion-reduce:transition-none",
							done && "bg-primary text-primary-foreground",
							active && "text-foreground",
							!done && !active && "bg-muted text-muted-foreground"
						)}
					>
						{active && (
							<span
								aria-hidden
								className="outline-primary absolute inset-0 animate-spin rounded-full outline-2 outline-dashed [animation-duration:9s]"
							/>
						)}
						{done ? <CheckGlyph className="size-4" /> : index + 1}
					</span>
				);

				const label = (
					<span
						className={cn(
							"truncate text-sm font-medium",
							active ? "text-foreground" : "text-muted-foreground",
							!active && "hidden sm:inline"
						)}
					>
						{step.label}
					</span>
				);

				return (
					<li
						key={step.id}
						aria-current={active ? "step" : undefined}
						className={cn(
							"flex min-w-0 items-center gap-2 sm:gap-3",
							index > 0 && "flex-1"
						)}
					>
						{index > 0 && (
							<span
								aria-hidden
								className={cn(
									"h-px flex-1",
									done || active ? "bg-primary" : "bg-border"
								)}
							/>
						)}
						{clickable ? (
							<button
								type="button"
								onClick={() => onStepSelect(index)}
								className="focus-visible:ring-ring flex min-w-0 cursor-pointer items-center gap-2 rounded-full focus-visible:ring-2 focus-visible:outline-none sm:gap-3"
							>
								{marker}
								{label}
								<span className="sr-only">Torna a questo passo</span>
							</button>
						) : (
							<span className="flex min-w-0 items-center gap-2 sm:gap-3">
								{marker}
								{label}
							</span>
						)}
					</li>
				);
			})}
		</ol>
	);
}
