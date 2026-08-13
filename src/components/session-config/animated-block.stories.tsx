import type { Meta, StoryObj } from "@storybook/react-vite";

import { AnimatedBlock, AnimatedStack } from "./animated-block";

// The entrance the session dialogs stagger their fields with. It honours prefers-reduced-motion
// through `motion.ts`, so with the OS setting on the blocks appear without moving.
const meta = {
	title: "Session Dialogs/AnimatedBlock",
	parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Stack: Story = {
	render: () => (
		<AnimatedStack className="max-w-md space-y-3">
			{["Numero di domande", "Tempo", "Valutazione"].map(label => (
				<AnimatedBlock key={label}>
					<div className="bg-card rounded-2xl border p-4 shadow-sm">
						<p className="font-medium">{label}</p>
						<p className="text-muted-foreground text-sm">
							Ogni blocco entra dopo il precedente.
						</p>
					</div>
				</AnimatedBlock>
			))}
		</AnimatedStack>
	),
};
