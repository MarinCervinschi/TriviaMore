import type { Meta, StoryObj } from "@storybook/react-vite";

import { difficultyBySection } from "./fixtures";
import { MatrixHeatmap } from "./matrix-heatmap";

const meta = {
	title: "Charts/MatrixHeatmap",
	parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<MatrixHeatmap
			title="Errori per sezione e difficoltà"
			description="Dove serve tornare a studiare"
			rows={difficultyBySection.rows}
			columns={difficultyBySection.columns}
			cells={difficultyBySection.cells}
			unitLabel="errori"
		/>
	),
};

/** Two categorical axes, one magnitude — the ramp says how much, never which. */
export const WeekByHour: Story = {
	render: () => {
		const days = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];
		const hours = ["8", "10", "12", "14", "16", "18", "20", "22"];
		const cells = days.flatMap((row, d) =>
			hours.map((column, h) => ({
				row,
				column,
				// Deterministic: an evening-study pattern, lighter at the weekend.
				value: Math.max(0, ((d * 7 + h * 3) % 11) - (d >= 5 ? 4 : 0)),
			}))
		);
		return (
			<MatrixHeatmap
				title="Quando studi"
				description="Sessioni per giorno e fascia oraria"
				rows={days}
				columns={hours}
				cells={cells}
				unitLabel="sessioni"
			/>
		);
	},
};

export const Empty: Story = {
	render: () => (
		<MatrixHeatmap
			title="Errori per sezione e difficoltà"
			rows={[]}
			columns={[]}
			cells={[]}
			emptyMessage="Non ci sono ancora abbastanza dati."
		/>
	),
};
