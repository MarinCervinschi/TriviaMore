import type { Meta, StoryObj } from "@storybook/react-vite";

import { DAILY, TODAY } from "./fixtures";
import { MetricExplorer } from "./metric-explorer";

const SPARSE = DAILY.filter((_, index) => index % 6 === 0);

const meta = {
	title: "Progress/Metric Explorer",
	component: MetricExplorer,
	parameters: { layout: "padded" },
	args: { daily: DAILY, today: TODAY, initialMetric: "grade" },
	argTypes: {
		initialMetric: {
			control: "inline-radio",
			options: ["quizzes", "grade", "accuracy", "time"],
		},
		daily: { table: { disable: true } },
		today: { table: { disable: true } },
	},
} satisfies Meta<typeof MetricExplorer>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The cumulative average stays flat through the months without quizzes. */
export const ConBuchi: Story = { name: "Con i buchi" };

/** A flow drawn as columns, where an empty month's zero is the real value. */
export const Quiz: Story = { name: "Tab Quiz", args: { initialMetric: "quizzes" } };

export const PochiDati: Story = { name: "Pochi dati", args: { daily: SPARSE } };

/** With period and mode passed from above, the card drops its own two chips. */
export const Controllato: Story = {
	name: "Filtri dalla pagina",
	args: { period: "year", mode: "STUDY" },
};

export const Vuoto: Story = { args: { daily: [] } };
