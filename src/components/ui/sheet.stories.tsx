import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "./button";
import {
	Sheet,
	SheetBody,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "./sheet";

const meta = {
	title: "UI/Sheet",
	component: Sheet,
	tags: ["autodocs"],
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<Sheet>
			<SheetTrigger asChild>
				<Button variant="outline">Apri filtri</Button>
			</SheetTrigger>
			<SheetContent>
				<SheetHeader>
					<SheetTitle>Filtra le domande</SheetTitle>
					<SheetDescription>
						Restringi il ripasso per difficoltà e argomento della sezione.
					</SheetDescription>
				</SheetHeader>
				<SheetFooter>
					<SheetClose asChild>
						<Button variant="outline">Chiudi</Button>
					</SheetClose>
					<Button>Applica filtri</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	),
};

export const Pannello: Story = {
	name: "Pannello",
	render: () => (
		<Sheet>
			<SheetTrigger asChild>
				<Button variant="outline">Modifica l'evento</Button>
			</SheetTrigger>
			<SheetContent layout="panel" className="sm:max-w-md">
				<SheetHeader>
					<SheetTitle>Modifica l'evento</SheetTitle>
					<SheetDescription>
						Il corpo scorre, intestazione e piede restano fermi.
					</SheetDescription>
				</SheetHeader>
				<SheetBody className="flex flex-col gap-4 text-sm">
					{Array.from({ length: 24 }, (_, i) => (
						<p key={i}>Riga {i + 1} del modulo.</p>
					))}
				</SheetBody>
				<SheetFooter className="flex-row">
					<SheetClose asChild>
						<Button variant="outline" className="ml-auto">
							Annulla
						</Button>
					</SheetClose>
					<Button>Salva</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	),
};

export const LeftSide: Story = {
	render: () => (
		<Sheet>
			<SheetTrigger asChild>
				<Button variant="outline">Apri menu corsi</Button>
			</SheetTrigger>
			<SheetContent side="left">
				<SheetHeader>
					<SheetTitle>Ingegneria Informatica</SheetTitle>
					<SheetDescription>Naviga tra i corsi del tuo dipartimento.</SheetDescription>
				</SheetHeader>
			</SheetContent>
		</Sheet>
	),
};
