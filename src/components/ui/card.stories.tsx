import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "./button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardOrb,
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

export const Panel: Story = {
	name: "level=panel",
	render: () => (
		<Card level="panel" className="max-w-xl p-8 text-center sm:p-12">
			<p className="text-muted-foreground eyebrow-lg">Quiz completato</p>
			<p className="font-display mt-2 text-4xl tabular-nums">78/100</p>
			<p className="text-muted-foreground mx-auto mt-3 max-w-sm text-sm">
				Il livello di pagina: un raggio più grande e nient&apos;altro. Il padding resta
				a chi lo usa, perché i dieci siti che vogliono questo livello ne usano tre
				diversi.
			</p>
		</Card>
	),
};

export const Orb: Story = {
	name: "CardOrb",
	render: () => (
		<div className="grid max-w-3xl gap-4 sm:grid-cols-3">
			{(["sm", "md", "lg"] as const).map(size => (
				<Card key={size} className="relative overflow-hidden p-5">
					<CardOrb size={size} />
					<p className="font-semibold">{size}</p>
					<p className="text-muted-foreground text-sm">
						Il genitore ha bisogno di <code>relative overflow-hidden</code>.
					</p>
				</Card>
			))}
			<Card className="relative overflow-hidden p-5">
				<CardOrb corner="bl" tint="bg-success/10" />
				<p className="font-semibold">corner=bl</p>
				<p className="text-muted-foreground text-sm">
					Angolo e tinta sono indipendenti.
				</p>
			</Card>
		</div>
	),
};
