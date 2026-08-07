import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "./button";
import {
	Command,
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
	CommandShortcut,
} from "./command";

const meta = {
	title: "UI/Command",
	component: Command,
	tags: ["autodocs"],
} satisfies Meta<typeof Command>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<Command className="w-96 rounded-xl border shadow-md">
			<CommandInput placeholder="Cerca un corso o una sezione..." />
			<CommandList>
				<CommandEmpty>Nessun risultato.</CommandEmpty>
				<CommandGroup heading="Corsi">
					<CommandItem>Analisi Matematica I</CommandItem>
					<CommandItem>Fondamenti di Informatica</CommandItem>
					<CommandItem>Reti di Calcolatori</CommandItem>
				</CommandGroup>
				<CommandSeparator />
				<CommandGroup heading="Azioni">
					<CommandItem>
						Nuovo quiz
						<CommandShortcut>⌘N</CommandShortcut>
					</CommandItem>
					<CommandItem>Vai al profilo</CommandItem>
				</CommandGroup>
			</CommandList>
		</Command>
	),
};

export const AsDialog: Story = {
	render: () => {
		const [open, setOpen] = useState(false);
		return (
			<>
				<Button variant="outline" onClick={() => setOpen(true)}>
					Apri ricerca rapida
				</Button>
				<CommandDialog open={open} onOpenChange={setOpen}>
					<CommandInput placeholder="Cerca un corso o una sezione..." />
					<CommandList>
						<CommandEmpty>Nessun risultato.</CommandEmpty>
						<CommandGroup heading="Corsi">
							<CommandItem onSelect={() => setOpen(false)}>
								Analisi Matematica I
							</CommandItem>
							<CommandItem onSelect={() => setOpen(false)}>
								Basi di Dati
							</CommandItem>
						</CommandGroup>
					</CommandList>
				</CommandDialog>
			</>
		);
	},
};
