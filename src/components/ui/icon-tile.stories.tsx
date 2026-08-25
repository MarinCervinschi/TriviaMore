import { BookmarkIcon } from "@solar-icons/react/linear/bookmark";
import { CheckCircleIcon } from "@solar-icons/react/linear/check-circle";
import { ClockCircleIcon } from "@solar-icons/react/linear/clock-circle";
import { CupFirstIcon } from "@solar-icons/react/linear/cup-first";
import { DiplomaIcon } from "@solar-icons/react/linear/diploma";
import { GraphUpIcon } from "@solar-icons/react/linear/graph-up";
import { LayersIcon } from "@solar-icons/react/linear/layers";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { IconTile } from "./icon-tile";

const meta = {
	title: "UI/IconTile",
	component: IconTile,
	tags: ["autodocs"],
	args: { children: <CupFirstIcon />, variant: "outline", size: "default" },
	argTypes: {
		variant: {
			control: "select",
			options: ["outline", "elevated", "soft", "solid", "frame"],
		},
		size: { control: "select", options: ["xs", "sm", "default", "lg", "xl"] },
		radius: { control: "select", options: ["default", "full"] },
	},
} satisfies Meta<typeof IconTile>;

export default meta;
type Story = StoryObj<typeof meta>;

const VARIANTS = ["outline", "elevated", "soft", "solid", "frame"] as const;
const SIZES = ["xs", "sm", "default", "lg", "xl"] as const;

function Cell({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div className="flex flex-col items-center gap-2">
			{children}
			<span className="text-muted-foreground text-xs">{label}</span>
		</div>
	);
}

export const Default: Story = {};

export const Varianti: Story = {
	render: () => {
		const icons = [
			<CupFirstIcon key="a" />,
			<GraphUpIcon key="b" />,
			<CheckCircleIcon key="c" />,
			<DiplomaIcon key="d" />,
			<BookmarkIcon key="e" />,
		];
		return (
			<div className="flex flex-wrap items-start gap-6">
				{VARIANTS.map((variant, i) => (
					<Cell key={variant} label={variant}>
						<IconTile variant={variant} size="lg">
							{icons[i]}
						</IconTile>
					</Cell>
				))}
			</div>
		);
	},
};

export const Dimensioni: Story = {
	render: () => (
		<div className="flex flex-wrap items-end gap-6">
			{SIZES.map(size => (
				<Cell key={size} label={size}>
					<IconTile variant="elevated" size={size}>
						<GraphUpIcon />
					</IconTile>
				</Cell>
			))}
		</div>
	),
};

export const Tonde: Story = {
	name: "Tonde (radius full)",
	render: () => (
		<div className="flex flex-wrap items-start gap-6">
			{VARIANTS.map(variant => (
				<Cell key={variant} label={variant}>
					<IconTile variant={variant} size="lg" radius="full">
						<CheckCircleIcon />
					</IconTile>
				</Cell>
			))}
		</div>
	),
};

export const SoftColori: Story = {
	name: "Soft · tinta per metrica",
	render: () => {
		const metrics = [
			{ label: "Quiz", icon: <CupFirstIcon />, ink: "text-chart-1-ink" },
			{ label: "Voto", icon: <GraphUpIcon />, ink: "text-chart-3-ink" },
			{ label: "Accuratezza", icon: <CheckCircleIcon />, ink: "text-chart-2-ink" },
			{ label: "Tempo", icon: <ClockCircleIcon />, ink: "text-chart-4-ink" },
		];
		return (
			<div className="flex flex-wrap items-start gap-6">
				{metrics.map(m => (
					<Cell key={m.label} label={m.label}>
						<IconTile variant="soft" size="lg" className={m.ink}>
							{m.icon}
						</IconTile>
					</Cell>
				))}
			</div>
		);
	},
};

export const Personalizzate: Story = {
	name: "Colorate (override stato)",
	render: () => {
		const tones = [
			{
				label: "brand",
				icon: <CupFirstIcon />,
				cls: "border-primary/15 bg-primary/10 text-brand dark:border-primary/25 dark:bg-primary/15",
			},
			{
				label: "success",
				icon: <CheckCircleIcon />,
				cls: "border-success/15 bg-success/10 text-success dark:border-success/25 dark:bg-success/15",
			},
			{
				label: "warning",
				icon: <ClockCircleIcon />,
				cls: "border-warning/15 bg-warning/10 text-warning dark:border-warning/25 dark:bg-warning/15",
			},
			{
				label: "danger",
				icon: <LayersIcon />,
				cls: "border-destructive/15 bg-destructive/10 text-danger dark:border-destructive/25 dark:bg-destructive/15",
			},
			{
				label: "info",
				icon: <BookmarkIcon />,
				cls: "border-info/15 bg-info/10 text-info dark:border-info/25 dark:bg-info/15",
			},
		];
		return (
			<div className="flex flex-wrap items-start gap-6">
				{tones.map(t => (
					<Cell key={t.label} label={t.label}>
						<IconTile size="lg" className={t.cls}>
							{t.icon}
						</IconTile>
					</Cell>
				))}
			</div>
		);
	},
};
