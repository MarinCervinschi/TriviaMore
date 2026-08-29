import { BookIcon } from "@solar-icons/react/linear/book";
import { BuildingsIcon } from "@solar-icons/react/linear/buildings";
import { CompassIcon } from "@solar-icons/react/linear/compass";
import { DiplomaIcon } from "@solar-icons/react/linear/diploma";
import { DocumentTextIcon } from "@solar-icons/react/linear/document-text";
import { HomeIcon } from "@solar-icons/react/linear/home";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { PageBand } from "@/components/layout/page-band";

import { AppBreadcrumb, type Crumb } from "./app-breadcrumb";

// The deepest trail the catalogue can produce, with the names it really has.
const DEEP: Crumb[] = [
	{ label: "Esplora", to: "/browse", icon: CompassIcon },
	{ label: "Ingegneria «Enzo Ferrari»", to: "/browse", icon: BuildingsIcon },
	{ label: "Artificial Intelligence Engineering", to: "/browse", icon: DiplomaIcon },
	{ label: "Iot and 3d Intelligent Systems", to: "/browse", icon: BookIcon },
	{ label: "Protocolli di comunicazione", icon: DocumentTextIcon },
];

const SHORT: Crumb[] = [
	{ label: "Dashboard", to: "/user", icon: HomeIcon },
	{ label: "Analytics", to: "/user/analytics", icon: DiplomaIcon },
	{ label: "Storico", icon: DocumentTextIcon },
];

/** The band the breadcrumb really sits on, so legibility is judged where it happens. */
function OnBand({ children }: { children: React.ReactNode }) {
	return (
		<div className="bg-background relative isolate min-h-48 overflow-hidden rounded-2xl border">
			<PageBand />
			<div className="p-6">{children}</div>
		</div>
	);
}

const meta = {
	title: "Shared/Breadcrumb",
	component: AppBreadcrumb,
	parameters: { layout: "padded" },
	args: {
		items: DEEP,
		maxItems: 4,
		maxLabel: 22,
		surface: "plain",
		icons: "none",
		boxedFirstIcon: false,
	},
	argTypes: {
		surface: { control: "inline-radio", options: ["plain", "soft", "outline"] },
		icons: { control: "inline-radio", options: ["none", "first", "all"] },
		maxItems: { control: { type: "range", min: 2, max: 6, step: 1 } },
		maxLabel: { control: { type: "range", min: 10, max: 48, step: 2 } },
		boxedFirstIcon: { control: "boolean" },
		items: { table: { disable: true } },
	},
	decorators: [
		Story => (
			<OnBand>
				<Story />
			</OnBand>
		),
	],
} satisfies Meta<typeof AppBreadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Il laboratorio: cambia le variabili dai controlli e guarda cosa regge. */
export const Lab: Story = { name: "Laboratorio" };

export const Combinazioni: Story = {
	name: "Le combinazioni",
	render: () => (
		<div className="space-y-8">
			{(["plain", "soft", "outline"] as const).map(surface => (
				<div key={surface} className="space-y-3">
					<p className="eyebrow text-muted-foreground">{surface}</p>
					{(["none", "first", "all"] as const).map(icons => (
						<div key={icons} className="flex items-center gap-3">
							<span className="text-muted-foreground w-12 text-xs">{icons}</span>
							<AppBreadcrumb items={DEEP} surface={surface} icons={icons} />
						</div>
					))}
					<div className="flex items-center gap-3">
						<span className="text-muted-foreground w-12 text-xs">box</span>
						<AppBreadcrumb
							items={DEEP}
							surface={surface}
							icons="first"
							boxedFirstIcon
						/>
					</div>
				</div>
			))}
		</div>
	),
};

/** Quanti livelli restano prima che il centro si pieghi nel menu. */
export const Soglie: Story = {
	name: "Soglia di collasso",
	render: () => (
		<div className="space-y-4">
			{[2, 3, 4, 5, 6].map(maxItems => (
				<div key={maxItems} className="flex items-center gap-3">
					<span className="text-muted-foreground w-8 text-xs tabular-nums">
						{maxItems}
					</span>
					<AppBreadcrumb items={DEEP} maxItems={maxItems} surface="outline" />
				</div>
			))}
		</div>
	),
};

/** Una scia corta non collassa mai: il menu non deve comparire per abitudine. */
export const Corto: Story = { name: "Scia corta", args: { items: SHORT } };

/** Lo spazio stretto: è qui che si vede se il taglio delle etichette basta. */
export const Stretto: Story = {
	name: "In colonna stretta",
	render: () => (
		<div style={{ width: 380 }}>
			<AppBreadcrumb items={DEEP} maxItems={3} maxLabel={14} />
		</div>
	),
};

/** Quanto stringere le etichette prima che smettano di dire qualcosa. */
export const Etichette: Story = {
	name: "Lunghezza delle etichette",
	render: () => (
		<div className="space-y-3">
			{[14, 18, 22, 28, 40].map(maxLabel => (
				<div key={maxLabel} className="flex items-center gap-3">
					<span className="text-muted-foreground w-8 text-xs tabular-nums">
						{maxLabel}
					</span>
					<AppBreadcrumb items={DEEP} maxLabel={maxLabel} />
				</div>
			))}
		</div>
	),
};
