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

import { ChartCard, type ChartCardProps, ChartEmpty } from "./chart-card";
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
	const gradientId = useId().replace(/:/g, "");
	const config = seriesConfig(series);
	const showLegend = series.length > 1;

	const axes = [
		<CartesianGrid key="grid" vertical={false} strokeDasharray="3 3" />,
		<XAxis
			key="x"
			dataKey={xKey}
			tickLine={false}
			axisLine={false}
			tickMargin={8}
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

	const body =
		data.length === 0 ? (
			<ChartEmpty message={emptyMessage} />
		) : (
			<ChartContainer config={config} className="aspect-auto w-full" style={{ height }}>
				{variant === "area" ? (
					<AreaChart data={data} margin={{ left: 4, right: 8, top: 8 }}>
						<defs>
							{series.map(item => (
								<linearGradient
									key={item.key}
									id={`${gradientId}-${item.key}`}
									x1="0"
									y1="0"
									x2="0"
									y2="1"
								>
									<stop
										offset="0%"
										stopColor={`var(--color-${item.key})`}
										stopOpacity={0.28}
									/>
									<stop
										offset="100%"
										stopColor={`var(--color-${item.key})`}
										stopOpacity={0.02}
									/>
								</linearGradient>
							))}
						</defs>
						{axes}
						{series.map(item => (
							<Area
								key={item.key}
								type="monotone"
								dataKey={item.key}
								stackId={stacked ? "stack" : undefined}
								// Stacked bands are separated by the surface, so the boundary
								// reads as a gap instead of one colour meeting another.
								stroke={stacked ? CHART_SURFACE : `var(--color-${item.key})`}
								strokeWidth={2}
								fill={
									stacked
										? `var(--color-${item.key})`
										: `url(#${gradientId}-${item.key})`
								}
								fillOpacity={stacked ? 0.85 : 1}
								dot={false}
								activeDot={activeDot}
							/>
						))}
					</AreaChart>
				) : (
					<LineChart data={data} margin={{ left: 4, right: 8, top: 8 }}>
						{axes}
						{series.map(item => (
							<Line
								key={item.key}
								type="monotone"
								dataKey={item.key}
								stroke={`var(--color-${item.key})`}
								strokeWidth={2}
								dot={false}
								activeDot={activeDot}
							/>
						))}
					</LineChart>
				)}
			</ChartContainer>
		);

	return <ChartCard {...card}>{body}</ChartCard>;
}
