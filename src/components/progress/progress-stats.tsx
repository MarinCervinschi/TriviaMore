import { ClockCircleIcon } from "@solar-icons/react/linear/clock-circle";
import { CupFirstIcon } from "@solar-icons/react/linear/cup-first";
import { TargetIcon } from "@solar-icons/react/linear/target";
import { RadialBar, RadialBarChart } from "recharts";

import { StatCard } from "@/components/shared/stat-card";
import { Card, CardTexture } from "@/components/ui/card";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";
import type { OverallStats, RadialDataItem } from "@/hooks/useProgressData";
import {
	formatThirtyScaleGrade,
	getGradeColor,
	getGradeDescription,
} from "@/lib/utils/grading";
import { formatTimeSpent } from "@/lib/utils/quiz-results";

// The gauge fill comes from the datum, which already carries the grade band.
const gaugeConfig = { value: { label: "Media" } } satisfies ChartConfig;

export function ProgressStats({
	overallStats,
	totalTime,
	radialData,
}: {
	overallStats: OverallStats;
	totalTime: number;
	radialData: RadialDataItem[];
}) {
	return (
		<div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
			<StatCard
				label="Quiz studio"
				value={overallStats.totalStudyQuizzes}
				icon={TargetIcon}
				color="blue"
			/>
			<StatCard
				label="Quiz esame"
				value={overallStats.totalExamQuizzes}
				icon={CupFirstIcon}
				color="yellow"
			/>
			<StatCard
				label="Tempo totale"
				value={formatTimeSpent(totalTime)}
				icon={ClockCircleIcon}
				color="purple"
			/>

			{/* Average score card with radial gauge */}
			<Card className="group relative col-span-2 overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
				<CardTexture placement="tr" />
				<div className="relative flex items-center gap-4">
					<div className="shrink-0">
						<ChartContainer config={gaugeConfig} className="aspect-auto h-24 w-24">
							<RadialBarChart
								cx="50%"
								cy="50%"
								innerRadius="70%"
								outerRadius="100%"
								data={radialData}
								startAngle={90}
								endAngle={-270}
							>
								<RadialBar
									dataKey="value"
									cornerRadius={10}
									background={{ fill: "hsl(var(--muted))" }}
								/>
							</RadialBarChart>
						</ChartContainer>
					</div>
					<div>
						<p className="text-muted-foreground text-sm font-medium">Media generale</p>
						<p className={`text-3xl font-bold ${getGradeColor(radialData[0].score)}`}>
							{formatThirtyScaleGrade(radialData[0].score)}
						</p>
						<p className="text-muted-foreground text-xs">
							{getGradeDescription(radialData[0].score)}
						</p>
					</div>
				</div>
			</Card>
		</div>
	);
}
