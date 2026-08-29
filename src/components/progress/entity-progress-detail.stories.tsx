import type { Meta, StoryObj } from "@storybook/react-vite";

import type {
	AttemptHistoryEntry,
	DailyStudyStat,
	UserMastery,
} from "@/lib/user/types";

import { EntityProgressDetail } from "./entity-progress-detail";

const ATTEMPTS: AttemptHistoryEntry[] = [24, 22, 19, 15, 11].map((day, i) => ({
	id: `a${i}`,
	quizId: `q${i}`,
	score: 22 + i,
	timeSpent: 600_000,
	completedAt: new Date(2026, 7, day, 20).toISOString(),
	isFavorite: false,
	quizMode: "STUDY",
	sectionId: "s1",
	sectionName: "Reti e Protocolli",
	classId: "k1",
	className: "Reti di Calcolatori",
	classCode: "20-312",
	courseId: "c1",
	courseName: "Ingegneria Informatica",
	courseCode: "II",
	departmentId: "d1",
	departmentName: "DIEF",
	departmentCode: "DIEF",
}));

const DAILY: DailyStudyStat[] = ATTEMPTS.map(attempt => ({
	date: attempt.completedAt.slice(0, 10),
	quizMode: "STUDY",
	quizzes: 1,
	gradeSum: attempt.score,
	timeSpent: attempt.timeSpent ?? 0,
	answersTotal: 20,
	answersCorrect: 16,
}));

const MASTERY: UserMastery = {
	totalAnswers: 100,
	avgSecondsPerQuestion: 31,
	byDifficulty: [
		{ key: "EASY", total: 40, correct: 36 },
		{ key: "MEDIUM", total: 45, correct: 31 },
		{ key: "HARD", total: 15, correct: 7 },
	],
	sections: [],
	weakSections: [
		{
			sectionId: "s2",
			sectionName: "Livello di trasporto",
			courseCode: "II",
			className: "Reti di Calcolatori",
			path: null,
			total: 18,
			correct: 8,
			avgSeconds: 44,
		},
	],
	strongSections: [
		{
			sectionId: "s1",
			sectionName: "Reti e Protocolli",
			courseCode: "II",
			className: "Reti di Calcolatori",
			path: null,
			total: 30,
			correct: 27,
			avgSeconds: 22,
		},
	],
};

const meta = {
	title: "Progress/EntityProgressDetail",
	component: EntityProgressDetail,
	parameters: { layout: "fullscreen" },
	args: {
		kindLabel: "Insegnamento",
		name: "Reti di Calcolatori",
		context: "Ingegneria Informatica",
		attempts: ATTEMPTS,
		daily: DAILY,
		mastery: MASTERY,
		showSections: true,
		period: "year",
		mode: "both",
		onPeriodChange: () => {},
		onModeChange: () => {},
	},
} satisfies Meta<typeof EntityProgressDetail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Insegnamento: Story = {};

// A leaf section has no sub-sections to rank, so the weak/strong lists are off.
export const Sezione: Story = {
	args: {
		kindLabel: "Sezione",
		name: "Reti e Protocolli",
		context: "Reti di Calcolatori",
		showSections: false,
	},
};

export const SenzaDati: Story = {
	name: "Senza dati",
	args: { attempts: [], daily: [], mastery: { ...MASTERY, totalAnswers: 0 } },
};
