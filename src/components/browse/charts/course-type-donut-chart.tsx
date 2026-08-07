import { DonutChart, type DonutDatum } from "./donut-chart";

// Match the existing COURSE_TYPE_CONFIG badge palette across the app:
// triennale = blue, magistrale = violet, ciclo unico = emerald.
const TYPE_COLORS: Record<string, string> = {
	BACHELOR: "var(--color-chart-2)",
	MASTER: "var(--color-chart-3)",
	SINGLE_CYCLE: "var(--color-chart-4)",
};

export function CourseTypeDonutChart({ data }: { data: DonutDatum[] }) {
	return (
		<DonutChart
			title="Corsi per tipo"
			unitLabel="corsi"
			colors={TYPE_COLORS}
			data={data}
		/>
	);
}
