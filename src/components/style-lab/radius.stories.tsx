import { MagnifierIcon } from "@solar-icons/react/linear/magnifier";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Throwaway lab for O3's radius question. Delete once decided.

const meta = {
	title: "Style Lab/Radius",
	parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** What each class renders today, measured from the emitted CSS, against what the docs claim. */
const LADDER = [
	["rounded-sm", "8px", "4px", "checkbox"],
	["rounded-md", "10px", "—", "non documentato, 25 usi"],
	["rounded-lg", "12px", "8px", "tab, elementi piccoli"],
	["rounded-xl", "16px", "12px", "bottoni, input, select — 266 usi"],
	["rounded-2xl", "16px", "16px", "card, dialog, toast — 167 usi"],
	["rounded-3xl", "24px", "24px", "contenitori grandi"],
];

export const IlDisallineamento: Story = {
	name: "1 · Il disallineamento",
	render: () => (
		<div className="space-y-6">
			<p className="text-muted-foreground max-w-prose text-sm">
				<code className="text-xs">@theme</code> ridefinisce{" "}
				<code className="text-xs">--radius-sm/md/lg/xl</code> a partire da{" "}
				<code className="text-xs">--radius</code>, ma lascia{" "}
				<code className="text-xs">2xl</code> e <code className="text-xs">3xl</code> ai
				valori di Tailwind. Il risultato è che la scala è slittata di un gradino:{" "}
				<strong>
					<code>rounded-xl</code> e <code>rounded-2xl</code> rendono entrambi 16px
				</strong>{" "}
				— 433 usi, due nomi, un valore. E il doc sbaglia su tre righe su sei.
			</p>
			<div className="space-y-2">
				<div className="text-muted-foreground grid grid-cols-[9rem_5rem_5rem_1fr_4rem] gap-3 text-xs">
					<span>classe</span>
					<span>reale</span>
					<span>doc</span>
					<span>uso</span>
					<span />
				</div>
				{LADDER.map(([cls, real, doc, use]) => (
					<div
						key={cls}
						className="grid grid-cols-[9rem_5rem_5rem_1fr_4rem] items-center gap-3 border-b py-2 last:border-0"
					>
						<code className="text-xs">{cls}</code>
						<code className="text-xs tabular-nums">{real}</code>
						<code
							className={
								real === doc
									? "text-muted-foreground text-xs tabular-nums"
									: "text-danger text-xs font-bold tabular-nums"
							}
						>
							{doc}
						</code>
						<span className="text-muted-foreground text-xs">{use}</span>
						<div
							className="bg-muted border-border h-10 w-16 border"
							style={{ borderRadius: real }}
						/>
					</div>
				))}
			</div>
		</div>
	),
};

function Controls({ r, label }: { r: string; label: string }) {
	return (
		<div className="flex-1 space-y-4">
			<div>
				<p className="text-sm font-semibold">{label}</p>
				<p className="text-muted-foreground text-xs">bottoni e input a {r}</p>
			</div>
			<div className="flex flex-wrap items-center gap-3">
				<button
					className="bg-primary text-primary-foreground h-10 px-5 text-sm font-medium shadow-sm"
					style={{ borderRadius: r }}
				>
					Inizia a studiare
				</button>
				<button
					className="border-input bg-background h-10 border px-5 text-sm font-medium shadow-sm"
					style={{ borderRadius: r }}
				>
					Esplora
				</button>
				<button
					className="border-input bg-background flex h-10 w-10 items-center justify-center border shadow-sm"
					style={{ borderRadius: r }}
					aria-label="Cerca"
				>
					<MagnifierIcon className="size-4" />
				</button>
			</div>
			<input
				placeholder="Cerca insegnamento…"
				className="border-input bg-background h-10 w-full border px-3 text-sm shadow-sm"
				style={{ borderRadius: r }}
			/>
			<div
				className="bg-card border-border space-y-2 border p-5"
				style={{ borderRadius: "16px" }}
			>
				<p className="text-muted-foreground eyebrow">Sezione</p>
				<p className="font-semibold">Alberi binari di ricerca</p>
				<p className="text-muted-foreground text-sm">
					La card resta a 16px in entrambe le colonne — è il controllo dentro che
					cambia.
				</p>
				<div className="flex gap-2 pt-1">
					<Badge variant="outline" size="sm">
						Facile
					</Badge>
					<button
						className="bg-primary text-primary-foreground h-8 px-3.5 text-xs font-medium"
						style={{ borderRadius: r }}
					>
						Avvia
					</button>
				</div>
			</div>
		</div>
	);
}

export const ControlliANoveECinque: Story = {
	name: "2 · Il controllo dentro la card",
	render: () => (
		<div className="space-y-6">
			<p className="text-muted-foreground max-w-prose text-sm">
				È qui che si decide. Oggi il bottone dentro una card è tondo{" "}
				<em>quanto la card</em>, perché entrambi sono 16px — e un controllo che ripete
				il raggio del suo contenitore perde il gradino di gerarchia. A sinistra come
				spedisce, a destra la scala risanata.
			</p>
			<div className="flex flex-col gap-8 md:flex-row">
				<Controls r="16px" label="Oggi — rounded-xl = 16px" />
				<Controls r="12px" label="Proposta — rounded-xl = 12px" />
			</div>
		</div>
	),
};

export const LaScalaRisanata: Story = {
	name: "3 · La scala risanata",
	render: () => (
		<div className="space-y-6">
			<p className="text-muted-foreground max-w-prose text-sm">
				Tutti i gradini derivati da <code className="text-xs">--radius</code>, così quel
				token diventa davvero l&apos;unica manopola: oggi controlla solo metà della
				scala, e cambiarlo lascerebbe card e contenitori grandi dove sono.
			</p>
			<div className="space-y-2">
				{[
					["rounded-sm", "4px", "calc(--radius − 8px)"],
					["rounded-lg", "8px", "calc(--radius − 4px)"],
					["rounded-xl", "12px", "--radius"],
					["rounded-2xl", "16px", "calc(--radius + 4px)"],
					["rounded-3xl", "24px", "calc(--radius + 12px)"],
				].map(([cls, px, expr]) => (
					<div
						key={cls}
						className="flex items-center gap-4 border-b py-2 last:border-0"
					>
						<code className="w-28 shrink-0 text-xs">{cls}</code>
						<code className="text-muted-foreground w-14 shrink-0 text-xs tabular-nums">
							{px}
						</code>
						<code className="text-muted-foreground/70 flex-1 text-xs">{expr}</code>
						<div
							className="bg-muted border-border h-10 w-16 border"
							style={{ borderRadius: px }}
						/>
					</div>
				))}
			</div>
			<p className="text-muted-foreground max-w-prose border-t pt-4 text-xs">
				<code>rounded-md</code> sparisce dall&apos;uso: vale 10px, non è documentato, e
				i suoi 25 punti vogliono gli 8px di <code>rounded-lg</code>. Un nome per valore.
			</p>
			<Button variant="outline">Un bottone reale, per confronto</Button>
		</div>
	),
};
