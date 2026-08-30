import { InsetCard } from "@/components/ui/inset-card";
import { cn } from "@/lib/utils";
import { formatSeconds, formatTimeSpent } from "@/lib/utils/quiz-results";

/** What the attempt's pace is read against. */
export type PaceReference =
	| { kind: "limit"; ms: number }
	| { kind: "average"; seconds: number };

function Meter({ pct, tone }: { pct: number; tone: string }) {
	return (
		<div className="bg-muted h-2 overflow-hidden rounded-full">
			<div
				className={cn("h-full rounded-full", tone)}
				style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
			/>
		</div>
	);
}

function Row({
	label,
	value,
	pct,
	tone,
	muted,
}: {
	label: string;
	value: string;
	pct: number;
	tone: string;
	muted?: boolean;
}) {
	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between gap-3 text-xs">
				<span className={muted ? "text-muted-foreground" : "font-medium"}>{label}</span>
				<span className="text-muted-foreground tabular-nums">{value}</span>
			</div>
			<Meter pct={pct} tone={tone} />
		</div>
	);
}

/**
 * The attempt's pace: seconds per question, and the one number that makes it mean
 * something — the time limit in a simulation, the student's own average on the
 * section in study.
 *
 * Per-question timing is not recorded (the column went with migration 0017), so
 * the average is the attempt's total over the questions it had. That is all this
 * card ever claims.
 */
export function PaceCard({
	totalMs,
	questions,
	reference,
	className,
}: {
	/** The whole attempt, in milliseconds — `quiz_attempts.time_spent`. */
	totalMs: number | null;
	questions: number;
	reference?: PaceReference;
	className?: string;
}) {
	if (totalMs == null || questions === 0) {
		return (
			<InsetCard title="Ritmo" className={className}>
				<p className="text-muted-foreground p-5 text-sm">
					Questo tentativo non è stato cronometrato.
				</p>
			</InsetCard>
		);
	}

	const seconds = Math.round(totalMs / 1000);
	const perQuestion = Math.round(seconds / questions);
	const limit = reference?.kind === "limit" ? reference.ms : null;
	// A limit is always a whole number of minutes, and `formatTimeSpent` would spell
	// that "20m 0s".
	const limitLabel = limit != null ? formatSeconds(Math.round(limit / 1000)) : null;

	return (
		<InsetCard title="Ritmo" className={className}>
			<div className="flex flex-wrap items-center gap-x-8 gap-y-5 p-5">
				<div className="shrink-0">
					<div className="flex items-baseline gap-2">
						<span className="text-3xl font-bold tabular-nums">
							{formatSeconds(perQuestion)}
						</span>
						<span className="text-muted-foreground text-sm">in media per domanda</span>
					</div>
					{limit && (
						<p className="text-muted-foreground mt-2 text-xs">
							Ne avevi {formatSeconds(Math.round(limit / 1000 / questions))} a
							disposizione per domanda.
						</p>
					)}
				</div>

				<div className="min-w-56 flex-1 space-y-3">
					{limit ? (
						<>
							<Row
								label={`${formatTimeSpent(totalMs)} usati`}
								value={`${limitLabel} di limite`}
								pct={(totalMs / limit) * 100}
								tone="bg-info"
							/>
							<p className="text-muted-foreground text-xs">
								{totalMs < limit
									? `Hai consegnato con ${formatSeconds(Math.round((limit - totalMs) / 1000))} di margine.`
									: "Hai usato tutto il tempo a disposizione."}
							</p>
						</>
					) : reference?.kind === "average" ? (
						<>
							<Row
								label="Questo tentativo"
								value={formatSeconds(perQuestion)}
								pct={(perQuestion / Math.max(perQuestion, reference.seconds)) * 100}
								tone="bg-info"
							/>
							<Row
								label="La tua media su questa sezione"
								value={formatSeconds(reference.seconds)}
								pct={
									(reference.seconds / Math.max(perQuestion, reference.seconds)) * 100
								}
								tone="bg-muted-foreground/35"
								muted
							/>
						</>
					) : null}
				</div>
			</div>
		</InsetCard>
	);
}
