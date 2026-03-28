import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts"

import { formatThirtyScaleGrade } from "@/lib/utils/grading"
import type { ExamChartItem } from "@/hooks/useProgressData"

const tooltipStyle = {
  borderRadius: "12px",
  border: "1px solid hsl(var(--border))",
  boxShadow:
    "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  backgroundColor: "hsl(var(--card))",
  color: "hsl(var(--foreground))",
}

export function ExamChart({ data }: { data: ExamChartItem[] }) {
  if (data.length === 0) return null

  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <div className="p-6">
        <h3 className="text-lg font-bold">Performance Esami</h3>
        <p className="text-sm text-muted-foreground">
          Risultati delle simulazioni d'esame per corso
        </p>
      </div>
      <div className="px-2 pb-6 sm:px-6">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient
                id="examAreaGrad"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#d14124" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#d14124" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-border/30"
            />
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
            <RechartsTooltip
              contentStyle={tooltipStyle}
              formatter={(value) => [
                formatThirtyScaleGrade(value as number),
                "Media",
              ]}
            />
            <Area
              type="monotone"
              dataKey="averageScore"
              stroke="#d14124"
              strokeWidth={2}
              fill="url(#examAreaGrad)"
              dot={{ r: 5, fill: "#d14124", strokeWidth: 2, stroke: "hsl(var(--card))" }}
              activeDot={{ r: 7 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
