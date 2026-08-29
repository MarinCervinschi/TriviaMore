import type { Meta, StoryObj } from "@storybook/react-vite";

import { DAILY, TODAY } from "./fixtures";
import { MetricExplorer } from "./metric-explorer";

// The same student the rest of the progress stories read, thinned out: bursts
// around the sessions, and long quiet stretches where a cumulative average has
// to hold its value instead of falling to zero.
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

/**
 * Il caso che conta: la media cumulativa resta piatta nei mesi senza quiz invece
 * di crollare a zero, e i punti dicono quali giornate ci sono state davvero.
 */
export const ConBuchi: Story = { name: "Con i buchi" };

/** Un flusso: colonne, e lo zero di un mese vuoto è il valore vero. */
export const Quiz: Story = { name: "Tab Quiz", args: { initialMetric: "quizzes" } };

export const PochiDati: Story = { name: "Pochi dati", args: { daily: SPARSE } };

/** Con periodo e modalità dall'alto la card lascia cadere i propri due chip. */
export const Controllato: Story = {
	name: "Filtri dalla pagina",
	args: { period: "year", mode: "STUDY" },
};

export const Vuoto: Story = { args: { daily: [] } };
