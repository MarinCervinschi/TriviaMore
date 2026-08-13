import type { Meta, StoryObj } from "@storybook/react-vite";

import { FlashcardCard } from "./flashcard-card";
import { QuizCard } from "./quiz-card";

// The two cards that open a session, in both auth states — signed out they invite you to log in, and
// that is the branch most easily forgotten.
const meta = {
	title: "Launch Cards/Cards",
	parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Pair({ count }: { count: number }) {
	return (
		<div className="grid gap-4 sm:grid-cols-2">
			<QuizCard questionCount={count} sectionId="story-section" />
			<FlashcardCard questionCount={count} sectionId="story-section" />
		</div>
	);
}

export const SignedIn: Story = {
	name: "Autenticato",
	parameters: { session: { role: "STUDENT" } },
	render: () => <Pair count={142} />,
};

export const SignedOut: Story = {
	name: "Non autenticato",
	render: () => <Pair count={142} />,
};

/** Zero questions and the card removes itself — an empty section should not offer a session. */
export const Empty: Story = {
	name: "Sezione vuota",
	parameters: { session: { role: "STUDENT" } },
	render: () => (
		<div className="space-y-4">
			<Pair count={0} />
			<p className="text-muted-foreground text-sm">
				Con zero domande le due card non si rendono affatto: sopra non c&apos;è nulla,
				ed è voluto.
			</p>
		</div>
	),
};
