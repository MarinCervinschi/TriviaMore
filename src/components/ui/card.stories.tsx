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
 * D27's surface texture. The rule the story shows: the dots sit in the *empty* corner, opposite the
 * content, so they never sit under text; the glow stays off and is turned on only for large or wide
 * cards. Its parent needs `relative overflow-hidden`. Look in both themes.
 */
export const Texture: Story = {
	name: "CardTexture",
	render: () => (
		<div className="grid max-w-3xl gap-4 sm:grid-cols-2">
			<Card className="relative overflow-hidden">
				<CardTexture corner="br" />
				<CardHeader>
					<CardTitle>Contenuto a sinistra</CardTitle>
					<CardDescription>
						I dot nell&apos;angolo opposto, mai sotto il testo.
					</CardDescription>
				</CardHeader>
			</Card>

			<Card className="relative overflow-hidden">
				<CardTexture corner="tr" glow />
				<CardHeader>
					<CardTitle>Con glow</CardTitle>
					<CardDescription>
						Il glow si accende solo per le card grandi o larghe.
					</CardDescription>
				</CardHeader>
			</Card>

			{(["tl", "tr", "bl", "br"] as const).map(corner => (
				<Card key={corner} className="relative overflow-hidden p-5">
					<CardTexture corner={corner} />
					<p className="font-semibold">corner={corner}</p>
					<p className="text-muted-foreground text-sm">
						L&apos;angolo del dettaglio è una prop.
					</p>
				</Card>
			))}
		</div>
	),
};
