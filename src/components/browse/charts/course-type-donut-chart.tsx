import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const tooltipStyle = {
  borderRadius: "12px",
  border: "1px solid hsl(var(--border))",
  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  backgroundColor: "hsl(var(--card))",
  color: "hsl(var(--foreground))",
}

const TYPE_COLORS: Record<string, string> = {
  BACHELOR: "#3b82f6",
  MASTER: "#8b5cf6",
  SINGLE_CYCLE: "#10b981",
}

type CourseTypeChartData = { type: string; label: string; count: number }

export function CourseTypeDonutChart({ data }: { data: CourseTypeChartData[] }) {
  if (data.length === 0) return null

  const total = data.reduce((sum, d) => sum + d.count, 0)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Tipologia corsi</CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="count"
              nameKey="label"
              stroke="none"
            >
              {data.map((entry) => (
                <Cell key={entry.type} fill={TYPE_COLORS[entry.type] ?? "hsl(var(--muted))"} />
              ))}
            </Pie>
            <RechartsTooltip
              contentStyle={tooltipStyle}
              formatter={(value, name) => [`${value} corsi`, name]}
            />
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}
            />
            {/* Center label */}
            <text
              x="50%"
              y="42%"
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-foreground text-2xl font-bold"
            >
              {total}
            </text>
            <text
              x="50%"
              y="52%"
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-muted-foreground text-xs"
            >
              corsi
            </text>
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
