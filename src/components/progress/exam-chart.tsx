import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import type { ExamChartItem } from "@/hooks/useProgressData";
import { formatThirtyScaleGrade } from "@/lib/utils/grading";

const config = {
	averageScore: { label: "Media", color: "var(--color-chart-1)" },
} satisfies ChartConfig;

export function ExamChart({ data }: { data: ExamChartItem[] }) {
	if (data.length === 0) return null;

	return (
		<div className="bg-card overflow-hidden rounded-2xl border">
			<div className="p-6">
				<h3 className="text-lg font-bold">Performance esami</h3>
				<p className="text-muted-foreground text-sm">
					Risultati delle simulazioni d'esame per corso
				</p>
			</div>
			<div className="px-2 pb-6 sm:px-6">
				<ChartContainer config={config} className="aspect-auto h-[300px] w-full">
					<AreaChart data={data}>
						<defs>
							<linearGradient id="examAreaGrad" x1="0" y1="0" x2="0" y2="1">
								<stop
									offset="0%"
									stopColor="var(--color-averageScore)"
									stopOpacity={0.3}
								/>
								<stop
									offset="100%"
									stopColor="var(--color-averageScore)"
									stopOpacity={0.02}
								/>
							</linearGradient>
						</defs>
						<CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
						<XAxis
							dataKey="courseName"
							fontSize={12}
							className="fill-muted-foreground"
							tickLine={false}
						/>
						<YAxis
							domain={[0, 33]}
							fontSize={12}
							className="fill-muted-foreground"
							tickLine={false}
						/>
						<ChartTooltip
							content={
								<ChartTooltipContent
									formatter={value => (
										<span className="font-mono font-semibold tabular-nums">
											{formatThirtyScaleGrade(value as number)}
										</span>
									)}
								/>
							}
						/>
						<Area
							type="monotone"
							dataKey="averageScore"
							stroke="var(--color-averageScore)"
							strokeWidth={2}
							fill="url(#examAreaGrad)"
							dot={{
								r: 5,
								fill: "var(--color-averageScore)",
								strokeWidth: 2,
								stroke: "hsl(var(--card))",
							}}
							activeDot={{ r: 7 }}
						/>
					</AreaChart>
				</ChartContainer>
			</div>
		</div>
	);
}
