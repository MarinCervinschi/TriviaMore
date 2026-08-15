import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "./button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTexture,
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

/**
 * D27/D28's surface texture: a pixel field placed by `placement`. The page already carries the dot
 * band, so the card wears this instead — sitting on the content, not the empty corner; on content-rich
 * cards drop `alpha` to keep it light but present. Its parent needs `relative overflow-hidden`. Look in
 * both themes.
 */
export const Texture: Story = {
	name: "CardTexture",
	render: () => (
		<div className="grid max-w-3xl gap-4 sm:grid-cols-2">
			<Card className="relative overflow-hidden">
				<CardTexture placement="tl" />
				<CardHeader>
					<CardTitle>Sul contenuto</CardTitle>
					<CardDescription>La texture va dove sta l&apos;icona (D28).</CardDescription>
				</CardHeader>
			</Card>

			<Card className="relative overflow-hidden">
				<CardTexture placement="center" alpha={0.12} />
				<CardHeader>
					<CardTitle>Card ricca → alpha bassa</CardTitle>
					<CardDescription>Più leggera ma comunque presente.</CardDescription>
				</CardHeader>
			</Card>

			{(["tl", "tr", "center", "full"] as const).map(placement => (
				<Card key={placement} className="relative overflow-hidden p-5">
					<CardTexture placement={placement} />
					<p className="font-semibold">placement={placement}</p>
					<p className="text-muted-foreground text-sm">La posizione è una prop.</p>
				</Card>
			))}
		</div>
	),
};
