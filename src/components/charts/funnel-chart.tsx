import { useId } from "react";

import { Funnel, LabelList, FunnelChart as RechartsFunnelChart } from "recharts";

import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { formatNumber } from "@/lib/utils/format";

import { ChartCard, type ChartCardProps, ChartEmpty } from "./chart-card";
import { ChartDefs, seriesFill } from "./chart-defs";
import { chartColor } from "./palette";

export type FunnelStage = {
	key: string;
	label: string;
	value: number;
	color?: string;
};

export type FunnelChartProps = Omit<ChartCardProps, "children" | "footer"> & {
	stages: FunnelStage[];
	height?: number;
	valueFormatter?: (value: number) => string;
	emptyMessage?: string;
};

/**
 * Drop-off through ordered stages. Stages must be genuinely nested — every stage
 * a subset of the one before it — or the shrinking width lies.
 */
export function FunnelChart({
	stages,
	height = 260,
	valueFormatter,
	emptyMessage,
	...card
}: FunnelChartProps) {
	const scope = `funnel-${useId().replace(/:/g, "")}`;
	const config: ChartConfig = stages.reduce<ChartConfig>((acc, stage, index) => {
		acc[stage.key] = { label: stage.label, color: stage.color ?? chartColor(index) };
		return acc;
	}, {});

	const data = stages.map(stage => ({ ...stage, fill: seriesFill(scope, stage) }));
	const first = stages[0]?.value ?? 0;

	const body =
		stages.length === 0 ? (
			<ChartEmpty message={emptyMessage} />
		) : (
			<ChartContainer config={config} className="aspect-auto w-full" style={{ height }}>
				<RechartsFunnelChart margin={{ left: 8, right: 8 }}>
					<ChartDefs scope={scope} series={stages} brandFirst />
					<ChartTooltip
						content={
							<ChartTooltipContent
								hideLabel
								formatter={(value, _name, item) => {
									const stage = item.payload as FunnelStage | undefined;
									const share =
										first > 0 ? Math.round((Number(value) / first) * 100) : 0;
									return (
										<div className="flex w-full items-center justify-between gap-3">
											<span className="text-muted-foreground">{stage?.label}</span>
											<span className="font-semibold tabular-nums">
												{valueFormatter?.(Number(value)) ?? formatNumber(Number(value))}{" "}
												<span className="text-muted-foreground">({share}%)</span>
											</span>
										</div>
									);
								}}
							/>
						}
					/>
					<Funnel
						dataKey="value"
						data={data}
						isAnimationActive
						lastShapeType="rectangle"
					>
						<LabelList
							position="right"
							dataKey="label"
							className="fill-foreground"
							fontSize={12}
						/>
					</Funnel>
				</RechartsFunnelChart>
			</ChartContainer>
		);

	return <ChartCard {...card}>{body}</ChartCard>;
}
