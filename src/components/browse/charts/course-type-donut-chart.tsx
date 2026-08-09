import { DonutChart } from "@/components/charts";

// Match the COURSE_TYPE_CONFIG badge palette used across the app, so a course
// type keeps the same colour in a badge and in the ring.
const TYPE_COLORS: Record<string, string> = {
	BACHELOR: "var(--color-chart-2)",
	MASTER: "var(--color-chart-3)",
	SINGLE_CYCLE: "var(--color-chart-4)",
};

export type CourseTypeDatum = { type: string; label: string; count: number };

export function CourseTypeDonutChart({ data }: { data: CourseTypeDatum[] }) {
	return (
		<DonutChart
			title="Corsi per tipo"
			unitLabel="corsi"
			data={data.map(entry => ({
				key: entry.type,
				label: entry.label,
				value: entry.count,
				color: TYPE_COLORS[entry.type],
			}))}
		/>
	);
}
