import type { Meta, StoryObj } from "@storybook/react-vite";

import type { DailyStudyStat } from "@/lib/user/types";

import { MetricExplorer } from "./metric-explorer";

// Deterministic sample study history: no Math.random / argless Date, so the
// stories never reshuffle. `today` is fixed and passed to the component.
const TODAY = new Date("2026-04-18T12:00:00Z");

function mulberry32(seed: number) {
	return function () {
		seed |= 0;
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
	};
}

function makeDaily(seed: number, density: number): DailyStudyStat[] {
	const rnd = mulberry32(seed);
	const todayDay = Math.floor(Date.parse("2026-04-18T00:00:00Z") / 86_400_000);
	const rows: DailyStudyStat[] = [];
	for (let i = 0; i < 400; i++) {
		const date = new Date((todayDay - i) * 86_400_000).toISOString().slice(0, 10);
		for (const quizMode of ["STUDY", "EXAM_SIMULATION"] as const) {
			if (rnd() > (quizMode === "STUDY" ? density : density * 0.6)) continue;
			const quizzes = 1 + Math.floor(rnd() * 2);
			const answersTotal = quizzes * (8 + Math.floor(rnd() * 8));
			rows.push({
				date,
				quizMode,
				quizzes,
				gradeSum: (18 + rnd() * 14) * quizzes,
				timeSpent: quizzes * (3 + Math.floor(rnd() * 6)) * 60_000,
				answersTotal,
				answersCorrect: Math.round(answersTotal * (0.55 + rnd() * 0.4)),
			});
		}
	}
	return rows;
}

const RICH = makeDaily(42, 0.55);
const SPARSE = makeDaily(7, 0.12);

const meta = {
	title: "Progress/Metric Explorer",
	parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Completo: Story = {
	render: () => <MetricExplorer daily={RICH} today={TODAY} />,
};

export const PochiDati: Story = {
	name: "Pochi dati",
	render: () => <MetricExplorer daily={SPARSE} today={TODAY} />,
};

export const Vuoto: Story = {
	render: () => <MetricExplorer daily={[]} today={TODAY} />,
};
