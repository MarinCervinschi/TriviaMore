import type { Meta, StoryObj } from "@storybook/react-vite";

import { studyActivity } from "@/components/charts/fixtures";
import type { RecentQuizAttempt } from "@/lib/user/types";

import { ActivitySection } from "./activity-section";

const activity = studyActivity();

function attempt(
	id: string,
	sectionName: string,
	score: number,
	date: string
): RecentQuizAttempt {
	return {
		id,
		sectionName,
		score,
		completedAt: date,
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
	attempt("a", "Advanced Clustering", 6, "2026-08-11"),
	attempt("b", "Advanced Clustering", 1, "2026-08-02"),
	attempt("c", "Exam Simulation", 1, "2026-08-02"),
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

/** Heatmap + recent quizzes, side by side. Click a year; click a quiz row. */
export const Default: Story = {
	render: () => (
		<ActivitySection data={activity} endDate="2026-08-08" attempts={ATTEMPTS} />
	),
};

/** No completed quizzes yet: the heatmap shows its empty state, the list too. */
export const Empty: Story = {
	render: () => <ActivitySection data={[]} endDate="2026-08-08" attempts={[]} />,
};
