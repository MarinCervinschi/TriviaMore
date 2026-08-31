import { InfoCircleIcon } from "@solar-icons/react/linear/info-circle";

import { ChartCard } from "@/components/charts";
import { DifficultyBar, accuracyTone, pctOf } from "@/components/shared/difficulty-bar";
import { InlineEmpty } from "@/components/ui/empty-state";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { UserMastery } from "@/lib/user/types";
import { formatSeconds } from "@/lib/utils/quiz-results";

function InfoDot({ children }: { children: React.ReactNode }) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<button
					type="button"
					aria-label="Informazioni"
					className="text-muted-foreground/50 hover:text-muted-foreground inline-flex align-middle transition-colors"
				>
					<InfoCircleIcon className="size-3.5" />
				</button>
			</TooltipTrigger>
			<TooltipContent className="max-w-64 text-xs font-normal">
				{children}
			</TooltipContent>
		</Tooltip>
	);
}

// Pure SVG: the gauge has to render identically on the server and the client.
function TickGauge({
	pct,
	color,
	size = 184,
	ticks = 34,
}: {
	pct: number;
	color: string;
	size?: number;
	ticks?: number;
}) {
	const stroke = 3;
	const outerR = (size - stroke) / 2;
	const innerR = outerR - Math.round(size * 0.12);
	const cx = size / 2;
	const cy = outerR + stroke / 2;
	const height = Math.round(cy + stroke / 2);
	const filled = Math.round((pct / 100) * ticks);

	return (
		<div className="relative shrink-0" style={{ width: size }} aria-hidden>
			<svg width={size} height={height} className="block">
				{Array.from({ length: ticks }, (_, i) => {
					const a = ((180 - (180 * i) / (ticks - 1)) * Math.PI) / 180;
					const dx = Math.cos(a);
					const dy = -Math.sin(a);
					// Round the trig output: Math.cos/sin differ in the last ULP between
					// Node and the browser, which trips React's hydration check.
					const round = (n: number) => Math.round(n * 1000) / 1000;
					return (
						<line
							key={i}
							x1={round(cx + innerR * dx)}
							y1={round(cy + innerR * dy)}
							x2={round(cx + outerR * dx)}
							y2={round(cy + outerR * dy)}
							stroke={i < filled ? color : "hsl(var(--muted))"}
							strokeWidth={stroke}
							strokeLinecap="round"
						/>
					);
				})}
			</svg>
			<div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
				<span className="text-2xl font-bold tabular-nums">{pct}%</span>
				<span className="text-muted-foreground text-xs">Generale</span>
			</div>
		</div>
	);
}

/**
 * Mastery in one narrow column: the gauge on top and the difficulty bars under it.
 * For a dashboard grid, where this sits beside a wide chart and has to reach its
 * height without spreading sideways.
 */
export function MasteryCard({ mastery }: { mastery: UserMastery }) {
	const total = mastery.byDifficulty.reduce((sum, row) => sum + row.total, 0);
	const correct = mastery.byDifficulty.reduce((sum, row) => sum + row.correct, 0);
	const pct = pctOf(correct, total);

	return (
		<TooltipProvider delayDuration={100}>
			<ChartCard
				title={
					<span className="flex items-center gap-1.5">
						Dove sbagli
						<InfoDot>
							Quanto padroneggi gli argomenti, dalle risposte corrette per singola
							domanda — non dal voto dei quiz.
						</InfoDot>
					</span>
				}
				// Short enough not to wrap at the narrow width: the band then matches the
				// two-line header of the wide card beside it, and the panels line up.
				description="Accuratezza per difficoltà"
				texture="top"
				className="h-full"
				actions={
					mastery.avgSecondsPerQuestion != null && (
						<span className="text-muted-foreground text-xs tabular-nums">
							~{formatSeconds(mastery.avgSecondsPerQuestion)} / domanda
						</span>
					)
				}
			>
				{mastery.totalAnswers === 0 ? (
					<InlineEmpty>Nessuna risposta registrata in questo periodo.</InlineEmpty>
				) : (
					<div className="flex flex-col gap-6">
						<div className="flex flex-col items-center">
							<TickGauge pct={pct} color={accuracyTone(pct).fill} size={200} />
							<p className="text-muted-foreground text-xs tabular-nums">
								{correct}/{total}
							</p>
						</div>

						<div className="space-y-4">
							{mastery.byDifficulty.map(row => (
								<DifficultyBar key={row.key} row={row} layout="stacked" />
							))}
						</div>
					</div>
				)}
			</ChartCard>
		</TooltipProvider>
	);
}
