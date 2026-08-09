import { PolarAngleAxis, RadialBar, RadialBarChart } from "recharts";

import { type ChartConfig, ChartContainer } from "@/components/ui/chart";
import { cn } from "@/lib/utils";

import { chartColor } from "./palette";

const config = { value: { label: "Valore" } } satisfies ChartConfig;

export type RadialGaugeProps = {
	value: number;
	max?: number;
	/** The big number in the middle. Defaults to `value` of `max`. */
	label?: string;
	caption?: string;
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
	color = chartColor(0),
	size = 96,
	className,
}: RadialGaugeProps) {
	const clamped = Math.max(0, Math.min(value, max));
	const data = [{ name: "value", value: clamped, fill: color }];

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
				{caption && (
					<span className="text-muted-foreground text-[10px]">{caption}</span>
				)}
			</div>
		</div>
	);
}
