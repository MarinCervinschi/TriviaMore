import type { Meta, StoryObj } from "@storybook/react-vite";

import type { AttemptHistoryEntry } from "@/lib/user/types";

import { AccuracyTrend } from "./accuracy-trend";

type TrendAttempt = Pick<AttemptHistoryEntry, "completedAt" | "score" | "quizMode">;

// Deterministic fixtures — a story that reshuffles is useless for comparing.
const IMPROVING: TrendAttempt[] = [
	{ completedAt: "2026-06-02T09:00:00Z", score: 17, quizMode: "STUDY" },
	{ completedAt: "2026-06-09T09:00:00Z", score: 21, quizMode: "STUDY" },
	{ completedAt: "2026-06-16T09:00:00Z", score: 19, quizMode: "EXAM_SIMULATION" },
	{ completedAt: "2026-06-23T09:00:00Z", score: 24, quizMode: "STUDY" },
	{ completedAt: "2026-07-01T09:00:00Z", score: 26, quizMode: "STUDY" },
	{ completedAt: "2026-07-10T09:00:00Z", score: 25, quizMode: "EXAM_SIMULATION" },
	{ completedAt: "2026-07-20T09:00:00Z", score: 29, quizMode: "STUDY" },
];

const THIN: TrendAttempt[] = [
	{ completedAt: "2026-07-01T09:00:00Z", score: 22, quizMode: "STUDY" },
	{ completedAt: "2026-07-08T09:00:00Z", score: 27, quizMode: "STUDY" },
];

const meta = {
	title: "Progress/AccuracyTrend",
	component: AccuracyTrend,
	parameters: { layout: "padded" },
} satisfies Meta<typeof AccuracyTrend>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Andamento: Story = { args: { attempts: IMPROVING } };

/** Two attempts is not a trend — the card says so instead of drawing a confident line. */
export const CampioneScarso: Story = {
	name: "Campione scarso",
	args: { attempts: THIN },
};

export const Vuoto: Story = {
	name: "Vuoto",
	args: { attempts: [] },
};
