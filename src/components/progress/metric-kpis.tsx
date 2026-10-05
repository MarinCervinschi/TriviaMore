import { useMemo } from "react";

import { MetricCard } from "@/components/shared/metric-card";
import {
	type ExplorerMode,
	type ExplorerPeriod,
	buildMetricKpis,
} from "@/lib/user/metric-explorer";
import type { DailyStudyStat } from "@/lib/user/types";

import { FORMAT, METRICS } from "./metric-explorer";

const TINT: Record<string, string> = {
	quizzes: "text-chart-1",
	grade: "text-chart-3",
	accuracy: "text-chart-2",
	time: "text-chart-4",
};

export function MetricKpis({
	daily,
	period = "year",
	mode = "both",
	today,
}: {
	daily: DailyStudyStat[];
	period?: ExplorerPeriod;
	mode?: ExplorerMode;
	today?: Date;
}) {
	const now = useMemo(() => today ?? new Date(), [today]);
	const kpis = useMemo(
		() => buildMetricKpis(daily, period, mode, now),
		[daily, period, mode, now]
	);

	return (
		<div className="@container">
			<div className="grid gap-4 @[340px]:grid-cols-2 @[900px]:grid-cols-4">
				{kpis.map(kpi => {
					const meta = METRICS.find(metric => metric.key === kpi.key)!;
					const format = FORMAT[kpi.key];
					return (
						<MetricCard
							key={kpi.key}
							label={meta.label}
							value={format(kpi.value)}
							icon={meta.icon}
							tint={TINT[kpi.key]}
							delta={kpi.delta}
							comparison={
								kpi.previous > 0
									? `vs ${format(kpi.previous)} nel periodo precedente`
									: undefined
							}
						/>
					);
				})}
			</div>
		</div>
	);
}
