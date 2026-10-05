import { type ReactNode, useMemo } from "react";

import { PieChart2Icon } from "@solar-icons/react/linear/pie-chart-2";

import { DonutChart, type DonutChartProps } from "@/components/charts";
import { IconTile } from "@/components/ui/icon-tile";
import { buildGradeDistribution, medianScore } from "@/lib/user/grade-distribution";
import { formatGradeOutOf33 } from "@/lib/utils/grading";

/** The grades by band, with the median in the middle. */
export function GradeDistribution({
	scores,
	actions,
	variant,
}: {
	scores: number[];
	actions?: ReactNode;
	variant?: DonutChartProps["variant"];
}) {
	const slices = useMemo(() => buildGradeDistribution(scores), [scores]);
	const median = medianScore(scores);

	return (
		<DonutChart
			title="Distribuzione dei voti"
			description="Sulle bande del voto"
			actions={actions}
			texture="tr"
			variant={variant}
			data={slices.map(slice => ({
				key: slice.key,
				label: slice.label,
				value: slice.count,
				color: slice.chart,
			}))}
			unitLabel="voti"
			size={248}
			header={
				<div className="flex items-center gap-3">
					<IconTile variant="soft" size="sm" className="text-chart-4-ink">
						<PieChart2Icon />
					</IconTile>
					<div className="min-w-0">
						<p className="text-muted-foreground text-sm">Voti registrati</p>
						<p className="text-xl font-bold tabular-nums">{scores.length}</p>
					</div>
				</div>
			}
			center={
				median === null
					? undefined
					: { value: formatGradeOutOf33(median), caption: "mediana" }
			}
			emptyMessage="Nessun quiz completato in questo periodo."
		/>
	);
}
