import { InsetCard } from "@/components/ui/inset-card";
import { formatScaledScore, formatScaledSigned } from "@/lib/quiz/scoring";
import { cn } from "@/lib/utils";

function LedgerRow({
	swatch,
	label,
	value,
	ink,
}: {
	swatch: string;
	label: string;
	value: string;
	ink: string;
}) {
	return (
		<div className="flex items-center gap-2 text-sm">
			<span aria-hidden className={cn("size-2.5 shrink-0 rounded-sm", swatch)} />
			<span className="text-muted-foreground flex-1">{label}</span>
			<span className={cn("font-semibold tabular-nums", ink)}>{value}</span>
		</div>
	);
}

/**
 * How the grade was arrived at, when a wrong answer costs points: what the correct
 * answers earned, what the penalty took back, and the net between them.
 *
 * It exists for the one thing an evaluation mode with a penalty makes true and
 * nothing else on the page says — that leaving a question blank was free, and
 * guessing was not.
 */
export function ScoreLedgerCard({
	correct,
	wrong,
	unanswered,
	earned,
	lost,
	net,
	max,
	className,
}: {
	correct: number;
	wrong: number;
	unanswered: number;
	/** Points gained, on the 0–33 scale. */
	earned: number;
	/** Points the penalty took back, as a positive number on the same scale. */
	lost: number;
	/** The grade the attempt was given. Not `earned - lost`: the page must not show two answers. */
	net: number;
	max: number;
	className?: string;
}) {
	const earnedPct = (earned / max) * 100;
	const netPct = (Math.max(0, net) / max) * 100;

	return (
		<InsetCard
			title="Come si compone il punteggio"
			className={className}
			panelClassName="h-full"
			footer="Le domande lasciate in bianco non tolgono punti."
		>
			<div className="space-y-5 p-5">
				<div className="relative pt-1.5">
					<div className="bg-muted relative h-3.5 overflow-hidden rounded-full">
						<div
							className="bg-success absolute inset-y-0 left-0"
							style={{ width: `${earnedPct}%` }}
						/>
						<div
							className="bg-destructive border-card absolute inset-y-0 border-l-2"
							style={{ left: `${netPct}%`, width: `${earnedPct - netPct}%` }}
						/>
					</div>
					<div
						aria-hidden
						className="bg-foreground absolute top-0 h-6.5 w-0.5 rounded-full"
						style={{ left: `${netPct}%` }}
					/>
					<div className="text-muted-foreground mt-3 flex justify-between text-xs tabular-nums">
						<span>0</span>
						<span className="text-foreground font-semibold">
							{formatScaledScore(net)} di netto
						</span>
						<span>{max}</span>
					</div>
				</div>

				<div className="space-y-2">
					<LedgerRow
						swatch="bg-success"
						label={`${correct} corrette`}
						value={formatScaledSigned(earned)}
						ink="text-success"
					/>
					<LedgerRow
						swatch="bg-destructive"
						label={`${wrong} errate`}
						value={formatScaledSigned(-lost)}
						ink="text-danger"
					/>
					<LedgerRow
						swatch="bg-muted-foreground/35"
						label={`${unanswered} non risposte`}
						value={formatScaledScore(0)}
						ink="text-muted-foreground"
					/>
				</div>
			</div>
		</InsetCard>
	);
}
