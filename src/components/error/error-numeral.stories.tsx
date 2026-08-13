import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";

import { Input } from "@/components/ui/input";

import { ErrorNumeral } from "./error-numeral";

const meta = {
	title: "Error/ErrorNumeral",
	component: ErrorNumeral,
	tags: ["autodocs"],
	args: { children: "404" },
	parameters: { layout: "padded" },
} satisfies Meta<typeof ErrorNumeral>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Hooks cannot run in a `render` arrow, so the live version is its own component. */
function LivePreview() {
	const [code, setCode] = useState("404");

	return (
		<div className="space-y-8">
			<div className="max-w-40 space-y-2">
				<label htmlFor="error-code" className="text-sm font-medium">
					Codice
				</label>
				<Input
					id="error-code"
					value={code}
					onChange={event => setCode(event.target.value)}
					maxLength={6}
					placeholder="404"
					className="tabular-nums"
				/>
			</div>
			<ErrorNumeral>{code || " "}</ErrorNumeral>
			<p className="text-muted-foreground max-w-prose text-xs">
				Lo stesso si fa dal pannello <strong>Controls</strong> di Storybook su qualunque
				storia: <code>children</code> è un arg, quindi è già modificabile dal vivo lì.
				Questo input serve solo ad avercelo sotto gli occhi senza aprire il pannello.
			</p>
		</div>
	);
}

export const Playground: Story = {
	name: "Provalo",
	render: () => <LivePreview />,
};

export const InContext: Story = {
	name: "Nella pagina",
	render: args => (
		<div className="flex flex-col items-center text-center">
			<ErrorNumeral {...args} />
			<h1 className="-mt-2 text-xl font-semibold sm:-mt-4 sm:text-2xl">
				Pagina non trovata
			</h1>
			<p className="text-muted-foreground mt-3 max-w-md text-sm">
				La pagina che stai cercando non esiste o è stata spostata.
			</p>
		</div>
	),
};

/**
 * The three layers, built by *subtracting* from the real utility with an inline style rather than
 * restating its gradients — a copied value is a value that drifts.
 */
const LAYERS: [label: string, style: React.CSSProperties, note: string][] = [
	[
		"1 · solo riempimento",
		{ maskImage: "none", filter: "none" },
		"il gradiente nel riempimento. Il piede si schiarisce ma finisce di netto.",
	],
	[
		"2 · più la maschera",
		{ filter: "none" },
		"la maschera sfuma anche l'elemento: le due alfa si moltiplicano e il piede si dissolve.",
	],
	[
		"3 · più la luce sotto",
		{},
		"un filo del colore della pagina un pixel sotto. È questo che ribalta il glifo da sollevato a infossato.",
	],
];

export const HowItDissolves: Story = {
	name: "Come si dissolve",
	render: () => (
		<div className="space-y-8">
			<p className="text-muted-foreground max-w-prose text-sm">
				Tre strati, ognuno con un compito diverso. La dissolvenza sta nel{" "}
				<em>riempimento</em> e non in un&apos;opacità sull&apos;elemento, perché quella
				abbasserebbe il glifo per intero invece del solo piede. La luce va{" "}
				<strong>sotto</strong>: colpisce il labbro inferiore di un incavo, non quello
				superiore.
			</p>
			<div className="grid gap-8 sm:grid-cols-3">
				{LAYERS.map(([label, style, note]) => (
					<div key={label} className="space-y-2">
						<p className="text-sm font-semibold">{label}</p>
						<ErrorNumeral className="sm:text-8xl" style={style}>
							404
						</ErrorNumeral>
						<p className="text-muted-foreground text-xs">{note}</p>
					</div>
				))}
			</div>
			<p className="text-muted-foreground max-w-prose border-t pt-4 text-xs">
				Guardalo in entrambi i temi: la dissolvenza arriva al colore della pagina,
				quindi in scuro svanisce verso il nero e in chiaro verso il bianco — non è lo
				stesso effetto, ed è la ragione per cui gli stop sono tarati larghi.
			</p>
		</div>
	),
};

export const OtherCodes: Story = {
	name: "Altri codici",
	render: () => (
		<div className="flex flex-wrap items-start gap-10">
			{["403", "500", "418"].map(code => (
				<ErrorNumeral key={code}>{code}</ErrorNumeral>
			))}
		</div>
	),
};
