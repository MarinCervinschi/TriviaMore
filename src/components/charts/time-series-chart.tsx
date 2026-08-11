import { useId } from "react";

import {
	Area,
	AreaChart,
	CartesianGrid,
	Line,
	LineChart,
	XAxis,
	YAxis,
} from "recharts";

import {
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { InlineEmpty } from "@/components/ui/empty-state";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

import { CHART_PLOT_CLASS, ChartCard, type ChartCardProps } from "./chart-card";
import { AreaFadeDefs } from "./chart-defs";
import { CHART_SURFACE, type ChartSeries, seriesConfig } from "./palette";

export type TimeSeriesChartProps<TDatum> = Omit<ChartCardProps, "children"> & {
	data: TDatum[];
	/** The category axis — a month, a date, a session number. */
	xKey: Extract<keyof TDatum, string>;
	series: ChartSeries<TDatum>[];
	variant?: "area" | "line";
	stacked?: boolean;
	height?: number;
	yDomain?: [number, number];
	valueFormatter?: (value: number) => string;
	xFormatter?: (value: string) => string;
	emptyMessage?: string;
};

const ANIMATION_MS = 420;

/**
 * Change over time: one line or filled area per series. Never two y-scales — a
 * second measure of a different magnitude belongs in its own chart.
 */
export function TimeSeriesChart<TDatum>({
	data,
	xKey,
	series,
	variant = "area",
	stacked = false,
	height = 280,
	yDomain,
	valueFormatter,
	xFormatter,
	emptyMessage,
	...card
}: TimeSeriesChartProps<TDatum>) {
	const scope = `ts-${useId().replace(/:/g, "")}`;
	const reduced = useReducedMotion();
	const config = seriesConfig(series);
	const showLegend = series.length > 1;

	const axes = [
		// Solid hairlines: a dashed grid reads as a threshold or a projection when
		// it is only chrome.
		<CartesianGrid key="grid" vertical={false} stroke="hsl(var(--border))" />,
		<XAxis
			key="x"
			dataKey={xKey}
			tickLine={false}
			axisLine={false}
			tickMargin={10}
			tickFormatter={xFormatter}
		/>,
		<YAxis
			key="y"
			domain={yDomain}
			tickLine={false}
			axisLine={false}
			width={40}
			tickFormatter={valueFormatter}
		/>,
		<ChartTooltip
			key="tooltip"
			content={
				<ChartTooltipContent
					formatter={
						valueFormatter ? value => valueFormatter(value as number) : undefined
					}
				/>
			}
		/>,
		showLegend ? <ChartLegend key="legend" content={<ChartLegendContent />} /> : null,
	];

	const activeDot = { r: 4, strokeWidth: 2, stroke: CHART_SURFACE };
	const motion = (index: number) => ({
		isAnimationActive: !reduced,
		animationDuration: ANIMATION_MS,
		animationBegin: index * 90,
	});

	const body =
		data.length === 0 ? (
			<InlineEmpty>{emptyMessage}</InlineEmpty>
		) : (
			<ChartContainer
				config={config}
				className={cn("aspect-auto w-full", CHART_PLOT_CLASS)}
				style={{ height }}
			>
				{variant === "area" ? (
					<AreaChart data={data} margin={{ left: 4, right: 8, top: 8 }}>
						<AreaFadeDefs scope={scope} series={series} />
						{axes}
						{series.map((item, index) => (
							<Area
								key={item.key}
								type="monotone"
								dataKey={item.key}
								stackId={stacked ? "stack" : undefined}
								// Stacked bands are separated by the surface, so the boundary
								// reads as a gap instead of one colour meeting another.
								stroke={stacked ? CHART_SURFACE : `var(--color-${item.key})`}
								strokeWidth={2}
								strokeLinecap="round"
								fill={
									stacked
										? `var(--color-${item.key})`
										: `url(#${scope}-fade-${item.key})`
								}
								fillOpacity={stacked ? 0.85 : 1}
								dot={false}
								activeDot={activeDot}
								{...motion(index)}
							/>
						))}
					</AreaChart>
				) : (
					<LineChart data={data} margin={{ left: 4, right: 8, top: 8 }}>
						{axes}
						{series.map((item, index) => (
							<Line
								key={item.key}
								type="monotone"
								dataKey={item.key}
								stroke={`var(--color-${item.key})`}
								strokeWidth={2}
								strokeLinecap="round"
								dot={false}
								activeDot={activeDot}
								{...motion(index)}
							/>
						))}
					</LineChart>
				)}
			</ChartContainer>
		);

	return <ChartCard {...card}>{body}</ChartCard>;
}
