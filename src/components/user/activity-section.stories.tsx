import type { Meta, StoryObj } from "@storybook/react-vite";

import type { AttemptHistoryEntry } from "@/lib/user/types";

import { ActivitySection } from "./activity-section";

function attempt(
	id: string,
	sectionName: string,
	score: number,
	date: string,
	quizMode: "STUDY" | "EXAM_SIMULATION" = "STUDY",
	timeSpent: number | null = 14 * 60_000
): AttemptHistoryEntry {
	return {
		id,
		quizId: `quiz-${id}`,
		sectionName,
		score,
		completedAt: date,
		quizMode,
		isFavorite: false,
		timeSpent,
		sectionId: `sec-${id}`,
		classId: `cls-${id}`,
		className: "Intelligenza Artificiale",
		classCode: "IN0521",
		courseId: null,
		courseName: null,
		courseCode: "IINF",
		departmentId: null,
		departmentName: null,
		departmentCode: "DIEF",
	};
}

const ATTEMPTS = [
	attempt("a", "Advanced Clustering", 28, "2026-08-11"),
	attempt(
		"b",
		"Reti neurali profonde",
		31,
		"2026-08-09",
		"EXAM_SIMULATION",
		42 * 60_000
	),
	attempt("c", "Exam Simulation", 24, "2026-08-02", "EXAM_SIMULATION"),
	attempt("d", "Advanced Clustering", 19, "2026-07-30"),
	attempt("e", "Ottimizzazione convessa", 30, "2026-07-28", "STUDY", null),
];

const meta = {
	title: "User/Activity",
	// Render inside the dashboard's own `.container`, so the width matches the page.
	parameters: { layout: "fullscreen" },
	decorators: [
		Story => (
			<div className="container py-6">
				<Story />
			</div>
		),
	],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** The last sittings, with the way through to the full history. */
export const Default: Story = {
	render: () => <ActivitySection attempts={ATTEMPTS} total={42} />,
};

/** No completed quizzes yet. */
export const Empty: Story = {
	render: () => <ActivitySection attempts={[]} />,
};
