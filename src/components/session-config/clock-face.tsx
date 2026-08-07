import { cn } from "@/lib/utils";

type ClockFaceProps = {
	/** Minutes (0–∞) or null for unlimited (∞ glyph). */
	minutes: number | null;
	/** Rendered side length in px. */
	size?: number;
	className?: string;
};

const VB = 72;
const CX = VB / 2;
const CY = VB / 2;
const OUTER_R = 33;
const DIAL_R = 28;
const HAND_R = 24;
const TICK_OUTER = 27;
const TICK_MAJOR_INNER = 22;
const TICK_MINOR_INNER = 24;

/** Convert a clock angle (deg, 0 at 12 o'clock, clockwise) to a point on a circle. */
function pointOnCircle(angleDeg: number, radius: number) {
	const theta = (angleDeg - 90) * (Math.PI / 180);
	return {
		x: CX + radius * Math.cos(theta),
		y: CY + radius * Math.sin(theta),
	};
}

export function ClockFace({ minutes, size = 64, className }: ClockFaceProps) {
	const isUnlimited = minutes === null;
	const safeMinutes = isUnlimited ? 0 : Math.max(0, minutes);
	const angle = Math.min(360, (safeMinutes / 60) * 360);
	const showSweep = !isUnlimited && angle > 0;
	const showHand = !isUnlimited && safeMinutes > 0;

	let sweepPath: string | null = null;
	if (showSweep) {
		if (angle >= 360) {
			// Full circle as a path (two arcs to render as filled ring slice).
			sweepPath = `M ${CX} ${CY - DIAL_R} A ${DIAL_R} ${DIAL_R} 0 1 1 ${CX - 0.001} ${CY - DIAL_R} Z`;
		} else {
			const end = pointOnCircle(angle, DIAL_R);
			const largeArc = angle > 180 ? 1 : 0;
			sweepPath = `M ${CX} ${CY} L ${CX} ${CY - DIAL_R} A ${DIAL_R} ${DIAL_R} 0 ${largeArc} 1 ${end.x.toFixed(3)} ${end.y.toFixed(3)} Z`;
		}
	}

	const handEnd = pointOnCircle(angle, HAND_R);

	// Build 12 major ticks and 12 minor ticks between them.
	const ticks: { x1: number; y1: number; x2: number; y2: number; major: boolean }[] =
		[];
	for (let i = 0; i < 60; i += 5) {
		const major = i % 15 === 0;
		const a = (i / 60) * 360;
		const outer = pointOnCircle(a, TICK_OUTER);
		const inner = pointOnCircle(a, major ? TICK_MAJOR_INNER : TICK_MINOR_INNER);
		ticks.push({ x1: outer.x, y1: outer.y, x2: inner.x, y2: inner.y, major });
	}

	return (
		<svg
			viewBox={`0 0 ${VB} ${VB}`}
			width={size}
			height={size}
			role="img"
			aria-label={isUnlimited ? "Tempo illimitato" : `${safeMinutes} minuti`}
			className={cn("text-foreground shrink-0", className)}
		>
			<circle
				cx={CX}
				cy={CY}
				r={OUTER_R}
				fill="none"
				stroke="currentColor"
				strokeOpacity={0.2}
				strokeWidth={1.5}
			/>
			<circle cx={CX} cy={CY} r={DIAL_R} fill="currentColor" fillOpacity={0.05} />

			{sweepPath && <path d={sweepPath} fill="hsl(var(--primary) / 0.85)" />}

			{ticks.map((t, i) => (
				<line
					key={i}
					x1={t.x1}
					y1={t.y1}
					x2={t.x2}
					y2={t.y2}
					stroke="currentColor"
					strokeOpacity={t.major ? 0.55 : 0.35}
					strokeWidth={t.major ? 1 : 0.6}
					strokeLinecap="round"
				/>
			))}

			{isUnlimited ? (
				<text
					x={CX}
					y={CY}
					textAnchor="middle"
					dominantBaseline="central"
					fontSize={22}
					fontWeight={700}
					fill="currentColor"
				>
					∞
				</text>
			) : (
				<>
					{showHand && (
						<line
							x1={CX}
							y1={CY}
							x2={handEnd.x}
							y2={handEnd.y}
							stroke="currentColor"
							strokeWidth={1.6}
							strokeLinecap="round"
						/>
					)}
					<circle cx={CX} cy={CY} r={2.4} fill="currentColor" />
				</>
			)}
		</svg>
	);
}
