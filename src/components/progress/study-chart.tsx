import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";

import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import type { StudyChartItem } from "@/hooks/useProgressData";
import { formatThirtyScaleGrade, getGradeChartColor } from "@/lib/utils/grading";

const config = {
	averageScore: { label: "Media" },
} satisfies ChartConfig;

export function StudyChart({ data }: { data: StudyChartItem[] }) {
	if (data.length === 0) return null;

	return (
		<div className="bg-card overflow-hidden rounded-2xl border">
			<div className="p-6">
				<h3 className="text-lg font-bold">Performance studio</h3>
				<p className="text-muted-foreground text-sm">
					Media per sezione, in 33esimi. Il colore segue la fascia di voto.
				</p>
			</div>
			<div className="px-2 pb-6 sm:px-6">
				<ChartContainer
					config={config}
					className="aspect-auto w-full"
					style={{ height: Math.max(data.length * 48, 200) }}
				>
					<BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
						<CartesianGrid
							strokeDasharray="3 3"
							horizontal={false}
							className="stroke-border/30"
						/>
						<XAxis
							type="number"
							domain={[0, 33]}
							fontSize={12}
							className="fill-muted-foreground"
							tickLine={false}
						/>
						<YAxis
							type="category"
							dataKey="name"
							width={130}
							fontSize={12}
							className="fill-muted-foreground"
							tickLine={false}
							axisLine={false}
						/>
						<ChartTooltip
							cursor={false}
							content={
								<ChartTooltipContent
									labelKey="fullName"
									formatter={value => (
										<span className="font-mono font-semibold tabular-nums">
											{formatThirtyScaleGrade(value as number)}
										</span>
									)}
								/>
							}
						/>
						<Bar dataKey="averageScore" radius={[0, 6, 6, 0]} barSize={20}>
							{data.map(entry => (
								<Cell key={entry.name} fill={getGradeChartColor(entry.averageScore)} />
							))}
						</Bar>
					</BarChart>
				</ChartContainer>
			</div>
		</div>
	);
}
