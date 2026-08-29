import { BoxIcon } from "@solar-icons/react/linear/box";
import { GraphUpIcon } from "@solar-icons/react/linear/graph-up";
import { MapPointIcon } from "@solar-icons/react/linear/map-point";
import type { Meta, StoryObj } from "@storybook/react-vite";

import type { Icon } from "@/components/icons";
import { Button } from "@/components/ui/button";

import { InsetCard } from "./inset-card";

const meta = {
	title: "UI/InsetCard",
	component: InsetCard,
	tags: ["autodocs"],
	parameters: { layout: "padded" },
	args: {
		children: (
			<div className="space-y-1 p-4">
				<p className="font-semibold">Analytics</p>
				<p className="text-muted-foreground text-sm">
					Il pannello interno tiene il contenuto; la cornice tiene le bande.
				</p>
			</div>
		),
	},
} satisfies Meta<typeof InsetCard>;

export default meta;
type Story = StoryObj<typeof meta>;

function Band({ icon: LeadIcon, label }: { icon: Icon; label: string }) {
	return (
		<span className="text-muted-foreground flex items-center gap-2">
			<LeadIcon className="size-4" />
			{label}
		</span>
	);
}

export const Default: Story = { name: "Solo cornice" };

export const ConHeader: Story = {
	name: "Con header",
	args: { header: <Band icon={BoxIcon} label="Total Orders" /> },
};

export const ConFooter: Story = {
	name: "Con footer",
	args: {
		footer: (
			<div className="flex items-center justify-between gap-2">
				<span className="text-muted-foreground">Ultimo aggiornamento 09:20</span>
				<Button size="sm">Report</Button>
			</div>
		),
	},
};

export const Entrambe: Story = {
	name: "Header e footer",
	args: {
		header: <Band icon={GraphUpIcon} label="Revenue" />,
		footer: (
			<div className="flex items-center gap-2">
				<Button variant="outline" size="sm" className="flex-1">
					Rivedi
				</Button>
				<Button size="sm" className="flex-1">
					Report completo
				</Button>
			</div>
		),
	},
};

/** Le combinazioni affiancate: è così che si legge la coerenza tra card diverse. */
export const Combinazioni: Story = {
	name: "Combinazioni",
	render: () => (
		<div className="grid gap-4 md:grid-cols-3">
			<InsetCard header={<Band icon={BoxIcon} label="Total Orders" />}>
				<Body title="Analytics" text="Ogni ordine, con l'andamento in tempo reale." />
			</InsetCard>
			<InsetCard header={<Band icon={GraphUpIcon} label="Revenue" />}>
				<Body title="Financial Summary" text="Incassi e flussi di cassa, subito." />
			</InsetCard>
			<InsetCard
				header={<Band icon={MapPointIcon} label="Shipments" />}
				footer={
					<Button variant="outline" size="sm" className="w-full">
						Apri
					</Button>
				}
			>
				<Body title="Logistics" text="Consegne e stato delle spedizioni." />
			</InsetCard>
		</div>
	),
};

function Body({ title, text }: { title: string; text: string }) {
	return (
		<div className="space-y-1 p-4">
			<p className="font-semibold">{title}</p>
			<p className="text-muted-foreground text-sm">{text}</p>
		</div>
	);
}
