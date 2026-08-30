import { CheckCircleIcon } from "@solar-icons/react/linear/check-circle";
import { ClockCircleIcon } from "@solar-icons/react/linear/clock-circle";
import { CloseCircleIcon } from "@solar-icons/react/linear/close-circle";
import { MinusCircleIcon } from "@solar-icons/react/linear/minus-circle";
import { RecordCircleIcon } from "@solar-icons/react/linear/record-circle";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Figure, FigureRow } from "@/components/shared/figure-row";
import { InsetCard } from "@/components/ui/inset-card";
import { cn } from "@/lib/utils";
import { formatThirtyScaleGrade, getGradeColor } from "@/lib/utils/grading";
import { formatTimeSpent } from "@/lib/utils/quiz-results";

import { DeckCoverage } from "./deck-coverage";
import { STUDY_ATTEMPT } from "./fixtures";
import { GradeBandScale } from "./grade-band-scale";

/**
 * What a finished attempt says about itself before any of the detail: the grade
 * against the five bands, the counts, and — for a flashcard session, which has no
 * grade — how much of the deck was turned over.
 */
const meta = {
	title: "Risultati/Esito",
	parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const SCORES = [12.4, 20.1, 26.4, 29, 32.5];

/** One per band, so the marker, the lit segment and the note can be read against each other. */
export const Bands: Story = {
	name: "Le cinque fasce",
	render: () => (
		<div className="max-w-sm space-y-8">
			{SCORES.map(score => (
				<div key={score} className="space-y-2">
					<p className={cn("text-2xl font-bold tabular-nums", getGradeColor(score))}>
						{formatThirtyScaleGrade(score)}
						<span className="text-muted-foreground ml-1.5 text-sm font-medium">
							/ 30
						</span>
					</p>
					<GradeBandScale score={score} />
				</div>
			))}
		</div>
	),
};

/**
 * The scale in the place it is meant for: the right half of the outcome panel,
 * beside the grade. The counts below split the questions left blank out of the
 * wrong ones — with a penalty they are not worth the same thing.
 */
export const Outcome: Story = {
	name: "Il pannello dell'esito",
	render: () => (
		<InsetCard title="Esito della prova" texture="top" textureAlpha={0.2}>
			<div className="relative flex flex-col sm:flex-row sm:items-stretch">
				<div className="min-w-0 flex-1 p-7">
					<div className="flex items-baseline gap-2.5">
						<span
							className={cn(
								"text-6xl font-bold tracking-tight tabular-nums",
								getGradeColor(STUDY_ATTEMPT.score)
							)}
						>
							{formatThirtyScaleGrade(STUDY_ATTEMPT.score)}
						</span>
						<span className="text-muted-foreground text-xl font-medium">/ 30</span>
					</div>
					<p className="text-muted-foreground mt-3 text-lg">Buono</p>
				</div>
				<div className="border-border/60 flex flex-col justify-center border-t p-7 sm:w-80 sm:border-t-0 sm:border-l">
					<p className="eyebrow text-muted-foreground mb-3.5">Sulla scala</p>
					<GradeBandScale score={STUDY_ATTEMPT.score} />
				</div>
			</div>
			<FigureRow className="relative grid-cols-2 sm:grid-cols-5">
				<Figure
					icon={CheckCircleIcon}
					value={STUDY_ATTEMPT.correct}
					label="Corrette"
					tone="text-success"
				/>
				<Figure
					icon={RecordCircleIcon}
					value={STUDY_ATTEMPT.partial}
					label="Parziali"
					tone="text-warning"
				/>
				<Figure
					icon={CloseCircleIcon}
					value={STUDY_ATTEMPT.wrong}
					label="Errate"
					tone="text-danger"
				/>
				<Figure
					icon={MinusCircleIcon}
					value={STUDY_ATTEMPT.unanswered}
					label="Non risposte"
				/>
				<Figure
					icon={ClockCircleIcon}
					value={formatTimeSpent(STUDY_ATTEMPT.timeSpentMs)}
					label="Tempo"
					tone="text-info"
				/>
			</FigureRow>
		</InsetCard>
	),
};

/** A flashcard session has no grade, so coverage is the headline. */
export const Coverage: Story = {
	name: "La copertura del mazzo",
	render: () => (
		<div className="max-w-sm space-y-8">
			<DeckCoverage total={24} studied={19} />
			<DeckCoverage total={24} studied={24} />
			<DeckCoverage total={16} studied={3} />
		</div>
	),
};
