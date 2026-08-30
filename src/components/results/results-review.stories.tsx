import { useState } from "react";

import { BookmarkIcon } from "@solar-icons/react/linear/bookmark";
import { FlagIcon } from "@solar-icons/react/linear/flag";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";

import { REVIEW_FIXTURES } from "./fixtures";
import { ReviewItem } from "./review-item";

/**
 * The question list under the outcome. The row is the closed state and an
 * `InsetCard` the open one; the filter above it defaults to what is left to go
 * back to, not to everything.
 *
 * The header carries only the verdict — icon, points, chevron. The difficulty and
 * the two per-question actions sit in the strip at the top of the open panel.
 *
 * The actions are stand-ins here: in the app the slot takes `BookmarkButton` and
 * `ReportButton`, which both mutate.
 */
const meta = {
	title: "Risultati/Revisione",
	parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const actions = (
	<>
		<Button
			variant="outline"
			size="icon"
			aria-label="Salva la domanda nei preferiti"
			className="border-border/60 size-8 rounded-lg"
		>
			<BookmarkIcon />
		</Button>
		<Button
			variant="outline"
			size="icon"
			aria-label="Segnala un errore nella domanda"
			className="border-border/60 size-8 rounded-lg"
		>
			<FlagIcon />
		</Button>
	</>
);

/** The four verdicts, the first one open. */
export const List: Story = {
	name: "La lista",
	render: () => (
		<div className="mx-auto max-w-4xl space-y-3">
			{REVIEW_FIXTURES.map((fixture, index) => (
				<ReviewItem
					key={fixture.question.id}
					index={index}
					question={fixture.question}
					userAnswer={fixture.userAnswer}
					verdict={fixture.verdict}
					scaledScore={fixture.scaledScore}
					actions={actions}
					defaultOpen={index === 0}
				/>
			))}
		</div>
	),
};

/** Open, with an explanation and without: the footer band only exists when there is one. */
export const Open: Story = {
	name: "Aperta",
	render: () => (
		<div className="mx-auto max-w-4xl space-y-3">
			<ReviewItem
				index={3}
				question={REVIEW_FIXTURES[0]!.question}
				userAnswer={REVIEW_FIXTURES[0]!.userAnswer}
				verdict="wrong"
				scaledScore={0}
				actions={actions}
				defaultOpen
			/>
			<ReviewItem
				index={16}
				question={REVIEW_FIXTURES[3]!.question}
				userAnswer={REVIEW_FIXTURES[3]!.userAnswer}
				verdict="correct"
				scaledScore={1.1}
				actions={actions}
				defaultOpen
			/>
		</div>
	),
};

function Filtered() {
	const [filter, setFilter] = useState<"todo" | "all" | "correct">("todo");
	const shown = REVIEW_FIXTURES.filter(fixture =>
		filter === "all"
			? true
			: filter === "correct"
				? fixture.verdict === "correct"
				: fixture.verdict !== "correct"
	);

	return (
		<div className="mx-auto max-w-4xl space-y-3.5">
			<div className="flex flex-wrap items-center justify-between gap-4">
				<h2 className="text-xl font-bold tracking-tight">Revisione domande</h2>
				<SegmentedControl
					label="Filtra le domande"
					value={filter}
					onChange={setFilter}
					options={[
						{ value: "todo", label: "Da rivedere", count: 3 },
						{ value: "all", label: "Tutte", count: 4 },
						{ value: "correct", label: "Corrette", count: 1 },
					]}
				/>
			</div>
			<div className="space-y-3">
				{shown.map((fixture, index) => (
					<ReviewItem
						key={fixture.question.id}
						index={index}
						question={fixture.question}
						userAnswer={fixture.userAnswer}
						verdict={fixture.verdict}
						scaledScore={fixture.scaledScore}
						actions={actions}
					/>
				))}
			</div>
		</div>
	);
}

/** The list as the page shows it, filtered to what is left to go back to. */
export const Filter: Story = {
	name: "Con il filtro",
	render: () => <Filtered />,
};
