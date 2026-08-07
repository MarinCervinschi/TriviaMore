import type { Meta, StoryObj } from "@storybook/react-vite";

import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectSeparator,
	SelectTrigger,
	SelectValue,
} from "./select";

const meta = {
	title: "UI/Select",
	component: Select,
	tags: ["autodocs"],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<Select>
			<SelectTrigger className="w-72">
				<SelectValue placeholder="Seleziona un corso" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="analisi-1">Analisi Matematica I</SelectItem>
				<SelectItem value="algebra">Algebra Lineare</SelectItem>
				<SelectItem value="fisica-1">Fisica Generale I</SelectItem>
				<SelectItem value="programmazione">
					Fondamenti di Programmazione
				</SelectItem>
			</SelectContent>
		</Select>
	),
};

export const Grouped: Story = {
	render: () => (
		<Select defaultValue="analisi-1">
			<SelectTrigger className="w-72">
				<SelectValue placeholder="Seleziona un corso" />
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					<SelectLabel>Primo anno</SelectLabel>
					<SelectItem value="analisi-1">Analisi Matematica I</SelectItem>
					<SelectItem value="algebra">Algebra Lineare</SelectItem>
				</SelectGroup>
				<SelectSeparator />
				<SelectGroup>
					<SelectLabel>Secondo anno</SelectLabel>
					<SelectItem value="analisi-2">Analisi Matematica II</SelectItem>
					<SelectItem value="basi-dati">Basi di Dati</SelectItem>
				</SelectGroup>
			</SelectContent>
		</Select>
	),
};

export const Disabled: Story = {
	render: () => (
		<Select disabled>
			<SelectTrigger className="w-72">
				<SelectValue placeholder="Seleziona un corso" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="analisi-1">Analisi Matematica I</SelectItem>
			</SelectContent>
		</Select>
	),
};
