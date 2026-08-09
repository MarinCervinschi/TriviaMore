import type { ChartConfig } from "@/components/ui/chart";

/**
 * The categorical slots, in the order they were validated. Assign them in this
 * order and never cycle: slot order is what keeps adjacent series apart under
 * colour-vision deficiency. Past the fifth series, fold the tail into a single
 * "Altro" bucket rather than inventing a sixth hue.
 */
export const CHART_SLOTS = [
	"var(--color-chart-1)",
	"var(--color-chart-2)",
	"var(--color-chart-3)",
	"var(--color-chart-4)",
	"var(--color-chart-5)",
] as const;

export const CHART_SLOT_COUNT = CHART_SLOTS.length;

/** The neutral used for a folded "Altro" bucket and for de-emphasised marks. */
export const CHART_NEUTRAL = "var(--color-muted-foreground)";

/** The surface colour marks are separated against — the 2px gap in a stack. */
export const CHART_SURFACE = "var(--color-card)";

export function chartColor(index: number): string {
	return CHART_SLOTS[index] ?? CHART_NEUTRAL;
}

export type ChartSeries<TDatum> = {
	/** The datum property this series reads. */
	key: Extract<keyof TDatum, string>;
	label: string;
	/** Defaults to the next categorical slot. Set it only for a semantic series. */
	color?: string;
};

/** Builds the `ChartConfig` the shared wrapper needs, assigning slots in order. */
export function seriesConfig<TDatum>(series: ChartSeries<TDatum>[]): ChartConfig {
	return series.reduce<ChartConfig>((config, item, index) => {
		config[item.key] = { label: item.label, color: item.color ?? chartColor(index) };
		return config;
	}, {});
}
