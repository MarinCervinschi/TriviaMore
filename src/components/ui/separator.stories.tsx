import type { Meta, StoryObj } from "@storybook/react-vite";

import { Separator } from "./separator";

const meta = {
	title: "UI/Separator",
	component: Separator,
	tags: ["autodocs"],
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<div className="w-72">
			<div className="space-y-1">
				<h4 className="text-sm font-medium">Analisi Matematica I</h4>
				<p className="text-muted-foreground text-sm">142 domande in 6 sezioni.</p>
			</div>
			<Separator className="my-4" />
			<p className="text-muted-foreground text-sm">Ultimo tentativo: 2 giorni fa</p>
		</div>
	),
};

export const Vertical: Story = {
	render: () => (
		<div className="flex h-5 items-center gap-4 text-sm">
			<span>Domande</span>
			<Separator orientation="vertical" />
			<span>Sezioni</span>
			<Separator orientation="vertical" />
			<span>Classifica</span>
		</div>
	),
};
