import type { Meta, StoryObj } from "@storybook/react-vite";

import { EXAM_RESULT, STUDY_RESULT } from "./fixtures";
import { QuizResultsView } from "./quiz-results-view";

const meta = {
	title: "Risultati/Pagina",
	parameters: { layout: "fullscreen", session: { role: "STUDENT" } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Standard evaluation and no limit, so the pace is read against the student's average. */
export const Study: Story = {
	name: "Studio",
	render: () => <QuizResultsView result={STUDY_RESULT} />,
};

/** A penalty and a limit, so the ledger appears. */
export const Exam: Story = {
	name: "Simulazione d'esame",
	render: () => <QuizResultsView result={EXAM_RESULT} />,
};

export const Mobile: Story = {
	name: "Mobile",
	globals: { viewport: { value: "iphone6" } },
	render: () => <QuizResultsView result={STUDY_RESULT} />,
};
