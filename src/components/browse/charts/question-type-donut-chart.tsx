import { Label, Pie, PieChart } from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

type QuestionTypeChartData = { type: string; label: string; count: number }

// Match the Quiz/Flashcard badges used elsewhere: blue for quiz, violet for flashcard.
const TYPE_COLORS: Record<string, string> = {
  QUIZ: "var(--color-chart-2)",
  FLASHCARD: "var(--color-chart-3)",
}

export function QuestionTypeDonutChart({
  data,
}: {
  data: QuestionTypeChartData[]
}) {
  if (data.length === 0) return null

  const config: ChartConfig = data.reduce<ChartConfig>((acc, entry) => {
    acc[entry.type] = {
      label: entry.label,
      color: TYPE_COLORS[entry.type] ?? "var(--color-chart-5)",
    }
    return acc
  }, {})

  const chartData = data.map((entry) => ({
    ...entry,
    fill: `var(--color-${entry.type})`,
  }))

  const total = data.reduce((sum, d) => sum + d.count, 0)

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-1">
        <CardTitle className="text-base">Domande per tipo</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-center gap-4 pb-6">
        <ChartContainer
          config={config}
          className="mx-auto aspect-square w-full max-w-[220px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value, _name, item) => {
                    const type = item.payload?.type
                    const label = (type && config[type]?.label) ?? ""
                    return (
                      <div className="flex w-full items-center justify-between gap-3">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="font-mono font-semibold tabular-nums">
                          {(value as number).toLocaleString("it-IT")}
                        </span>
                      </div>
                    )
                  }}
                />
              }
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="type"
              innerRadius={62}
              strokeWidth={3}
              paddingAngle={2}
            >
              <Label
                content={({ viewBox }) => {
                  if (!viewBox || !("cx" in viewBox)) return null
                  return (
                    <text
                      x={viewBox.cx}
                      y={viewBox.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan
                        x={viewBox.cx}
                        y={viewBox.cy}
                        className="fill-foreground text-2xl font-bold"
                      >
                        {total.toLocaleString("it-IT")}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy ?? 0) + 22}
                        className="fill-muted-foreground text-xs"
                      >
                        domande
                      </tspan>
                    </text>
                  )
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
        <ul className="grid grid-cols-1 gap-1.5 text-xs">
          {chartData.map((entry) => (
            <li
              key={entry.type}
              className="flex items-center justify-between gap-2"
            >
              <span className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: `var(--color-${entry.type})` }}
                />
                <span className="truncate">{entry.label}</span>
              </span>
              <span className="font-mono font-semibold tabular-nums text-foreground">
                {entry.count.toLocaleString("it-IT")}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
