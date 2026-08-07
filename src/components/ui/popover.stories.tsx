import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

const meta = {
	title: "UI/Popover",
	component: Popover,
	tags: ["autodocs"],
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="outline">Dettagli quiz</Button>
			</PopoverTrigger>
			<PopoverContent>
				<div className="space-y-2">
					<h4 className="leading-none font-medium">Impostazioni quiz</h4>
					<p className="text-muted-foreground text-sm">
						20 domande estratte casualmente dalla sezione, 30 minuti di tempo.
					</p>
				</div>
			</PopoverContent>
		</Popover>
	),
};

export const Open: Story = {
	render: () => (
		<Popover defaultOpen>
			<PopoverTrigger asChild>
				<Button variant="outline">Informazioni sezione</Button>
			</PopoverTrigger>
			<PopoverContent>
				<div className="space-y-1 text-sm">
					<p className="font-medium">Limiti e continuità</p>
					<p className="text-muted-foreground">142 domande · aggiornata 3 giorni fa</p>
				</div>
			</PopoverContent>
		</Popover>
	),
};
