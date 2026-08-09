import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from "recharts";

import {
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";

import { ChartCard, type ChartCardProps, ChartEmpty } from "./chart-card";
import { CHART_SURFACE, type ChartSeries, seriesConfig } from "./palette";

export type ComparisonChartProps<TDatum> = Omit<ChartCardProps, "children"> & {
	data: TDatum[];
	/** The category axis — a section, a department, a difficulty. */
	categoryKey: Extract<keyof TDatum, string>;
	series: ChartSeries<TDatum>[];
	orientation?: "vertical" | "horizontal";
	stacked?: boolean;
	height?: number;
	/** Per-bar colour, for a single series whose colour carries meaning. */
	barColor?: (datum: TDatum) => string;
	/** Prints the value at the end of each bar. Only for a single series. */
	showValues?: boolean;
	categoryWidth?: number;
	valueFormatter?: (value: number) => string;
	emptyMessage?: string;
};

/**
 * Magnitude across categories. `horizontal` lays the bars left-to-right, which is
 * what long category names need; `vertical` is the default column chart.
 */
export function ComparisonChart<TDatum>({
	data,
	categoryKey,
	series,
	orientation = "vertical",
	stacked = false,
	height = 280,
	barColor,
	showValues = false,
	categoryWidth = 130,
	valueFormatter,
	emptyMessage,
	...card
}: ComparisonChartProps<TDatum>) {
	const config = seriesConfig(series);
	const showLegend = series.length > 1;
	const isHorizontal = orientation === "horizontal";

	const categoryAxis = (
		<XAxis
			key="category"
			type={isHorizontal ? "number" : "category"}
			dataKey={isHorizontal ? undefined : categoryKey}
			tickLine={false}
			axisLine={false}
			tickMargin={8}
			tickFormatter={isHorizontal ? valueFormatter : undefined}
		/>
	);

	const valueAxis = (
		<YAxis
			key="value"
			type={isHorizontal ? "category" : "number"}
			dataKey={isHorizontal ? categoryKey : undefined}
			tickLine={false}
			axisLine={false}
			width={isHorizontal ? categoryWidth : 40}
			tickFormatter={isHorizontal ? undefined : valueFormatter}
		/>
	);

	const body =
		data.length === 0 ? (
			<ChartEmpty message={emptyMessage} />
		) : (
			<ChartContainer config={config} className="aspect-auto w-full" style={{ height }}>
				<BarChart
					data={data}
					layout={isHorizontal ? "vertical" : "horizontal"}
					margin={{ left: 4, right: showValues ? 32 : 8, top: 8 }}
				>
					<CartesianGrid
						vertical={isHorizontal}
						horizontal={!isHorizontal}
						strokeDasharray="3 3"
					/>
					{categoryAxis}
					{valueAxis}
					<ChartTooltip
						cursor={false}
						content={
							<ChartTooltipContent
								formatter={
									valueFormatter ? value => valueFormatter(value as number) : undefined
								}
							/>
						}
					/>
					{series.map((item, index) => (
						<Bar
							key={item.key}
							dataKey={item.key}
							stackId={stacked ? "stack" : undefined}
							fill={`var(--color-${item.key})`}
							// 4px rounded end on the data side only; the baseline stays square.
							radius={isHorizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}
							maxBarSize={40}
							stroke={stacked ? CHART_SURFACE : undefined}
							strokeWidth={stacked ? 2 : undefined}
						>
							{barColor &&
								series.length === 1 &&
								data.map((datum, i) => <Cell key={i} fill={barColor(datum)} />)}
							{showValues && index === 0 && (
								<LabelList
									dataKey={item.key}
									position={isHorizontal ? "right" : "top"}
									className="fill-muted-foreground"
									fontSize={12}
									formatter={
										valueFormatter
											? (value: unknown) => valueFormatter(Number(value))
											: undefined
									}
								/>
							)}
						</Bar>
					))}
					{showLegend && <ChartLegend content={<ChartLegendContent />} />}
				</BarChart>
			</ChartContainer>
		);

	return <ChartCard {...card}>{body}</ChartCard>;
}
