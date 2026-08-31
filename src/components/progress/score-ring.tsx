import { cn } from "@/lib/utils";
import { getGradeChartColor } from "@/lib/utils/grading";

const RADIUS = 15;
// Rounded on purpose: a raw circumference is a long float, and a value that
// renders differently on the server than in the browser breaks hydration.
const CIRCUMFERENCE = Math.round(2 * Math.PI * RADIUS * 100) / 100;
const MAX_SCORE = 33;

/**
 * A grade as a ring, for a row that is read at a glance: the arc is the share of
 * 33 and takes the same band colour the number does, so scanning a column of
 * these sorts itself before any of the figures are read.
 */
export function ScoreRing({
	score,
	size = 36,
	className,
}: {
	score: number;
	size?: number;
	className?: string;
}) {
	const share = Math.max(0, Math.min(1, score / MAX_SCORE));
	const filled = Math.round(share * CIRCUMFERENCE * 100) / 100;

	return (
		<span
			className={cn("relative inline-flex shrink-0", className)}
			style={{ width: size, height: size }}
		>
			<svg viewBox="0 0 36 36" width={size} height={size} className="-rotate-90">
				<circle
					cx="18"
					cy="18"
					r={RADIUS}
					fill="none"
					stroke="hsl(var(--muted))"
					strokeWidth="3"
				/>
				<circle
					cx="18"
					cy="18"
					r={RADIUS}
					fill="none"
					stroke={getGradeChartColor(score)}
					strokeWidth="3"
					strokeLinecap="round"
					strokeDasharray={`${filled} ${CIRCUMFERENCE}`}
				/>
			</svg>
			<span className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold tabular-nums">
				{Math.round(score)}
			</span>
		</span>
	);
}
