import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const tooltipStyle = {
  borderRadius: "12px",
  border: "1px solid hsl(var(--border))",
  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  backgroundColor: "hsl(var(--card))",
  color: "hsl(var(--foreground))",
}

type DepartmentChartData = { name: string; code: string; count: number }

export function DepartmentBarChart({ data }: { data: DepartmentChartData[] }) {
  if (data.length === 0) return null

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Corsi per dipartimento</CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <ResponsiveContainer width="100%" height={Math.max(data.length * 36, 200)}>
          <BarChart data={data} layout="vertical" margin={{ left: 0, right: 16 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
            <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
            <YAxis
              type="category"
              dataKey="code"
              width={56}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            />
            <RechartsTooltip
              contentStyle={tooltipStyle}
              formatter={(value) => [`${value} corsi`, ""]}
              labelFormatter={(code) => {
                const dept = data.find((d) => d.code === String(code))
                return dept?.name ?? String(code)
              }}
            />
            <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
