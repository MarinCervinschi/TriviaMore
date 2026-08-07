import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "./button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "./card";

const meta = {
	title: "UI/Card",
	component: Card,
	tags: ["autodocs"],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<Card className="w-80">
			<CardHeader>
				<CardTitle>Analisi Matematica I</CardTitle>
				<CardDescription>Ingegneria Informatica · 1° anno</CardDescription>
			</CardHeader>
			<CardContent className="text-muted-foreground text-sm">
				142 domande in 6 sezioni.
			</CardContent>
			<CardFooter className="justify-end">
				<Button size="sm">Inizia quiz</Button>
			</CardFooter>
		</Card>
	),
};
