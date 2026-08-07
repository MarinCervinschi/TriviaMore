import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "./button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "./dropdown-menu";

const meta = {
	title: "UI/DropdownMenu",
	component: DropdownMenu,
	tags: ["autodocs"],
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline">Azioni sezione</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56">
				<DropdownMenuLabel>Analisi Matematica I</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem>
					Modifica
					<DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
				</DropdownMenuItem>
				<DropdownMenuItem>Duplica</DropdownMenuItem>
				<DropdownMenuItem>Sposta in un'altra classe</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem className="text-destructive">
					Elimina
					<DropdownMenuShortcut>⌫</DropdownMenuShortcut>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	),
};

export const WithSelections: Story = {
	render: () => {
		const [showPrivate, setShowPrivate] = useState(true);
		const [difficulty, setDifficulty] = useState("media");
		return (
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="outline">Filtri domande</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="w-56">
					<DropdownMenuLabel>Visibilità</DropdownMenuLabel>
					<DropdownMenuCheckboxItem
						checked={showPrivate}
						onCheckedChange={(value) => setShowPrivate(!!value)}
					>
						Mostra sezioni private
					</DropdownMenuCheckboxItem>
					<DropdownMenuSeparator />
					<DropdownMenuLabel>Difficoltà</DropdownMenuLabel>
					<DropdownMenuRadioGroup value={difficulty} onValueChange={setDifficulty}>
						<DropdownMenuRadioItem value="facile">Facile</DropdownMenuRadioItem>
						<DropdownMenuRadioItem value="media">Media</DropdownMenuRadioItem>
						<DropdownMenuRadioItem value="difficile">
							Difficile
						</DropdownMenuRadioItem>
					</DropdownMenuRadioGroup>
				</DropdownMenuContent>
			</DropdownMenu>
		);
	},
};
