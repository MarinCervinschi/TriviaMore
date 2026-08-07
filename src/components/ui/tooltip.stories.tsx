import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "./button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "./tooltip";

const meta = {
	title: "UI/Tooltip",
	component: Tooltip,
	tags: ["autodocs"],
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button variant="outline">Anteprima</Button>
				</TooltipTrigger>
				<TooltipContent>Visualizza la sezione come uno studente</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	),
};

export const Open: Story = {
	render: () => (
		<TooltipProvider>
			<Tooltip defaultOpen>
				<TooltipTrigger asChild>
					<Button variant="outline" size="icon">
						?
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					Solo i maintainer del corso possono modificarla
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	),
};
