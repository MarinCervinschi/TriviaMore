import type { Meta, StoryObj } from "@storybook/react-vite";

import { EXAM_RESULT, STUDY_RESULT } from "./fixtures";
import { QuizResultsView } from "./quiz-results-view";

/**
 * The whole results page, on the same two attempts the single cards use.
 *
 * The bookmark, the report and the star all mutate: here they render and do
 * nothing, because the server functions are stubbed out of the Storybook bundle.
 */
const meta = {
	title: "Risultati/Pagina",
	parameters: { layout: "fullscreen", session: { role: "STUDENT" } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Standard evaluation, no limit: the pace is read against the student's own average. */
export const Study: Story = {
	name: "Studio",
	render: () => <QuizResultsView result={STUDY_RESULT} />,
};

/**
 * With a penalty and a limit: the ledger appears, the pace is read against the
 * twenty minutes, and the blank answers are worth saying out loud.
 */
export const Exam: Story = {
	name: "Simulazione d'esame",
	render: () => <QuizResultsView result={EXAM_RESULT} />,
};

/** On a phone, where the two-column panels stack and the figures fall to two per row. */
export const Mobile: Story = {
	name: "Mobile",
	globals: { viewport: { value: "iphone6" } },
	render: () => <QuizResultsView result={STUDY_RESULT} />,
};
