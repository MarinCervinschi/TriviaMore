import type { Meta, StoryObj } from "@storybook/react-vite";

import { ConsistencyCard } from "./consistency-card";
import { ATTEMPTS, DAILY, FLASHCARD_DAYS, TODAY } from "./fixtures";
import { WhenYouStudyCard } from "./study-rhythm";

const WIDE = 805;
const NARROW = 395;

const meta = {
	title: "Progress/Costanza",
	parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	name: "Costanza",
	render: () => (
		<div style={{ width: WIDE }}>
			<ConsistencyCard
				daily={DAILY}
				flashcardDays={FLASHCARD_DAYS}
				attempts={ATTEMPTS}
				today={TODAY}
			/>
		</div>
	),
};

export const Quando: Story = {
	name: "Quando studi",
	render: () => (
		<div style={{ width: NARROW }}>
			<WhenYouStudyCard attempts={ATTEMPTS} today={TODAY} />
		</div>
	),
};

/** The page's row, with the wide heatmap beside the narrow histogram. */
export const LaRiga: Story = {
	name: "La riga",
	render: () => (
		<div className="flex items-stretch gap-4" style={{ width: WIDE + NARROW + 16 }}>
			<div style={{ width: WIDE }}>
				<ConsistencyCard
					daily={DAILY}
					flashcardDays={FLASHCARD_DAYS}
					attempts={ATTEMPTS}
					today={TODAY}
				/>
			</div>
			<div style={{ width: NARROW }}>
				<WhenYouStudyCard attempts={ATTEMPTS} today={TODAY} />
			</div>
		</div>
	),
};

/** A new user, with no squares, no series, and dashes for the figures. */
export const Vuoto: Story = {
	render: () => (
		<div className="flex items-stretch gap-4" style={{ width: WIDE + NARROW + 16 }}>
			<div style={{ width: WIDE }}>
				<ConsistencyCard daily={[]} attempts={[]} today={TODAY} />
			</div>
			<div style={{ width: NARROW }}>
				<WhenYouStudyCard attempts={[]} today={TODAY} />
			</div>
		</div>
	),
};
