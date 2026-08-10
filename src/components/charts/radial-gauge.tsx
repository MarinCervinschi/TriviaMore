import { useId } from "react";

import { PolarAngleAxis, RadialBar, RadialBarChart } from "recharts";

import { type ChartConfig, ChartContainer } from "@/components/ui/chart";
import { cn } from "@/lib/utils";

import { ChartDefs, seriesFill } from "./chart-defs";

const config = { value: { label: "Valore" } } satisfies ChartConfig;

export type RadialGaugeProps = {
	value: number;
	max?: number;
	/** The big number in the middle. Defaults to `value` of `max`. */
	label?: string;
	caption?: string;
	/** A semantic colour. Left unset, the ring uses the brand ramp. */
	color?: string;
	size?: number;
	className?: string;
};

/**
 * One value against its maximum. A gauge earns its place only when the maximum
 * is meaningful — for a bare count, a stat tile reads faster than a ring.
 */
export function RadialGauge({
	value,
	max = 100,
	label,
	caption,
	color,
	size = 96,
	className,
}: RadialGaugeProps) {
	const scope = `gauge-${useId().replace(/:/g, "")}`;
	const clamped = Math.max(0, Math.min(value, max));
	// No explicit colour means the brand ring, the same ramp as the quiz bar.
	const slice = { key: "value", color };
	const data = [{ name: "value", value: clamped, fill: seriesFill(scope, slice) }];

	return (
		<div
			className={cn("relative shrink-0", className)}
			style={{ width: size, height: size }}
		>
			<ChartContainer config={config} className="aspect-auto h-full w-full">
				<RadialBarChart
					data={data}
					cx="50%"
					cy="50%"
					innerRadius="70%"
					outerRadius="100%"
					startAngle={90}
					endAngle={-270}
				>
					<ChartDefs scope={scope} series={[slice]} brandFirst />
					<PolarAngleAxis type="number" domain={[0, max]} tick={false} />
					<RadialBar
						dataKey="value"
						cornerRadius={10}
						background={{ fill: "hsl(var(--muted))" }}
					/>
				</RadialBarChart>
			</ChartContainer>
			<div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
				<span className="text-foreground text-sm font-bold tabular-nums">
					{label ?? `${Math.round(clamped)}`}
				</span>
				{caption && <span className="text-muted-foreground text-2xs">{caption}</span>}
			</div>
		</div>
	);
}
