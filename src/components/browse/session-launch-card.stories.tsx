import type { Meta, StoryObj } from "@storybook/react-vite";
import { BookOpen, Sparkles } from "lucide-react";

import { SessionLaunchCard } from "./session-launch-card";

const meta = {
	title: "Launch Cards/Shell",
	component: SessionLaunchCard,
	tags: ["autodocs"],
	args: {
		accent: "blue",
		icon: BookOpen,
		title: "Quiz",
		unitLabel: "domande disponibili",
		count: 142,
		isAuthenticated: true,
		onStart: () => {},
	},
	decorators: [
		Story => (
			<div className="w-full max-w-lg">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof SessionLaunchCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// Logged-in variants (the CTA is a plain button). The logged-out CTA renders a
// TanStack Router <Link>, which needs a router provider Storybook doesn't have.
export const Quiz: Story = {};

export const Flashcard: Story = {
	args: {
		accent: "purple",
		icon: Sparkles,
		title: "Flashcard",
		unitLabel: "carte disponibili",
		count: 80,
	},
};
