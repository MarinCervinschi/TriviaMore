import { DonutChart, type DonutDatum } from "./donut-chart"

// Match the Quiz/Flashcard badges used elsewhere: blue for quiz, violet for flashcard.
const TYPE_COLORS: Record<string, string> = {
  QUIZ: "var(--color-chart-2)",
  FLASHCARD: "var(--color-chart-3)",
}

export function QuestionTypeDonutChart({ data }: { data: DonutDatum[] }) {
  return (
    <DonutChart
      title="Domande per tipo"
      unitLabel="domande"
      colors={TYPE_COLORS}
      data={data}
    />
  )
}
