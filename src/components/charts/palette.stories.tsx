import type { Meta, StoryObj } from "@storybook/react-vite";

import { HEAT_EMPTY, HEAT_STEPS } from "./heat-scale";
import { CHART_NEUTRAL, CHART_SLOTS } from "./palette";

const meta = {
	title: "Charts/Palette",
	parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Swatch({ color, label }: { color: string; label: string }) {
	return (
		<div className="flex flex-col items-center gap-1.5">
			<span
				className="h-16 w-16 rounded-xl border"
				style={{ backgroundColor: color }}
			/>
			<span className="text-muted-foreground font-mono text-[10px]">{label}</span>
		</div>
	);
}

/**
 * The two palettes side by side. Toggle the theme in the toolbar: dark is a
 * separate set of steps against the dark surface, not the light values flipped.
 */
export const Reference: Story = {
	render: () => (
		<div className="space-y-8">
			<section className="space-y-3">
				<div>
					<h3 className="font-semibold">Categoriale</h3>
					<p className="text-muted-foreground text-sm">
						Identità. Assegnata in ordine di slot e mai ciclata: l&apos;ordine è ciò che
						tiene separate le serie adiacenti anche in deuteranopia. Oltre la quinta
						serie, la coda confluisce in «Altro».
					</p>
				</div>
				<div className="flex flex-wrap gap-4">
					{CHART_SLOTS.map((color, index) => (
						<Swatch key={color} color={color} label={`chart-${index + 1}`} />
					))}
					<Swatch color={CHART_NEUTRAL} label="altro" />
				</div>
			</section>

			<section className="space-y-3">
				<div>
					<h3 className="font-semibold">Sequenziale</h3>
					<p className="text-muted-foreground text-sm">
						Magnitudine. Una sola tinta, luminosità monotona. Le heatmap usano questa e
						mai la categoriale.
					</p>
				</div>
				<div className="flex flex-wrap gap-4">
					<Swatch color={HEAT_EMPTY} label="vuoto" />
					{HEAT_STEPS.map((color, index) => (
						<Swatch key={color} color={color} label={`heat-${index + 1}`} />
					))}
				</div>
			</section>

			<section className="space-y-3">
				<div>
					<h3 className="font-semibold">Stato</h3>
					<p className="text-muted-foreground text-sm">
						Riservati. Non vanno mai riusati come «serie 4», e viaggiano sempre con
						un&apos;etichetta, mai col colore da solo.
					</p>
				</div>
				<div className="flex flex-wrap gap-4">
					<Swatch color="var(--color-success)" label="success" />
					<Swatch color="var(--color-warning)" label="warning" />
					<Swatch color="var(--color-info)" label="info" />
					<Swatch color="var(--color-destructive)" label="destructive" />
				</div>
			</section>
		</div>
	),
};
