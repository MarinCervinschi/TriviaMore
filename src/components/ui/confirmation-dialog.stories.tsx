import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "./button";
import { ConfirmationDialog } from "./confirmation-dialog";

const meta = {
	title: "UI/ConfirmationDialog",
	component: ConfirmationDialog,
	tags: ["autodocs"],
	args: {
		open: false,
		onOpenChange: () => {},
		onConfirm: () => {},
		title: "Conferma azione",
		description: "Confermi di voler procedere con questa azione?",
	},
} satisfies Meta<typeof ConfirmationDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => {
		const [open, setOpen] = useState(false);
		return (
			<>
				<Button onClick={() => setOpen(true)}>Pubblica sezione</Button>
				<ConfirmationDialog
					open={open}
					onOpenChange={setOpen}
					title="Pubblicare la sezione?"
					description="La sezione 'Alberi binari di ricerca' diventerà visibile a tutti gli studenti del corso."
					confirmText="Pubblica"
					cancelText="Annulla"
					onConfirm={() => setOpen(false)}
				/>
			</>
		);
	},
};

export const Destructive: Story = {
	render: () => {
		const [open, setOpen] = useState(false);
		return (
			<>
				<Button variant="destructive" onClick={() => setOpen(true)}>
					Elimina domanda
				</Button>
				<ConfirmationDialog
					open={open}
					onOpenChange={setOpen}
					variant="destructive"
					title="Eliminare la domanda?"
					description="La domanda verrà rimossa in modo permanente dalla sezione 'Limiti e continuità'."
					confirmText="Elimina"
					cancelText="Annulla"
					onConfirm={() => setOpen(false)}
				/>
			</>
		);
	},
};
