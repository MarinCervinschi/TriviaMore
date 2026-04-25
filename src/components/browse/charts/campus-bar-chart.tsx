import {
  PolarAngleAxis,
  PolarGrid,
  RadialBar,
  RadialBarChart,
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

type CampusChartData = { campus: string; label: string; count: number }

// Skip chart-1 (brand orange used for the primary single-series chart) so each
// campus has its own distinct hue without clashing with the dept bar.
const COLOR_VARS = [
  "var(--color-chart-2)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "var(--color-chart-3)",
]

export function CampusBarChart({ data }: { data: CampusChartData[] }) {
  if (data.length === 0) return null

  const sorted = [...data].sort((a, b) => b.count - a.count)
  const max = sorted[0]?.count ?? 1

  const config: ChartConfig = sorted.reduce<ChartConfig>(
    (acc, entry, idx) => {
      acc[entry.campus] = {
        label: entry.label,
        color: COLOR_VARS[idx % COLOR_VARS.length],
      }
      return acc
    },
    {},
  )

  const chartData = sorted.map((entry) => ({
    ...entry,
    fill: `var(--color-${entry.campus})`,
  }))

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Corsi per campus</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-center gap-4 pb-6">
        <ChartContainer
          config={config}
          className="mx-auto aspect-square w-full max-w-[220px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={90}
            endAngle={-270}
            innerRadius="32%"
            outerRadius="100%"
            barSize={12}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="hsl(var(--border))"
              strokeOpacity={0.5}
            />
            <PolarAngleAxis
              type="number"
              domain={[0, Math.max(max, 1)]}
              tick={false}
            />
            <RadialBar
              dataKey="count"
              background={{ fill: "hsl(var(--muted))", fillOpacity: 0.4 }}
              cornerRadius={6}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value, _name, item) => {
                    const campus = item.payload?.campus
                    const label =
                      (campus && config[campus]?.label) ?? item.payload?.label
                    return (
                      <div className="flex w-full items-center justify-between gap-3">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="font-mono font-semibold tabular-nums">
                          {(value as number).toLocaleString("it-IT")} corsi
                        </span>
                      </div>
                    )
                  }}
                />
              }
            />
          </RadialBarChart>
        </ChartContainer>
        <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
          {chartData.map((entry) => (
            <li
              key={entry.campus}
              className="flex items-center justify-between gap-2"
            >
              <span className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: `var(--color-${entry.campus})` }}
                />
                <span className="truncate">{entry.label}</span>
              </span>
              <span className="font-mono font-semibold tabular-nums text-foreground">
                {entry.count}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
