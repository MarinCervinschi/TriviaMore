import type { Meta, StoryObj } from "@storybook/react-vite";

import type { OverallStats, RadialDataItem } from "@/hooks/useProgressData";
import type { UserProgress } from "@/lib/user/types";

import { ExamChart } from "./exam-chart";
import { ProgressDetails } from "./progress-details";
import { ProgressStats } from "./progress-stats";
import { SectionsComparison } from "./sections-comparison";
import { StudyChart } from "./study-chart";

// The progress page. Grades run on the /30 scale and their colour comes from getGradeColor, so a story
// has to span the bands — an insufficiente, a 30 and a 30L — or the mapping goes unchecked.
const meta = {
	title: "Progress/Pagina",
	parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const STATS: OverallStats = {
	totalStudyQuizzes: 71,
	totalExamQuizzes: 12,
	avgStudy: 26.4,
	avgExam: 24.1,
	bestStudy: 30,
	bestExam: 28,
};

const RADIAL: RadialDataItem[] = [
	{ name: "Studio", value: 88, score: 26.4, fill: "hsl(var(--chart-2))" },
	{ name: "Esame", value: 80, score: 24.1, fill: "hsl(var(--chart-4))" },
];

const section = (
	i: number,
	sectionName: string,
	className: string,
	averageScore: number,
	bestScore: number,
	quizzesTaken: number
): UserProgress => ({
	id: `p${i}`,
	sectionId: `s${i}`,
	sectionName,
	classId: `c${i}`,
	className,
	courseId: "co1",
	courseName: "Ingegneria Informatica",
	departmentId: "d1",
	departmentName: "DIEF",
	quizMode: "STUDY",
	quizzesTaken,
	averageScore,
	bestScore,
	totalTimeSpent: quizzesTaken * 420_000,
	lastAccessedAt: "2026-08-10T10:00:00.000Z",
});

// One per grade band, so the colour mapping is visible rather than assumed.
const PROGRESS: UserProgress[] = [
	section(1, "Alberi binari", "Algoritmi", 30.5, 31, 9),
	section(2, "Grafi e visite", "Algoritmi", 28.2, 30, 14),
	section(3, "Limiti e continuità", "Analisi matematica I", 25.1, 27, 7),
	section(4, "Integrali", "Analisi matematica I", 22.4, 25, 5),
	section(5, "Normalizzazione", "Basi di dati", 16.8, 19, 3),
];

export const Stats: Story = {
	name: "Le statistiche",
	render: () => (
		<ProgressStats overallStats={STATS} totalTime={71 * 420_000} radialData={RADIAL} />
	),
};

export const Details: Story = {
	name: "Il dettaglio",
	render: () => <ProgressDetails overallStats={STATS} progressData={PROGRESS} />,
};

export const Charts: Story = {
	name: "I grafici",
	render: () => (
		<div className="grid gap-6 xl:grid-cols-2">
			<StudyChart
				data={PROGRESS.map(p => ({
					name: p.sectionName.slice(0, 12),
					fullName: p.sectionName,
					averageScore: p.averageScore ?? 0,
					bestScore: p.bestScore ?? 0,
					className: p.className,
				}))}
			/>
			<ExamChart
				data={[
					{
						courseName: "Ingegneria Informatica",
						averageScore: 24.1,
						quizzesTaken: 12,
					},
					{ courseName: "Matematica", averageScore: 27.6, quizzesTaken: 4 },
				]}
			/>
		</div>
	),
};

export const Comparison: Story = {
	name: "Il confronto fra sezioni",
	render: () => <SectionsComparison studyProgress={PROGRESS} />,
};

/** No attempts anywhere: every one of these has to say so rather than draw an empty frame. */
export const Empty: Story = {
	name: "Senza dati",
	render: () => (
		<div className="space-y-10">
			<ProgressDetails
				overallStats={{
					totalStudyQuizzes: 0,
					totalExamQuizzes: 0,
					avgStudy: 0,
					avgExam: 0,
					bestStudy: 0,
					bestExam: 0,
				}}
				progressData={[]}
			/>
			<SectionsComparison studyProgress={[]} />
			<StudyChart data={[]} />
			<ExamChart data={[]} />
		</div>
	),
};
