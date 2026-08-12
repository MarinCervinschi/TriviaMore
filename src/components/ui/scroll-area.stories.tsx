import type { Meta, StoryObj } from "@storybook/react-vite";

import { ScrollArea } from "./scroll-area";
import { Separator } from "./separator";

const sezioni = [
	"Limiti e continuità",
	"Derivate",
	"Studio di funzione",
	"Integrali indefiniti",
	"Integrali definiti",
	"Serie numeriche",
	"Successioni",
	"Equazioni differenziali",
	"Numeri complessi",
	"Teoremi fondamentali",
];

const meta = {
	title: "UI/ScrollArea",
	component: ScrollArea,
	tags: ["autodocs"],
} satisfies Meta<typeof ScrollArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<ScrollArea className="h-56 w-64 rounded-lg border">
			<div className="p-4">
				<h4 className="mb-3 text-sm font-medium">Sezioni del corso</h4>
				{sezioni.map(sezione => (
					<div key={sezione}>
						<div className="py-1.5 text-sm">{sezione}</div>
						<Separator />
					</div>
				))}
			</div>
		</ScrollArea>
	),
};

export const LongText: Story = {
	render: () => (
		<ScrollArea className="h-48 w-80 rounded-lg border p-4 text-sm leading-relaxed">
			<p>
				Il teorema di De l'Hôpital permette di calcolare il limite del rapporto tra due
				funzioni quando questo si presenta nella forma indeterminata 0/0 oppure ∞/∞.
				Sotto opportune ipotesi di derivabilità, il limite del rapporto delle funzioni è
				uguale al limite del rapporto delle rispettive derivate. È uno strumento
				centrale nello studio dei limiti in Analisi Matematica I, ma va applicato
				verificando sempre le ipotesi: la sua applicazione meccanica è una fonte
				frequente di errori negli esami scritti.
			</p>
		</ScrollArea>
	),
};
