import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "./button";
import {
	Sheet,
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

export const LeftSide: Story = {
	render: () => (
		<Sheet>
			<SheetTrigger asChild>
				<Button variant="outline">Apri menu corsi</Button>
			</SheetTrigger>
			<SheetContent side="left">
				<SheetHeader>
					<SheetTitle>Ingegneria Informatica</SheetTitle>
					<SheetDescription>
						Naviga tra i corsi del tuo dipartimento.
					</SheetDescription>
				</SheetHeader>
			</SheetContent>
		</Sheet>
	),
};
