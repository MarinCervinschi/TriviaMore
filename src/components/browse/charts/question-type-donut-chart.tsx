import { DonutChart } from "@/components/charts";

// Match the Quiz/Flashcard badges used elsewhere.
const TYPE_COLORS: Record<string, string> = {
	QUIZ: "var(--color-chart-2)",
	FLASHCARD: "var(--color-chart-3)",
};

export type QuestionTypeDatum = { type: string; label: string; count: number };

export function QuestionTypeDonutChart({ data }: { data: QuestionTypeDatum[] }) {
	return (
		<DonutChart
			title="Domande per tipo"
			unitLabel="domande"
			data={data.map(entry => ({
				key: entry.type,
				label: entry.label,
				value: entry.count,
				color: TYPE_COLORS[entry.type],
			}))}
		/>
	);
}
