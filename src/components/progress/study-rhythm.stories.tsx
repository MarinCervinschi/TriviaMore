import type { Meta, StoryObj } from "@storybook/react-vite";

import type { AttemptHistoryEntry } from "@/lib/user/types";

import { StudyRhythm } from "./study-rhythm";

const TODAY = new Date(2026, 7, 24, 12, 0, 0);

const SECTION_NAMES: Record<string, string> = {
	algo: "Algoritmi e strutture dati",
	reti: "Reti di calcolatori",
	basi: "Basi di dati",
};

function mk(
	day: number,
	hour: number,
	score: number,
	section: keyof typeof SECTION_NAMES
): AttemptHistoryEntry {
	return {
		id: `${section}-${day}-${hour}`,
		score,
		timeSpent: 600_000,
		completedAt: new Date(2026, 7, day, hour).toISOString(),
		quizMode: "STUDY",
		sectionId: section,
		sectionName: SECTION_NAMES[section] ?? section,
		classId: null,
		className: null,
		classCode: null,
		courseId: "c1",
		courseName: "Informatica",
		courseCode: null,
		departmentId: null,
		departmentName: null,
		departmentCode: null,
	};
}

// A four-day streak, evenings-heavy.
const ATTEMPTS: AttemptHistoryEntry[] = [
	mk(24, 21, 28, "algo"),
	mk(24, 14, 24, "algo"),
	mk(23, 21, 26, "reti"),
	mk(22, 9, 30, "algo"),
	mk(21, 21, 22, "reti"),
	mk(19, 14, 25, "algo"),
	mk(17, 21, 18, "reti"),
	mk(15, 9, 27, "algo"),
	mk(12, 21, 20, "reti"),
	mk(10, 14, 29, "algo"),
	mk(7, 21, 16, "reti"),
	mk(4, 15, 14, "basi"),
	mk(2, 15, 16, "basi"),
];

const meta = {
	title: "Progress/StudyRhythm",
	component: StudyRhythm,
	parameters: { layout: "fullscreen" },
	decorators: [
		Story => (
			<div className="container py-8">
				<Story />
			</div>
		),
	],
	args: { today: TODAY },
} satisfies Meta<typeof StudyRhythm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Completo: Story = {
	args: { attempts: ATTEMPTS },
};

export const PochiDati: Story = {
	name: "Pochi dati",
	args: { attempts: [mk(24, 21, 24, "algo"), mk(23, 14, 18, "reti")] },
};
