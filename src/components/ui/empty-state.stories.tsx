import { InboxIcon } from "@solar-icons/react/linear/inbox";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { EmptyState, InlineEmpty } from "./empty-state";

const meta = {
	title: "UI/EmptyState",
	component: EmptyState,
	tags: ["autodocs"],
	args: {
		icon: InboxIcon,
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

/** The counterpart: a line inside a panel that already has its own frame. */
export const Inline: Story = {
	render: () => (
		<div className="space-y-6">
			<p className="text-muted-foreground max-w-prose text-sm">
				<code className="text-xs">EmptyState</code> is the frame;{" "}
				<code className="text-xs">InlineEmpty</code> goes inside someone else&apos;s — a
				table&apos;s card, a chart&apos;s card. It replaced two identical three-line
				components that sat eight pixels of padding apart.
			</p>

			<div className="bg-card overflow-hidden rounded-2xl border">
				<div className="border-b px-4 py-3">
					<p className="text-muted-foreground eyebrow">Sezioni</p>
				</div>
				<InlineEmpty>Nessuna sezione in questo insegnamento.</InlineEmpty>
			</div>

			<div className="bg-card overflow-hidden rounded-2xl border">
				<div className="border-b px-4 py-3">
					<p className="text-muted-foreground eyebrow">Quiz per mese</p>
				</div>
				<InlineEmpty />
			</div>
		</div>
	),
};
