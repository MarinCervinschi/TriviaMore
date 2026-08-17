import type { Meta, StoryObj } from "@storybook/react-vite";

import type { DailyStudyStat } from "@/lib/user/types";

import { ProgressSummary } from "./progress-summary";

// Fixed "today" so the windows land on the fixtures deterministically.
const TODAY = new Date("2026-08-16T12:00:00Z");

function daysAgo(n: number) {
	return new Date(TODAY.getTime() - n * 86_400_000).toISOString().slice(0, 10);
}

const DAILY: DailyStudyStat[] = [
	0, 1, 3, 5, 6, 10, 14, 21, 40, 70, 120, 200, 300, 360,
].map((n, i) => {
	const quizzes = 1 + ((i * 7) % 4);
	const grade = 20 + ((i * 5) % 12);
	const answersTotal = quizzes * 8;
	const answersCorrect = Math.round(answersTotal * (0.6 + (i % 5) * 0.06));
	return {
		date: daysAgo(n),
		quizMode: "STUDY" as const,
		quizzes,
		gradeSum: quizzes * grade,
		timeSpent: quizzes * 300_000,
		answersTotal,
		answersCorrect,
	};
});

const meta = {
	title: "Progress/ProgressSummary",
	component: ProgressSummary,
	parameters: { layout: "padded" },
} satisfies Meta<typeof ProgressSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Completo: Story = { args: { daily: DAILY, today: TODAY } };

export const Vuoto: Story = { name: "Vuoto", args: { daily: [], today: TODAY } };
