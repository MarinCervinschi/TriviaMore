import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
	title: "Foundations/Tipografia",
	parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const SCALE = [
	["text-3xl", "30 / 36", "Numeri protagonisti, titoli di sezione"],
	["text-2xl", "24 / 32", "Titoli di card e pannelli"],
	["text-xl", "20 / 28", ""],
	["text-lg", "18 / 28", ""],
	["text-base", "16 / 24", "Corpo del testo"],
	["text-sm", "14 / 20", "Il corpo dell'interfaccia — la misura più usata"],
	["text-xs", "12 / 16", "Etichette, hint, occhielli"],
	["text-2xs", "10 / 14", "L'ultimo gradino: contatori, iniziali, badge piccoli"],
];

export const LaScala: Story = {
	name: "La scala",
	render: () => (
		<div className="space-y-1">
			<p className="text-muted-foreground mb-6 max-w-prose text-sm">
				Niente sotto <code className="text-xs">text-2xs</code>: a 10px un&apos;etichetta
				è già al limite della leggibilità, quindi non c&apos;è più nulla da spendere.
				Ogni misura arbitraria in <code className="text-xs">text-[Npx]</code> è una
				perdita da questa scala, non un gradino in più.
			</p>
			{SCALE.map(([cls, px, use]) => (
				<div
					key={cls}
					className="flex items-baseline gap-4 border-b py-2 last:border-0"
				>
					<code className="text-muted-foreground w-20 shrink-0 text-xs">{cls}</code>
					<code className="text-muted-foreground/60 w-16 shrink-0 text-xs tabular-nums">
						{px}
					</code>
					<span className={`${cls} flex-1`}>Sezioni completate questa settimana</span>
					<span className="text-muted-foreground/60 hidden w-64 shrink-0 text-xs lg:block">
						{use}
					</span>
				</div>
			))}
		</div>
	),
};

export const LeTreVoci: Story = {
	name: "Le tre voci",
	render: () => (
		<div className="space-y-8">
			<p className="text-muted-foreground max-w-prose text-sm">
				Tre facce della stessa superfamiglia, ognuna con un lavoro fisso. Non sono
				interscambiabili: un serif nella chrome o un sans su un titolo pubblico rompe il
				sistema.
			</p>
			<div className="space-y-2">
				<code className="text-muted-foreground text-xs">
					font-display · DM Serif Display
				</code>
				<p className="font-display text-4xl leading-tight">
					Studia meglio, supera gli esami
				</p>
				<p className="text-muted-foreground text-xs">
					Solo i titoli di apertura delle pagine pubbliche. Un solo peso, 400 — quindi
					mai con <code>font-bold</code>.
				</p>
			</div>
			<div className="space-y-2">
				<code className="text-muted-foreground text-xs">font-sans · DM Sans</code>
				<p className="text-2xl">Tutto il resto: interfaccia, corpo, etichette, cifre</p>
				<p className="tabular-nums">
					Le cifre allineano con <code className="text-xs">tabular-nums</code>: 148 ·
					1:07 · 26.75
				</p>
			</div>
			<div className="space-y-2">
				<code className="text-muted-foreground text-xs">font-mono · DM Mono</code>
				<p className="font-mono text-lg">DIEF · a3f8c1e2 · v1.4.2</p>
				<p className="text-muted-foreground text-xs">
					Solo codice e identificativi. <strong>Non</strong> le cifre — quelle sono un
					allineamento, e <code>tabular-nums</code> su DM Sans lo fa senza cambiare
					faccia.
				</p>
			</div>
		</div>
	),
};

export const LOcchiello: Story = {
	name: "L'occhiello",
	render: () => (
		<div className="space-y-8">
			<p className="text-muted-foreground max-w-prose text-sm">
				Una voce, due misure. Il colore resta al punto di chiamata: è l&apos;unica parte
				che varia legittimamente. Si chiama <code className="text-xs">eyebrow</code>{" "}
				perché Tailwind possiede già la classe <code className="text-xs">overline</code>
				.
			</p>
			<div className="space-y-6">
				<div>
					<p className="text-brand eyebrow-lg">I nostri valori</p>
					<h2 className="mt-1 text-3xl font-bold tracking-tight">Cosa ci guida</h2>
					<code className="text-muted-foreground/60 mt-2 block text-xs">
						eyebrow-lg — aperture di sezione sulle pagine pubbliche
					</code>
				</div>
				<div className="bg-card max-w-xs rounded-xl border p-4">
					<p className="text-muted-foreground eyebrow">Domande</p>
					<p className="text-foreground mt-1 text-3xl leading-none font-bold tabular-nums">
						24
					</p>
					<code className="text-muted-foreground/60 mt-3 block text-xs">
						eyebrow — dentro card, pannelli, intestazioni di tabella
					</code>
				</div>
			</div>
			<p className="text-muted-foreground max-w-prose border-t pt-4 text-xs">
				Un pill — qualcosa con sfondo o bordo — non è un occhiello: quello è il lavoro
				di <code>Badge</code>.
			</p>
		</div>
	),
};
