import type { Meta, StoryObj } from "@storybook/react-vite";

import { QuizCard } from "./quiz-card";

const meta = {
	title: "Launch Cards/QuizCard",
	component: QuizCard,
	args: { questionCount: 142, sectionId: "story-section" },
} satisfies Meta<typeof QuizCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SignedOut: Story = { name: "Non autenticato" };

export const SignedIn: Story = {
	name: "Autenticato",
	parameters: { session: { role: "STUDENT" } },
};
