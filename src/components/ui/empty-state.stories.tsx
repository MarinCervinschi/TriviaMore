import type { Meta, StoryObj } from "@storybook/react-vite";
import { Inbox } from "lucide-react";

import { EmptyState } from "./empty-state";

const meta = {
	title: "UI/EmptyState",
	component: EmptyState,
	tags: ["autodocs"],
	args: {
		icon: Inbox,
		title: "Nessun risultato",
		description: "Non ci sono ancora elementi da mostrare qui.",
	},
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithButtonAction: Story = {
	args: { actionLabel: "Riprova", onAction: () => {} },
};
