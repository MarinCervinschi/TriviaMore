import { useId } from "react";

import {
	CartesianGrid,
	ReferenceLine,
	Scatter,
	ScatterChart,
	XAxis,
	YAxis,
} from "recharts";

import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { InlineEmpty } from "@/components/ui/empty-state";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

import { CHART_PLOT_CLASS, ChartCard, type ChartCardProps } from "./chart-card";
import { CHART_SLOTS, CHART_SURFACE } from "./palette";

export type ScatterDatum = {
	key: string;
	label: string;
	x: number;
	y: number;
	/** Relative weight, read as the mark's **area** — never its radius. */
	weight?: number;
};

export type ScatterPlotProps = Omit<ChartCardProps, "children"> & {
	data: ScatterDatum[];
	/** Named in the tooltip; the axes themselves stay unlabelled. */
	xLabel: string;
	yLabel: string;
	xFormatter?: (value: number) => string;
	yFormatter?: (value: number) => string;
	xDomain?: [number, number];
	yDomain?: [number, number];
	/** Dashed lines that cut the plot into quadrants — usually the two means. */
	guides?: { x?: number; y?: number };
	/** What the mark's area counts, named in the tooltip. */
	weightLabel?: string;
	color?: string;
	height?: number;
	emptyMessage?: string;
};

const MIN_RADIUS = 4;
const MAX_RADIUS = 13;
const ANIMATION_MS = 420;

/**
 * Two measurements against each other, one mark per subject. The weight rides on
 * the mark's area rather than its radius, or a subject with twice the answers
 * would read as four times the subject.
 */
export function ScatterPlot({
	data,
	xLabel,
	yLabel,
	xFormatter,
	yFormatter,
	xDomain,
	yDomain,
	guides,
	weightLabel,
	color = CHART_SLOTS[1],
	height = 280,
	emptyMessage,
	...card
}: ScatterPlotProps) {
	const scope = `scatter-${useId().replace(/:/g, "")}`;
	const reduced = useReducedMotion();

	if (data.length === 0) {
		return (
			<ChartCard {...card}>
				<InlineEmpty>{emptyMessage}</InlineEmpty>
			</ChartCard>
		);
	}

	const heaviest = Math.max(...data.map(point => point.weight ?? 1), 1);
	const radiusOf = (weight = 1) =>
		MIN_RADIUS + (MAX_RADIUS - MIN_RADIUS) * Math.sqrt(weight / heaviest);

	const format = (value: number, axis: "x" | "y") =>
		axis === "x"
			? (xFormatter?.(value) ?? String(value))
			: (yFormatter?.(value) ?? String(value));

	return (
		<ChartCard {...card}>
			<ChartContainer
				config={{ [scope]: { label: yLabel, color } }}
				className={cn("aspect-auto w-full", CHART_PLOT_CLASS)}
				style={{ height }}
			>
				<ScatterChart margin={{ left: 4, right: 16, top: 12, bottom: 4 }}>
					<CartesianGrid vertical={false} stroke="hsl(var(--border))" />
					<XAxis
						type="number"
						dataKey="x"
						domain={xDomain}
						tickLine={false}
						axisLine={false}
						tickMargin={10}
						tickFormatter={value => format(value as number, "x")}
					/>
					<YAxis
						type="number"
						dataKey="y"
						domain={yDomain}
						tickLine={false}
						axisLine={false}
						width={44}
						tickFormatter={value => format(value as number, "y")}
					/>
					{guides?.x != null && (
						<ReferenceLine
							x={guides.x}
							stroke="hsl(var(--border))"
							strokeDasharray="4 6"
						/>
					)}
					{guides?.y != null && (
						<ReferenceLine
							y={guides.y}
							stroke="hsl(var(--border))"
							strokeDasharray="4 6"
						/>
					)}
					<Scatter
						data={data}
						isAnimationActive={!reduced}
						animationDuration={ANIMATION_MS}
						shape={(props: { cx?: number; cy?: number; payload?: ScatterDatum }) => (
							<circle
								cx={props.cx}
								cy={props.cy}
								r={radiusOf(props.payload?.weight)}
								fill={color}
								fillOpacity={0.75}
								stroke={CHART_SURFACE}
								strokeWidth={1.5}
							/>
						)}
					/>
					<ChartTooltip
						cursor={{ strokeDasharray: "4 6", stroke: "hsl(var(--border))" }}
						content={({ active, payload }) => {
							const point = payload?.[0]?.payload as ScatterDatum | undefined;
							if (!active || !point) return null;
							return (
								<div className="border-border/50 bg-background grid min-w-[9rem] gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl">
									<p className="text-foreground font-medium">{point.label}</p>
									<dl className="grid gap-1">
										<TooltipRow label={yLabel} value={format(point.y, "y")} />
										<TooltipRow label={xLabel} value={format(point.x, "x")} />
										{weightLabel && point.weight != null && (
											<TooltipRow label={weightLabel} value={String(point.weight)} />
										)}
									</dl>
								</div>
							);
						}}
					/>
				</ScatterChart>
			</ChartContainer>
		</ChartCard>
	);
}

function TooltipRow({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex items-center justify-between gap-3">
			<dt className="text-muted-foreground">{label}</dt>
			<dd className="text-foreground font-medium tabular-nums">{value}</dd>
		</div>
	);
}
