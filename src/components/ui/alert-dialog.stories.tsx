import type { Meta, StoryObj } from "@storybook/react-vite";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "./alert-dialog";
import { Button } from "./button";

const meta = {
	title: "UI/AlertDialog",
	component: AlertDialog,
	tags: ["autodocs"],
} satisfies Meta<typeof AlertDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button variant="destructive">Elimina corso</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Eliminare il corso?</AlertDialogTitle>
					<AlertDialogDescription>
						Verranno rimosse tutte le classi, sezioni e domande di Fondamenti di
						Informatica. L'operazione è irreversibile.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Annulla</AlertDialogCancel>
					<AlertDialogAction>Elimina definitivamente</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	),
};

export const Open: Story = {
	render: () => (
		<AlertDialog defaultOpen>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Terminare il quiz?</AlertDialogTitle>
					<AlertDialogDescription>
						Le risposte già date verranno salvate, ma il quiz risulterà incompleto e non
						potrà essere ripreso.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Continua il quiz</AlertDialogCancel>
					<AlertDialogAction>Termina</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	),
};
