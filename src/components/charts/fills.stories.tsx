import type { Meta, StoryObj } from "@storybook/react-vite";

import { ComparisonChart } from "./comparison-chart";
import { DonutChart, foldDonutTail } from "./donut-chart";
import { manyDepartments, monthlyActivity } from "./fixtures";

const meta = {
	title: "Charts/Fills",
	parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const BrandRampAndOwnHue: Story = {
	render: () => (
		<div className="grid gap-6 md:grid-cols-2">
			<ComparisonChart
				title="Serie primaria"
				description="Rampa brand a 135°"
				data={monthlyActivity}
				categoryKey="mese"
				series={[{ key: "quiz", label: "Quiz" }]}
			/>
			<ComparisonChart
				title="Due serie"
				description="Ognuna sfuma nella propria tinta"
				data={monthlyActivity}
				categoryKey="mese"
				series={[
					{ key: "quiz", label: "Quiz" },
					{ key: "flashcard", label: "Flashcard" },
				]}
			/>
		</div>
	),
};

export const HatchedMeansSomething: Story = {
	render: () => (
		<div className="grid gap-6 md:grid-cols-2">
			<div className="max-w-sm">
				<DonutChart
					title="Corsi per dipartimento"
					description="La coda diventa «Altro», tratteggiato"
					unitLabel="corsi"
					data={foldDonutTail(manyDepartments)}
				/>
			</div>
			<ComparisonChart
				title="Mese in corso"
				description="L'ultima barra è tratteggiata perché il dato è parziale"
				data={monthlyActivity}
				categoryKey="mese"
				series={[
					{ key: "quiz", label: "Completati" },
					{ key: "flashcard", label: "In corso", fill: "hatched" },
				]}
			/>
		</div>
	),
};

export const Solid: Story = {
	render: () => (
		<ComparisonChart
			title="Quiz per mese"
			data={monthlyActivity}
			categoryKey="mese"
			series={[{ key: "quiz", label: "Quiz", fill: "solid" }]}
		/>
	),
};
