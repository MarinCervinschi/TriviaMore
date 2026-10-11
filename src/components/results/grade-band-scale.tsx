import { cn } from "@/lib/utils";
import { GRADE_BANDS, gradeBandIndex, pointsToNextBand } from "@/lib/utils/grading";

// Equal segments, because a proportional track would squash the four bands that matter.
export function GradeBandScale({
	score,
	className,
}: {
	/** The raw score on the 0–33 scale, before rounding. */
	score: number;
	className?: string;
}) {
	const active = gradeBandIndex(score);
	const next = pointsToNextBand(score);

	return (
		<div className={cn("flex flex-col gap-1.5", className)}>
			<div className="relative h-2.5">
				<div className="flex h-2.5 gap-0.5">
					{GRADE_BANDS.map((band, index) => (
						<div
							key={band.key}
							className="flex-1 rounded-full"
							style={{
								backgroundColor:
									index === active
										? band.chart
										: `color-mix(in srgb, ${band.chart} 22%, transparent)`,
							}}
						/>
					))}
				</div>
				<div
					aria-hidden
					className={cn(
						"absolute -top-1.5 h-1 w-2.5 rounded-full",
						GRADE_BANDS[active]!.mark
					)}
					style={{ left: `calc(${(active + 0.5) * 20}% - 5px)` }}
				/>
			</div>

			<div className="flex gap-0.5">
				{GRADE_BANDS.map((band, index) => (
					<div
						key={band.key}
						className={cn(
							"text-2xs flex-1 text-center tabular-nums",
							index === active
								? cn("font-semibold", band.text)
								: "text-muted-foreground"
						)}
					>
						{band.label}
					</div>
				))}
			</div>

			{next && (
				<p className="text-muted-foreground mt-1 text-xs">
					{next.points === 1 ? "Ti manca 1 punto" : `Ti mancano ${next.points} punti`}{" "}
					per la fascia {next.band.name}.
				</p>
			)}
		</div>
	);
}
