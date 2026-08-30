import { AltArrowRightIcon } from "@solar-icons/react/linear/alt-arrow-right";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Link } from "@tanstack/react-router";

import { AttemptTrendCard } from "./attempt-trend-card";
import { DifficultyAccuracyCard } from "./difficulty-accuracy-card";
import {
	EXAM_ATTEMPT,
	EXAM_DIFFICULTY,
	EXAM_TREND,
	STUDY_ATTEMPT,
	STUDY_DIFFICULTY,
	STUDY_TREND,
	trendAverage,
} from "./fixtures";
import { PaceCard } from "./pace-card";
import { ScoreLedgerCard } from "./score-ledger-card";

/**
 * The three readings that sit between the outcome and the question list: how fast
 * the attempt went, where the points were lost, and whether it is going anywhere.
 * All four cards take the same attempt, so they can be compared side by side.
 */
const meta = {
	title: "Risultati/Metriche",
	parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const history = (
	<Link to="/" className="inline-flex items-center gap-1 text-xs font-medium">
		Vedi lo storico
		<AltArrowRightIcon className="size-3.5" />
	</Link>
);

/**
 * Three references, three shapes: the student's own average on the section, the
 * limit of a simulation, and an attempt that was never timed.
 */
export const Pace: Story = {
	name: "Il ritmo",
	render: () => (
		<div className="space-y-6">
			<PaceCard
				totalMs={STUDY_ATTEMPT.timeSpentMs}
				questions={STUDY_ATTEMPT.questions}
				reference={{ kind: "average", seconds: 51 }}
			/>
			<PaceCard
				totalMs={EXAM_ATTEMPT.timeSpentMs}
				questions={EXAM_ATTEMPT.questions}
				reference={{ kind: "limit", ms: EXAM_ATTEMPT.limitMs }}
			/>
			<PaceCard totalMs={null} questions={STUDY_ATTEMPT.questions} />
		</div>
	),
};

/** The card that says what to go back to — the only one on the page that does. */
export const Difficulty: Story = {
	name: "Accuratezza per difficoltà",
	render: () => (
		<div className="grid gap-6 sm:grid-cols-2">
			<DifficultyAccuracyCard
				byDifficulty={STUDY_DIFFICULTY}
				footer="Le 5 domande difficili sono metà dei punti che hai lasciato."
			/>
			<DifficultyAccuracyCard
				byDifficulty={EXAM_DIFFICULTY}
				footer="Sotto il 50% sulle difficili: è lì che la penalità pesa."
			/>
		</div>
	),
};

/** Only ever shown when the evaluation mode takes points off — otherwise it says nothing. */
export const Ledger: Story = {
	name: "Come si compone il punteggio",
	render: () => (
		<div className="max-w-md">
			<ScoreLedgerCard
				correct={EXAM_ATTEMPT.correct}
				wrong={EXAM_ATTEMPT.wrong}
				unanswered={EXAM_ATTEMPT.unanswered}
				earned={EXAM_ATTEMPT.earned}
				lost={EXAM_ATTEMPT.lost}
				net={EXAM_ATTEMPT.score}
				max={33}
			/>
		</div>
	),
};

/** Two runs: one climbing through the bands, one still under the pass mark. */
export const Trend: Story = {
	name: "L'andamento",
	render: () => (
		<div className="space-y-6">
			<AttemptTrendCard
				title="Andamento su Alberi e grafi"
				points={STUDY_TREND}
				average={trendAverage(STUDY_TREND)}
				attemptLabel="5º tentativo su questa sezione."
				isPersonalBest
				action={history}
			/>
			<AttemptTrendCard
				title="Andamento in simulazione d'esame"
				points={EXAM_TREND}
				average={trendAverage(EXAM_TREND)}
				attemptLabel="4º tentativo in simulazione d'esame."
				isPersonalBest
				action={history}
			/>
			<AttemptTrendCard
				title="Andamento su Alberi e grafi"
				points={[]}
				average={0}
				attemptLabel="Primo tentativo."
				isPersonalBest={false}
			/>
		</div>
	),
};
