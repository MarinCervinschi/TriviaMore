/**
 * The sequential ramp, palest to deepest. One hue with monotone lightness: it
 * encodes magnitude, never identity — a heatmap must never borrow the
 * categorical slots.
 */
export const HEAT_STEPS = [
	"var(--color-heat-1)",
	"var(--color-heat-2)",
	"var(--color-heat-3)",
	"var(--color-heat-4)",
	"var(--color-heat-5)",
] as const;

/** The cell that holds no data at all — absent, not "zero of the scale". */
export const HEAT_EMPTY = "var(--color-muted)";

/**
 * Buckets a value onto the ramp. `max` is the top of the scale; anything at or
 * above it lands on the deepest step. A value of exactly 0 is treated as absent.
 */
export function heatColor(value: number, max: number): string {
	if (value <= 0) return HEAT_EMPTY;
	if (max <= 0) return HEAT_STEPS[0];
	const index = Math.ceil((Math.min(value, max) / max) * HEAT_STEPS.length) - 1;
	return HEAT_STEPS[Math.max(0, Math.min(index, HEAT_STEPS.length - 1))];
}

/** The legend strip every heatmap shows, so the ramp is readable without hover. */
export const HEAT_LEGEND = HEAT_STEPS;
