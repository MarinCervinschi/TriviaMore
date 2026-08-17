import type { Meta, StoryObj } from "@storybook/react-vite";

import type { RollupCourse } from "@/lib/user/rollup";

import { ProgressRollup } from "./progress-rollup";

const COURSES: RollupCourse[] = [
	{
		id: "c1",
		name: "Ingegneria Informatica",
		quizzes: 12,
		avgGrade: 26.5,
		timeSpent: 3_600_000,
		classes: [
			{
				id: "k1",
				name: "Analisi Matematica I",
				quizzes: 8,
				avgGrade: 27,
				timeSpent: 2_400_000,
				sections: [
					{ id: "s1", name: "Limiti", quizzes: 5, avgGrade: 28, timeSpent: 1_500_000 },
					{ id: "s2", name: "Integrali", quizzes: 3, avgGrade: 25, timeSpent: 900_000 },
				],
			},
			{
				id: "k2",
				name: "Fisica I",
				quizzes: 4,
				avgGrade: 22,
				timeSpent: 1_200_000,
				sections: [
					{
						id: "s3",
						name: "Cinematica",
						quizzes: 4,
						avgGrade: 22,
						timeSpent: 1_200_000,
					},
				],
			},
		],
	},
	{
		id: "c2",
		name: "Matematica",
		quizzes: 3,
		avgGrade: 19,
		timeSpent: 720_000,
		classes: [
			{
				id: "k3",
				name: "Geometria",
				quizzes: 3,
				avgGrade: 19,
				timeSpent: 720_000,
				sections: [
					{ id: "s4", name: "Matrici", quizzes: 3, avgGrade: 19, timeSpent: 720_000 },
				],
			},
		],
	},
];

const meta = {
	title: "Progress/ProgressRollup",
	component: ProgressRollup,
	parameters: { layout: "padded" },
} satisfies Meta<typeof ProgressRollup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Albero: Story = { args: { courses: COURSES } };

export const Vuoto: Story = { name: "Vuoto", args: { courses: [] } };
