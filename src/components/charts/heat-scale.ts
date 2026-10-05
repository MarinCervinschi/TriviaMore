export const HEAT_STEPS = [
	"var(--color-heat-1)",
	"var(--color-heat-2)",
	"var(--color-heat-3)",
	"var(--color-heat-4)",
	"var(--color-heat-5)",
] as const;

export const HEAT_EMPTY = "var(--color-muted)";

/** A value of 0 gets `HEAT_EMPTY`; a value at or above `max` gets the deepest step. */
export function heatColor(value: number, max: number): string {
	if (value <= 0) return HEAT_EMPTY;
	if (max <= 0) return HEAT_STEPS[0];
	const index = Math.ceil((Math.min(value, max) / max) * HEAT_STEPS.length) - 1;
	return HEAT_STEPS[Math.max(0, Math.min(index, HEAT_STEPS.length - 1))];
}

export const HEAT_LEGEND = HEAT_STEPS;
