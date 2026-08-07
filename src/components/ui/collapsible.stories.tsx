import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "./button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./collapsible";

const meta = {
	title: "UI/Collapsible",
	component: Collapsible,
	tags: ["autodocs"],
} satisfies Meta<typeof Collapsible>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<Collapsible className="w-80 space-y-2">
			<div className="flex items-center justify-between">
				<h4 className="text-sm font-semibold">Fondamenti di Informatica</h4>
				<CollapsibleTrigger asChild>
					<Button variant="ghost" size="sm">
						Mostra classi
					</Button>
				</CollapsibleTrigger>
			</div>
			<CollapsibleContent className="space-y-2">
				<div className="rounded-lg border px-3 py-2 text-sm">Classe A · 2024/25</div>
				<div className="rounded-lg border px-3 py-2 text-sm">Classe B · 2024/25</div>
			</CollapsibleContent>
		</Collapsible>
	),
};

export const Open: Story = {
	render: () => (
		<Collapsible defaultOpen className="w-80 space-y-2">
			<div className="flex items-center justify-between">
				<h4 className="text-sm font-semibold">Reti di Calcolatori</h4>
				<CollapsibleTrigger asChild>
					<Button variant="ghost" size="sm">
						Nascondi sezioni
					</Button>
				</CollapsibleTrigger>
			</div>
			<CollapsibleContent className="space-y-2">
				<div className="rounded-lg border px-3 py-2 text-sm">
					Livello di trasporto
				</div>
				<div className="rounded-lg border px-3 py-2 text-sm">Instradamento IP</div>
			</CollapsibleContent>
		</Collapsible>
	),
};
