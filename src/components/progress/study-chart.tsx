import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts"

import { formatThirtyScaleGrade } from "@/lib/utils/grading"
import type { StudyChartItem } from "@/hooks/useProgressData"

const tooltipStyle = {
  borderRadius: "12px",
  border: "1px solid hsl(var(--border))",
  boxShadow:
    "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  backgroundColor: "hsl(var(--card))",
  color: "hsl(var(--foreground))",
}

function getBarColor(score: number): string {
  if (score >= 27) return "#22c55e"
  if (score >= 18) return "#d14124"
  return "#ef4444"
}

export function StudyChart({ data }: { data: StudyChartItem[] }) {
  if (data.length === 0) return null

  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <div className="p-6">
        <h3 className="text-lg font-bold">Performance Studio</h3>
        <p className="text-sm text-muted-foreground">
          Media e miglior voto per sezione (in 33esimi)
        </p>
      </div>
      <div className="px-2 pb-6 sm:px-6">
        <ResponsiveContainer
          width="100%"
          height={Math.max(data.length * 48, 200)}
        >
          <BarChart
            data={data}
            layout="vertical"
            margin={{ left: 10, right: 20 }}
          >
            <defs>
              <linearGradient
                id="studyGradient"
                x1="0"
                y1="0"
                x2="1"
                y2="0"
              >
                <stop offset="0%" stopColor="#d14124" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#f56565" stopOpacity={0.9} />
              </linearGradient>
            </defs>
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
            <RechartsTooltip
              contentStyle={tooltipStyle}
              formatter={(value, name) => [
                formatThirtyScaleGrade(value as number),
                name === "averageScore" ? "Media" : "Migliore",
              ]}
              labelFormatter={(_label, payload) => {
                const items = payload as unknown as ReadonlyArray<{ payload?: { fullName?: string } }>
                const item = items?.[0]?.payload
                return item?.fullName ?? _label
              }}
            />
            <Bar
              dataKey="averageScore"
              name="averageScore"
              radius={[0, 6, 6, 0]}
              barSize={20}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={getBarColor(entry.averageScore)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
