import { formatMetricValue } from "@/lib/achievements/format";
import type { AchievementView } from "@/lib/achievements/types";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils/format";

import { AchievementMedal, achievementStroke } from "./achievement-medal";

// Precomputed, as `ScoreRing` and `TickArc` are: trigonometry at render breaks
// hydration. The box is reserved on every tile so the grid never jumps.
const CRADLE = [
	[10.0, 50.0, 3.0, 50.0],
	[10.68, 57.35, 3.8, 58.64],
	[12.7, 64.45, 6.17, 66.98],
	[15.99, 71.06, 10.04, 74.74],
	[20.44, 76.95, 15.27, 81.66],
	[25.89, 81.92, 21.68, 87.51],
	[32.17, 85.81, 29.05, 92.07],
	[39.05, 88.47, 37.14, 95.21],
	[46.31, 89.83, 45.66, 96.8],
	[53.69, 89.83, 54.34, 96.8],
	[60.95, 88.47, 62.86, 95.21],
	[67.83, 85.81, 70.95, 92.07],
	[74.11, 81.92, 78.32, 87.51],
	[79.56, 76.95, 84.73, 81.66],
	[84.01, 71.06, 89.96, 74.74],
	[87.3, 64.45, 93.83, 66.98],
	[89.32, 57.35, 96.2, 58.64],
	[90.0, 50.0, 97.0, 50.0],
] as const;

/** One achievement, on the page rather than in a card: the medal is the object. */
export function AchievementTile({
	achievement,
	onOpen,
}: {
	achievement: AchievementView;
	onOpen: (achievement: AchievementView) => void;
}) {
	const locked = achievement.awardedAt === null;
	const { progress } = achievement;
	const filled = progress ? Math.round(progress.ratio * CRADLE.length) : 0;
	const stroke = achievementStroke(achievement.accent);

	return (
		<button
			type="button"
			onClick={() => onOpen(achievement)}
			className="hover:bg-muted/40 focus-visible:ring-ring group flex flex-col items-center gap-2 rounded-2xl px-2 py-4 text-center transition-colors focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none"
		>
			<span className="relative inline-flex size-24 items-center justify-center">
				{progress && (
					<svg viewBox="0 0 100 100" className="absolute inset-0 size-full" aria-hidden>
						{CRADLE.map(([x1, y1, x2, y2], index) => (
							<line
								key={x1 + "-" + y1}
								x1={x1}
								y1={y1}
								x2={x2}
								y2={y2}
								strokeWidth={4}
								strokeLinecap="round"
								className={index < filled ? stroke : "stroke-border"}
							/>
						))}
					</svg>
				)}
				<AchievementMedal
					icon={achievement.icon}
					accent={achievement.accent}
					shape={achievement.shape}
					tier={achievement.tier}
					locked={locked}
					size="xl"
					className="transition-transform duration-200 group-hover:-translate-y-0.5 motion-reduce:transition-none"
				/>
			</span>

			<div className="flex w-full min-w-0 flex-col items-center gap-0.5">
				<p
					className={cn(
						"w-full text-sm font-semibold text-balance",
						locked && "text-muted-foreground"
					)}
				>
					{achievement.name}
				</p>
				<p className="text-muted-foreground text-2xs tabular-nums">
					{locked
						? progress
							? `${formatMetricValue(achievement.metric, progress.value)} di ${formatMetricValue(achievement.metric, progress.target)}`
							: "Da sbloccare"
						: formatDate(achievement.awardedAt!)}
				</p>
			</div>
		</button>
	);
}
