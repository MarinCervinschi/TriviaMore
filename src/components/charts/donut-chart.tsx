import type { ReactNode } from "react";
import { useId } from "react";

import { InfoCircleIcon } from "@solar-icons/react/linear/info-circle";
import { Label, Pie, PieChart } from "recharts";

import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { InlineEmpty } from "@/components/ui/empty-state";
import { formatNumber } from "@/lib/utils/format";

import { ChartCard, type ChartCardProps } from "./chart-card";
import { ChartDefs, seriesFill } from "./chart-defs";
import { CHART_NEUTRAL, chartColor } from "./palette";

export type DonutDatum = {
	/** Stable identity for the slice — the colour follows this, never the rank. */
	key: string;
	label: string;
	value: number;
	/** Overrides the categorical slot, for a slice whose colour carries meaning. */
	color?: string;
	/** `hatched` marks a slice that is not a real category — the folded tail. */
	fill?: "solid" | "gradient" | "hatched";
};

export type DonutChartProps = Omit<ChartCardProps, "children" | "footer"> & {
	data: DonutDatum[];
	/** The noun under the centre total: "corsi", "domande". */
	unitLabel: string;
	size?: number;
	/** Hides the legend list under the ring. */
	hideLegend?: boolean;
	/**
	 * `ring` is the thin donut with the total in the middle. `petals` is thicker and
	 * cuts the slices apart with rounded ends — for a distribution, where the arcs
	 * are the reading and the counts belong to the legend and the tooltip.
	 */
	variant?: "ring" | "petals";
	/** A figure that belongs above the ring — a total, a headline count. */
	header?: ReactNode;
	/** What sits in the hole. Defaults to the total and the unit. */
	center?: { value: ReactNode; caption?: string };
	/** A caveat under the legend, behind a rule: how to read the slices. */
	note?: ReactNode;
	emptyMessage?: string;
};

/**
 * Parts of a whole, with the total in the middle. Past five slices the tail
 * should be folded into a single "Altro" datum by the caller — a sixth hue would
 * not survive the palette's separation checks.
 */
export function DonutChart({
	data,
	unitLabel,
	size = 220,
	hideLegend = false,
	variant = "ring",
	header,
	center,
	note,
	emptyMessage,
	...card
}: DonutChartProps) {
	const scope = `donut-${useId().replace(/:/g, "")}`;
	const config: ChartConfig = data.reduce<ChartConfig>((acc, entry, index) => {
		acc[entry.key] = { label: entry.label, color: entry.color ?? chartColor(index) };
		return acc;
	}, {});

	const chartData = data.map(entry => ({
		...entry,
		fill: seriesFill(scope, entry),
		legendColor: entry.color ?? `var(--color-${entry.key})`,
	}));
	const total = data.reduce((sum, entry) => sum + entry.value, 0);
	const petals = variant === "petals";

	if (data.length === 0) {
		return (
			<ChartCard {...card}>
				<InlineEmpty>{emptyMessage}</InlineEmpty>
			</ChartCard>
		);
	}

	return (
		<ChartCard
			{...card}
			footer={
				note && (
					<p className="text-muted-foreground flex items-start gap-2 text-xs">
						<InfoCircleIcon className="mt-px size-3.5 shrink-0" />
						<span>{note}</span>
					</p>
				)
			}
		>
			{header}
			<ChartContainer
				config={config}
				className="mx-auto aspect-square w-full"
				style={{ maxWidth: size }}
			>
				<PieChart>
					<ChartDefs scope={scope} series={data} />
					<ChartTooltip
						cursor={false}
						content={
							<ChartTooltipContent
								hideLabel
								formatter={(value, _name, item) => {
									const key = item.payload?.key as string | undefined;
									return (
										<div className="flex w-full items-center justify-between gap-3">
											<span className="text-muted-foreground">
												{(key && config[key]?.label) ?? ""}
											</span>
											<span className="font-semibold tabular-nums">
												{formatNumber(value as number)} {unitLabel}
											</span>
										</div>
									);
								}}
							/>
						}
					/>
					<Pie
						data={chartData}
						dataKey="value"
						nameKey="key"
						innerRadius={petals ? "34%" : "56%"}
						strokeWidth={petals ? 0 : 3}
						paddingAngle={petals ? 3 : 2}
						cornerRadius={petals ? 8 : undefined}
					>
						{!petals && (
							<Label
								content={({ viewBox }) => {
									if (!viewBox || !("cx" in viewBox)) return null;
									return (
										<text
											x={viewBox.cx}
											y={viewBox.cy}
											textAnchor="middle"
											dominantBaseline="middle"
										>
											<tspan
												x={viewBox.cx}
												y={viewBox.cy}
												className="fill-foreground text-2xl font-bold"
											>
												{center?.value ?? formatNumber(total)}
											</tspan>
											<tspan
												x={viewBox.cx}
												y={(viewBox.cy ?? 0) + 22}
												className="fill-muted-foreground text-xs"
											>
												{center?.caption ?? unitLabel}
											</tspan>
										</text>
									);
								}}
							/>
						)}
					</Pie>
				</PieChart>
			</ChartContainer>
			{!hideLegend && (
				<ul className="grid grid-cols-1 gap-2 text-sm">
					{chartData.map(entry => (
						<li key={entry.key} className="flex items-center justify-between gap-2">
							<span className="text-muted-foreground flex min-w-0 items-center gap-1.5">
								<span
									className="h-2 w-2 shrink-0 rounded-full"
									style={{ backgroundColor: entry.legendColor }}
								/>
								<span className="truncate">{entry.label}</span>
							</span>
							<span className="text-foreground font-semibold tabular-nums">
								{formatNumber(entry.value)}
							</span>
						</li>
					))}
				</ul>
			)}
		</ChartCard>
	);
}

/** Folds everything past `limit` into a single neutral "Altro" slice. */
export function foldDonutTail(
	data: DonutDatum[],
	limit = 5,
	label = "Altro"
): DonutDatum[] {
	if (data.length <= limit) return data;
	const head = data.slice(0, limit - 1);
	const tail = data.slice(limit - 1);
	return [
		...head,
		{
			key: "other",
			label,
			value: tail.reduce((sum, entry) => sum + entry.value, 0),
			color: CHART_NEUTRAL,
			// Texture, because this slice is a bucket rather than a real category.
			fill: "hatched",
		},
	];
}
