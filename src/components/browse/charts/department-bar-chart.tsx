import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

type DepartmentChartData = { name: string; code: string; count: number }

const config: ChartConfig = {
  count: {
    label: "Corsi",
    // Use the exact app primary brand orange used in CTAs/buttons.
    color: "hsl(var(--primary))",
  },
}

export function DepartmentBarChart({ data }: { data: DepartmentChartData[] }) {
  if (data.length === 0) return null

  // Sort ascending so the highest is at the top of the chart (recharts vertical layout reads bottom-up).
  const sorted = [...data].sort((a, b) => a.count - b.count)

  // Intrinsic height: each bar gets a constant slot so the chart never overflows
  // its container.
  const rowHeight = 28
  const chartHeight = sorted.length * rowHeight + 16

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-1">
        <CardTitle className="text-base">Corsi per dipartimento</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 pb-4">
        <ChartContainer
          config={config}
          className="aspect-auto w-full"
          style={{ height: chartHeight }}
        >
          <BarChart
            accessibilityLayer
            data={sorted}
            layout="vertical"
            margin={{ left: 8, right: 32, top: 4, bottom: 4 }}
          >
            <CartesianGrid
              horizontal={false}
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              strokeOpacity={0.5}
            />
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="code"
              width={64}
              tickLine={false}
              axisLine={false}
              tick={{
                fill: "hsl(var(--muted-foreground))",
                fontSize: 11,
                fontFamily: "ui-monospace, monospace",
              }}
            />
            <ChartTooltip
              cursor={{ fill: "hsl(var(--muted))", fillOpacity: 0.4 }}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value, _name, item) => {
                    const code = item.payload?.code
                    const dept =
                      sorted.find((d) => d.code === code)?.name ?? code
                    return (
                      <div className="flex w-full flex-col gap-0.5">
                        <span className="text-foreground font-medium">
                          {dept}
                        </span>
                        <span className="font-mono text-xs text-muted-foreground">
                          {(value as number).toLocaleString("it-IT")} corsi
                        </span>
                      </div>
                    )
                  }}
                />
              }
            />
            <Bar
              dataKey="count"
              fill="var(--color-count)"
              radius={[0, 6, 6, 0]}
            >
              <LabelList
                dataKey="count"
                position="right"
                offset={8}
                className="fill-foreground"
                fontSize={11}
                fontFamily="ui-monospace, monospace"
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
