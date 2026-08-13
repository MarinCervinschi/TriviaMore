import { BookmarkIcon } from "@solar-icons/react/linear/bookmark";
import { FlagIcon } from "@solar-icons/react/linear/flag";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "@/components/ui/button";

import { QuestionHeader } from "./question-header";

// Stand-in for the real report and bookmark actions, which live in the card bodies — see
// Question Cards/QuestionCard for those. The header itself is presentational.
const actions = (
	<>
		<Button variant="ghost" size="icon" aria-label="Segnala">
			<FlagIcon />
		</Button>
		<Button variant="ghost" size="icon" aria-label="Salva">
			<BookmarkIcon />
		</Button>
	</>
);

const meta = {
	title: "Question Cards/Header",
	component: QuestionHeader,
	tags: ["autodocs"],
	args: { number: 1, difficulty: "MEDIUM", actions },
	decorators: [
		Story => (
			<div className="w-full max-w-2xl">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof QuestionHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Easy: Story = { args: { difficulty: "EASY" } };
export const Medium: Story = { args: { difficulty: "MEDIUM" } };
export const Hard: Story = { args: { difficulty: "HARD" } };
export const WithoutActions: Story = { args: { actions: undefined } };
