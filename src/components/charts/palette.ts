import type { ChartConfig } from "@/components/ui/chart";

import type { ChartFill } from "./chart-defs";

/** Assign in this order and never cycle; past five series, fold the tail into one bucket. */
export const CHART_SLOTS = [
	"var(--color-chart-1)",
	"var(--color-chart-2)",
	"var(--color-chart-3)",
	"var(--color-chart-4)",
	"var(--color-chart-5)",
] as const;

export const CHART_SLOT_COUNT = CHART_SLOTS.length;

export const CHART_NEUTRAL = "var(--color-muted-foreground)";

export const CHART_SURFACE = "var(--color-card)";

export function chartColor(index: number): string {
	return CHART_SLOTS[index] ?? CHART_NEUTRAL;
}

export type ChartSeries<TDatum> = {
	key: Extract<keyof TDatum, string>;
	label: string;
	color?: string;
	fill?: ChartFill;
};

export function seriesConfig<TDatum>(series: ChartSeries<TDatum>[]): ChartConfig {
	return series.reduce<ChartConfig>((config, item, index) => {
		config[item.key] = { label: item.label, color: item.color ?? chartColor(index) };
		return config;
	}, {});
}
