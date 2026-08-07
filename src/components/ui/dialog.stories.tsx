import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "./button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./dialog";

const meta = {
	title: "UI/Dialog",
	component: Dialog,
	tags: ["autodocs"],
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<Dialog>
			<DialogTrigger asChild>
				<Button>Modifica sezione</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Modifica sezione</DialogTitle>
					<DialogDescription>
						Aggiorna il titolo della sezione "Limiti e continuità" del corso di Analisi
						Matematica I.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">Annulla</Button>
					</DialogClose>
					<Button>Salva modifiche</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	),
};

export const Open: Story = {
	render: () => (
		<Dialog defaultOpen>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Elimina domanda</DialogTitle>
					<DialogDescription>
						Questa domanda verrà rimossa dalla sezione. L'operazione non è reversibile.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">Annulla</Button>
					</DialogClose>
					<Button variant="destructive">Elimina</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	),
};
