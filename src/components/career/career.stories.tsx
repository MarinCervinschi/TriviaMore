import type { Meta, StoryObj } from "@storybook/react-vite";

import { CareerCard } from "./career-card";
import { CareerView } from "./career-view";
import {
	CAREER,
	CAREER_EMPTY,
	CAREER_NO_CURRICULUM,
	CAREER_NO_RULES,
	CLASS_SEARCH,
	CURRICULUM_OPTIONS,
} from "./fixtures";

/** A proposal for the Carriera page: the course, three tabs, and the states before the record exists. */
const meta = {
	title: "Carriera/Pagina",
	parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Panoramica: Story = {
	name: "Panoramica",
	render: () => <CareerView career={CAREER} />,
};

export const Libretto: Story = {
	name: "Libretto",
	render: () => <CareerView career={CAREER} initialTab="record" />,
};

export const ModificaEsame: Story = {
	name: "Libretto, modifica di un esame",
	render: () => <CareerView career={CAREER} initialTab="record" initialExam="exam-1" />,
};

export const EsamiAScelta: Story = {
	name: "Libretto, esami a scelta",
	render: () => (
		<CareerView career={CAREER} initialTab="record" initialChoicesYear={2} />
	),
};

export const TuttiGliEsamiAScelta: Story = {
	name: "Libretto, esami a scelta di tutto il corso",
	render: () => (
		<CareerView career={CAREER} initialTab="record" initialChoicesYear="all" />
	),
};

export const AggiungiEsame: Story = {
	name: "Libretto, aggiungi un esame",
	parameters: {
		queryData: [
			[["search", "classes", { courseId: "course-aie", pageSize: 20 }], CLASS_SEARCH],
		],
	},
	render: () => <CareerView career={CAREER} initialTab="record" initialAdding />,
};

export const RegoleNonImpostate: Story = {
	name: "Regole non impostate",
	render: () => <CareerView career={CAREER_NO_RULES} />,
};

export const Previsione: Story = {
	name: "Previsione",
	render: () => <CareerView career={CAREER} initialTab="forecast" />,
};

export const Regole: Story = {
	name: "Regole di calcolo",
	render: () => <CareerView career={CAREER} initialRules />,
};

export const PrimoAccesso: Story = {
	name: "Primo accesso",
	render: () => <CareerView career={CAREER_EMPTY} />,
};

export const MancaIlCurriculum: Story = {
	name: "Manca il curriculum",
	render: () => (
		<CareerView career={CAREER_NO_CURRICULUM} curriculumOptions={CURRICULUM_OPTIONS} />
	),
};

export const EsamiMancanti: Story = {
	name: "Obbligatori da aggiungere",
	render: () => <CareerView career={{ ...CAREER, missingMandatory: 2 }} />,
};

export const MobilePanoramica: Story = {
	name: "Mobile, panoramica",
	globals: { viewport: { value: "iphone6" } },
	render: () => <CareerView career={CAREER} />,
};

export const MobilePrevisione: Story = {
	name: "Mobile, previsione",
	globals: { viewport: { value: "iphone6" } },
	render: () => <CareerView career={CAREER} initialTab="forecast" />,
};

export const CardDashboard: Story = {
	name: "Card della dashboard",
	render: () => (
		<div className="flex max-w-md flex-col gap-6">
			<CareerCard
				career={CAREER}
				next={{
					examName: "Ai for Bioinformatics",
					date: "2027-01-14",
					label: "Scritto",
				}}
			/>
			<CareerCard career={CAREER} next={null} />
			<CareerCard career={CAREER_EMPTY} next={null} />
		</div>
	),
};
