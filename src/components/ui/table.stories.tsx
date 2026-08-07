import type { Meta, StoryObj } from "@storybook/react-vite";

import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from "./table";

const meta = {
	title: "UI/Table",
	component: Table,
	tags: ["autodocs"],
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<Table className="w-[32rem]">
			<TableCaption>Ultimi tentativi di quiz</TableCaption>
			<TableHeader>
				<TableRow>
					<TableHead>Studente</TableHead>
					<TableHead>Sezione</TableHead>
					<TableHead className="text-right">Punteggio</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				<TableRow>
					<TableCell>Mario Rossi</TableCell>
					<TableCell>Limiti e continuità</TableCell>
					<TableCell className="text-right">27/30</TableCell>
				</TableRow>
				<TableRow>
					<TableCell>Giulia Bianchi</TableCell>
					<TableCell>Derivate</TableCell>
					<TableCell className="text-right">30/30</TableCell>
				</TableRow>
				<TableRow>
					<TableCell>Luca Verdi</TableCell>
					<TableCell>Integrali definiti</TableCell>
					<TableCell className="text-right">21/30</TableCell>
				</TableRow>
			</TableBody>
		</Table>
	),
};

export const WithFooter: Story = {
	render: () => (
		<Table className="w-[32rem]">
			<TableHeader>
				<TableRow>
					<TableHead>Sezione</TableHead>
					<TableHead className="text-right">Domande</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				<TableRow>
					<TableCell>Limiti e continuità</TableCell>
					<TableCell className="text-right">24</TableCell>
				</TableRow>
				<TableRow>
					<TableCell>Derivate</TableCell>
					<TableCell className="text-right">31</TableCell>
				</TableRow>
				<TableRow>
					<TableCell>Integrali definiti</TableCell>
					<TableCell className="text-right">18</TableCell>
				</TableRow>
			</TableBody>
			<TableFooter>
				<TableRow>
					<TableCell>Totale</TableCell>
					<TableCell className="text-right">73</TableCell>
				</TableRow>
			</TableFooter>
		</Table>
	),
};
