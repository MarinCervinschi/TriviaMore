import { AtomIcon } from "@solar-icons/react/linear/atom";
import { BookIcon } from "@solar-icons/react/linear/book";
import { BookmarkIcon } from "@solar-icons/react/linear/bookmark";
import { Chart2Icon } from "@solar-icons/react/linear/chart-2";
import { CloudUploadIcon } from "@solar-icons/react/linear/cloud-upload";
import { CupFirstIcon } from "@solar-icons/react/linear/cup-first";
import { DocumentTextIcon } from "@solar-icons/react/linear/document-text";
import { FolderOpenIcon } from "@solar-icons/react/linear/folder-open";
import { GraphUpIcon } from "@solar-icons/react/linear/graph-up";
import { LibraryIcon } from "@solar-icons/react/linear/library";
import { LightbulbMinimalisticIcon } from "@solar-icons/react/linear/lightbulb-minimalistic";
import { LockKeyholeIcon } from "@solar-icons/react/linear/lock-keyhole";
import { ShieldIcon } from "@solar-icons/react/linear/shield";
import { Widget2Icon } from "@solar-icons/react/linear/widget-2";
import type { Meta, StoryObj } from "@storybook/react-vite";

import type { Icon } from "@/components/icons";
import { cn } from "@/lib/utils";

import { Badge } from "./badge";
import { Card, CardTexture } from "./card";

const meta = {
	title: "Card/Varianti",
	parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const CHART = {
	1: { tile: "bg-chart-1/10", ink: "text-chart-1-ink" },
	2: { tile: "bg-chart-2/10", ink: "text-chart-2-ink" },
	3: { tile: "bg-chart-3/10", ink: "text-chart-3-ink" },
	4: { tile: "bg-chart-4/10", ink: "text-chart-4-ink" },
} as const;
type ChartKey = keyof typeof CHART;

function MonoTile({ icon: I, className }: { icon: Icon; className?: string }) {
	return (
		<div
			className={cn("bg-muted text-foreground inline-flex rounded-xl p-2.5", className)}
		>
			<I className="size-5" />
		</div>
	);
}

function ColorTile({ icon: I, chart }: { icon: Icon; chart: ChartKey }) {
	const c = CHART[chart];
	return (
		<div className={cn("inline-flex rounded-xl p-2.5", c.tile)}>
			<I className={cn("size-5", c.ink)} />
		</div>
	);
}

function FeatureCard({
	icon,
	title,
	desc,
}: {
	icon: Icon;
	title: string;
	desc: string;
}) {
	return (
		<Card className="relative overflow-hidden">
			<CardTexture corner="br" />
			<div className="relative p-6">
				<MonoTile icon={icon} className="mb-4" />
				<h3 className="mb-1 font-semibold tracking-tight">{title}</h3>
				<p className="text-muted-foreground text-sm">{desc}</p>
			</div>
		</Card>
	);
}

function StatCard({
	icon,
	label,
	value,
	chart,
}: {
	icon: Icon;
	label: string;
	value: string;
	chart: ChartKey;
}) {
	return (
		<Card className="relative overflow-hidden">
			<CardTexture corner="tr" />
			<div className="relative p-5">
				<ColorTile icon={icon} chart={chart} />
				<p className="text-muted-foreground mt-3 text-sm">{label}</p>
				<p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
			</div>
		</Card>
	);
}

const STATUS = {
	online: { label: "Online", text: "text-success", dot: "bg-success" },
	synced: { label: "Synced", text: "text-info", dot: "bg-info" },
	idle: { label: "Idle", text: "text-warning", dot: "bg-warning" },
} as const;
type StatusKey = keyof typeof STATUS;

function StatusCard({
	icon,
	title,
	status,
	note,
}: {
	icon: Icon;
	title: string;
	status: StatusKey;
	note: string;
}) {
	const s = STATUS[status];
	return (
		<Card className="relative overflow-hidden">
			<CardTexture corner="tr" />
			<div className="relative flex items-center gap-3 p-4">
				<MonoTile icon={icon} className="shrink-0" />
				<div className="min-w-0">
					<p className="font-medium">{title}</p>
					<p className="text-muted-foreground flex items-center gap-1.5 text-sm">
						<span className={cn("inline-block size-1.5 rounded-full", s.dot)} />
						<span className={cn("font-medium", s.text)}>{s.label}</span>
						<span className="text-muted-foreground/70">· {note}</span>
					</p>
				</div>
			</div>
		</Card>
	);
}

function FlowTile({ icon: I, chart }: { icon: Icon; chart?: ChartKey }) {
	if (chart) {
		const c = CHART[chart];
		return (
			<div className={cn("inline-flex rounded-lg p-2", c.tile)}>
				<I className={cn("size-5", c.ink)} />
			</div>
		);
	}
	return (
		<div className="bg-muted text-muted-foreground inline-flex rounded-lg p-2">
			<I className="size-5" />
		</div>
	);
}

function FlowCard({
	center,
	chart,
	title,
	tier,
	desc,
}: {
	center: Icon;
	chart: ChartKey;
	title: string;
	tier: { label: string; cls: string };
	desc: string;
}) {
	return (
		<Card className="relative overflow-hidden">
			<div className="p-4">
				<div className="relative flex h-24 items-center overflow-hidden rounded-xl border px-6">
					<CardTexture corner="tl" glow />
					<div className="relative flex w-full items-center gap-2">
						<FlowTile icon={DocumentTextIcon} />
						<span className="border-border h-px flex-1 border-t border-dashed" />
						<FlowTile icon={center} chart={chart} />
						<span className="border-border h-px flex-1 border-t border-dashed" />
						<FlowTile icon={FolderOpenIcon} />
					</div>
				</div>
				<div className="mt-4">
					<div className="flex items-center gap-2">
						<h3 className="font-semibold tracking-tight">{title}</h3>
						<Badge variant="outline" size="sm" className={cn("ml-auto", tier.cls)}>
							{tier.label}
						</Badge>
					</div>
					<p className="text-muted-foreground mt-1 text-sm">{desc}</p>
				</div>
			</div>
		</Card>
	);
}

function IconOnlyCard({ icon: I, chart }: { icon: Icon; chart?: ChartKey }) {
	return (
		<Card className="relative overflow-hidden">
			<CardTexture corner="br" />
			<div className="relative flex items-center justify-center p-10">
				<div
					className={cn(
						"inline-flex rounded-2xl p-4",
						chart ? CHART[chart].tile : "bg-muted"
					)}
				>
					<I className={cn("size-8", chart ? CHART[chart].ink : "text-foreground")} />
				</div>
			</div>
		</Card>
	);
}

/** Icona monotono + testo. */
export const TestoEIcona: Story = {
	name: "Testo + icona",
	render: () => (
		<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
			<FeatureCard
				icon={GraphUpIcon}
				title="Performance"
				desc="Optimize speed and efficiency"
			/>
			<FeatureCard
				icon={Widget2Icon}
				title="Design System"
				desc="Build with consistent UI blocks"
			/>
			<FeatureCard
				icon={ShieldIcon}
				title="User Security"
				desc="Simplify user and roles setup"
			/>
			<FeatureCard
				icon={BookIcon}
				title="Documentation"
				desc="Guides and best practices"
			/>
		</div>
	),
};

/** Icona colorata (categoria = token chart) + numero, dot sul lato vuoto. */
export const IconeColorate: Story = {
	name: "Icone colorate (stat)",
	render: () => (
		<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
			<StatCard icon={CupFirstIcon} label="Quiz completati" value="71" chart={1} />
			<StatCard icon={GraphUpIcon} label="Punteggio medio" value="29.42/33" chart={2} />
			<StatCard icon={LibraryIcon} label="Insegnamenti seguiti" value="6" chart={3} />
			<StatCard icon={BookmarkIcon} label="Segnalibri" value="0" chart={4} />
		</div>
	),
};

/** Icona a sinistra + stato: layout orizzontale, colore dello stato dal token semantico. */
export const Stato: Story = {
	name: "Icona + stato",
	render: () => (
		<div className="grid gap-4 sm:grid-cols-3">
			<StatusCard
				icon={Widget2Icon}
				title="Database Server"
				status="online"
				note="Last backup 10 mins ago"
			/>
			<StatusCard
				icon={FolderOpenIcon}
				title="Storage Bucket"
				status="synced"
				note="Last backup 10 mins ago"
			/>
			<StatusCard
				icon={Chart2Icon}
				title="Analytics Engine"
				status="idle"
				note="Last run 1 day ago"
			/>
		</div>
	),
};

/** Flow di icone + badge: card larga, glow acceso nel box del flow. */
export const Flow: Story = {
	render: () => (
		<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			<FlowCard
				center={AtomIcon}
				chart={4}
				title="Email Delivery"
				tier={{ label: "Premium", cls: "text-chart-4-ink border-chart-4/30" }}
				desc="Transactional email tuned for speed, observability, and reliable delivery."
			/>
			<FlowCard
				center={CloudUploadIcon}
				chart={1}
				title="Payments"
				tier={{ label: "Regular", cls: "text-chart-1-ink border-chart-1/30" }}
				desc="Optimized payment processing for speed, reliability, and global reach."
			/>
			<FlowCard
				center={LockKeyholeIcon}
				chart={2}
				title="Auth & Access"
				tier={{ label: "Enterprise", cls: "text-chart-2-ink border-chart-2/30" }}
				desc="Authentication and data access wired together for secure onboarding."
			/>
		</div>
	),
};

/** Solo icona: colorata vs monotono, dot nell'angolo opposto. */
export const SoloIcona: Story = {
	name: "Solo icona (colore vs mono)",
	render: () => (
		<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
			<IconOnlyCard icon={AtomIcon} chart={4} />
			<IconOnlyCard icon={LightbulbMinimalisticIcon} chart={2} />
			<IconOnlyCard icon={ShieldIcon} />
			<IconOnlyCard icon={Chart2Icon} />
		</div>
	),
};
