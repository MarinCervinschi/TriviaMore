import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";

import { BookmarkButton } from "./bookmark-button";
import { QUIZ_QUESTIONS } from "./fixtures";
import { QuestionCard } from "./question-card";

// The card a quiz is answered in. It reaches the report and bookmark server functions, which is why it
// had no story until the stub landed — signed in and out are both worth seeing.
const meta = {
	title: "Question Cards/QuestionCard",
	parameters: { layout: "padded", session: { role: "STUDENT" } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Card({ index }: { index: number }) {
	const question = QUIZ_QUESTIONS[index];
	const [answers, setAnswers] = useState<string[]>([]);
	return (
		<QuestionCard
			question={question}
			questionNumber={index + 1}
			selectedAnswers={answers}
			onAnswerChange={setAnswers}
		/>
	);
}

/** One per question type: the answer control changes shape with it. */
export const EveryType: Story = {
	name: "Ogni tipo di domanda",
	render: () => (
		<div className="max-w-3xl space-y-8">
			<Card index={0} />
			<Card index={1} />
			<Card index={2} />
		</div>
	),
};

/** More than one correct answer, and a long stem — where wrapping and the hint both get tested. */
export const MultipleCorrect: Story = {
	name: "Più risposte corrette",
	render: () => (
		<div className="max-w-3xl">
			<Card index={3} />
		</div>
	),
};

export const SignedOut: Story = {
	name: "Non autenticato",
	parameters: { session: null },
	render: () => (
		<div className="max-w-3xl">
			<Card index={0} />
		</div>
	),
};

/** The bookmark toggle on its own, in both states: the filled icon is the whole feedback. */
export const Bookmark: Story = {
	name: "Il segnalibro",
	parameters: {
		layout: "padded",
		session: { role: "STUDENT" },
		queryData: [[["user", "bookmarked-ids"], ["q-1"]]],
	},
	render: () => (
		<div className="flex items-center gap-6">
			<BookmarkButton questionId="q-1" />
			<BookmarkButton questionId="q-2" />
		</div>
	),
};
