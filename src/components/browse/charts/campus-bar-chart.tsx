import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const tooltipStyle = {
  borderRadius: "12px",
  border: "1px solid hsl(var(--border))",
  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  backgroundColor: "hsl(var(--card))",
  color: "hsl(var(--foreground))",
}

const CAMPUS_COLORS: Record<string, string> = {
  MODENA: "#f59e0b",
  REGGIO_EMILIA: "#06b6d4",
  CARPI: "#ec4899",
  MANTOVA: "#84cc16",
}

type CampusChartData = { campus: string; label: string; count: number }

export function CampusBarChart({ data }: { data: CampusChartData[] }) {
  if (data.length === 0) return null

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Corsi per campus</CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ left: 0, right: 16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis
              dataKey="label"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
            <RechartsTooltip
              contentStyle={tooltipStyle}
              formatter={(value) => [`${value} corsi`, ""]}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {data.map((entry) => (
                <Cell key={entry.campus} fill={CAMPUS_COLORS[entry.campus] ?? "hsl(var(--primary))"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
