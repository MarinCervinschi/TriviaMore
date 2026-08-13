import type { Meta, StoryObj } from "@storybook/react-vite";

import { CampusBarChart } from "./campus-bar-chart";
import { CourseTypeDonutChart } from "./course-type-donut-chart";
import { DepartmentBarChart } from "./department-bar-chart";
import { QuestionTypeDonutChart } from "./question-type-donut-chart";

// The four charts on the browse overview. Recharts measures its container, so these need real width —
// and note that a green build proves nothing here: ResponsiveContainer draws no SVG at all in jsdom.
const meta = {
	title: "Browse/Charts",
	parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const DEPARTMENTS = [
	{ name: "Ingegneria Enzo Ferrari", code: "DIEF", count: 12 },
	{ name: "Scienze Fisiche, Informatiche e Matematiche", code: "FIM", count: 8 },
	{ name: "Scienze della Vita", code: "DSV", count: 6 },
	{ name: "Scienze Biomediche", code: "CHIMOMO", count: 5 },
	{ name: "Studi Linguistici e Culturali", code: "DESU", count: 4 },
];

const CAMPUSES = [
	{ campus: "MODENA", label: "Modena", count: 24 },
	{ campus: "REGGIO_EMILIA", label: "Reggio Emilia", count: 9 },
	{ campus: "CARPI", label: "Carpi", count: 2 },
	{ campus: "MANTOVA", label: "Mantova", count: 1 },
];

const COURSE_TYPES = [
	{ type: "BACHELOR", label: "Triennale", count: 21 },
	{ type: "MASTER", label: "Magistrale", count: 12 },
	{ type: "SINGLE_CYCLE", label: "Ciclo unico", count: 3 },
];

const QUESTION_TYPES = [
	{ type: "MULTIPLE_CHOICE", label: "Scelta multipla", count: 940 },
	{ type: "TRUE_FALSE", label: "Vero/Falso", count: 210 },
	{ type: "SHORT_ANSWER", label: "Risposta breve", count: 90 },
];

export const All: Story = {
	name: "Tutti e quattro",
	render: () => (
		<div className="grid gap-6 xl:grid-cols-2">
			<DepartmentBarChart data={DEPARTMENTS} />
			<CampusBarChart data={CAMPUSES} />
			<CourseTypeDonutChart data={COURSE_TYPES} />
			<QuestionTypeDonutChart data={QUESTION_TYPES} />
		</div>
	),
};

/** One bar and one slice: the axis labels and the legend still have to make sense. */
export const Sparse: Story = {
	name: "Con un dato solo",
	render: () => (
		<div className="grid gap-6 xl:grid-cols-2">
			<DepartmentBarChart data={[DEPARTMENTS[0]]} />
			<CourseTypeDonutChart data={[COURSE_TYPES[0]]} />
		</div>
	),
};

export const Empty: Story = {
	name: "Senza dati",
	render: () => (
		<div className="grid gap-6 xl:grid-cols-2">
			<DepartmentBarChart data={[]} />
			<CampusBarChart data={[]} />
			<CourseTypeDonutChart data={[]} />
			<QuestionTypeDonutChart data={[]} />
		</div>
	),
};
