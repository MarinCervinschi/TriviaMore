import { Clock, Target, Trophy } from "lucide-react"
import {
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
} from "recharts"

import { StatCard } from "@/components/shared/stat-card"
import {
  formatThirtyScaleGrade,
  getGradeColor,
  getGradeDescription,
} from "@/lib/utils/grading"
import { formatTimeSpent } from "@/lib/utils/quiz-results"
import type { OverallStats, RadialDataItem } from "@/hooks/useProgressData"

export function ProgressStats({
  overallStats,
  totalTime,
  radialData,
}: {
  overallStats: OverallStats
  totalTime: number
  radialData: RadialDataItem[]
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
      <StatCard
        label="Quiz Studio"
        value={overallStats.totalStudyQuizzes}
        icon={Target}
        color="blue"
      />
      <StatCard
        label="Quiz Esame"
        value={overallStats.totalExamQuizzes}
        icon={Trophy}
        color="yellow"
      />
      <StatCard
        label="Tempo Totale"
        value={formatTimeSpent(totalTime)}
        icon={Clock}
        color="purple"
      />

      {/* Average score card with radial gauge */}
      <div className="col-span-2 group relative overflow-hidden rounded-2xl border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        <div className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full bg-primary/10 blur-[30px]" />
        <div className="relative flex items-center gap-4">
          <div className="shrink-0">
            <ResponsiveContainer width={96} height={96}>
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
            </ResponsiveContainer>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Media Generale
            </p>
            <p
              className={`text-3xl font-bold ${getGradeColor(radialData[0].score)}`}
            >
              {formatThirtyScaleGrade(radialData[0].score)}
            </p>
            <p className="text-xs text-muted-foreground">
              {getGradeDescription(radialData[0].score)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
