import { useMemo, useState } from "react";

import { CalendarMinimalisticIcon } from "@solar-icons/react/linear/calendar-minimalistic";
import { DownloadIcon } from "@solar-icons/react/linear/download";
import { LayersIcon } from "@solar-icons/react/linear/layers";
import { ShareIcon } from "@solar-icons/react/linear/share";

import { PageToolbar } from "@/components/shared/page-toolbar";
import { type ChipOption, SelectChip } from "@/components/shared/select-chip";
import { Button } from "@/components/ui/button";
import { UserBreadcrumb } from "@/components/user/user-breadcrumb";
import type { ExplorerMode, ExplorerPeriod } from "@/lib/user/metric-explorer";
import { buildProgressRollup } from "@/lib/user/rollup";
import type {
	AttemptHistoryEntry,
	DailyStudyStat,
	UserMastery,
} from "@/lib/user/types";

import { ConsistencyCard } from "./consistency-card";
import { GradeDistribution } from "./grade-distribution";
import { MasteryCard } from "./mastery-panel";
import { MetricExplorer } from "./metric-explorer";
import { MetricKpis } from "./metric-kpis";
import { ProgressRollup } from "./progress-rollup";
import { RecentAttempts } from "./recent-attempts";
import { SpeedAccuracy } from "./speed-accuracy";
import { WhenYouStudyCard } from "./study-rhythm";

const PERIODS: ChipOption<ExplorerPeriod>[] = [
	{ value: "week", label: "Ultima settimana" },
	{ value: "month", label: "Ultimo mese" },
	{ value: "year", label: "Ultimo anno" },
	{ value: "all", label: "Tutto lo storico" },
];

const MODES: ChipOption<ExplorerMode>[] = [
	{ value: "both", label: "Studio + Esame" },
	{ value: "STUDY", label: "Solo studio" },
	{ value: "EXAM_SIMULATION", label: "Solo esame" },
];

/**
 * The analytics page itself — everything but the data loading, so the same layout
 * that ships is the one the story renders. The window (period and mode) lives
 * here and is handed down: a card that owns its own copy of these two would put a
 * second, disagreeing pair of chips on the page.
 *
 * The grid answers to its own column with container queries, not to the window:
 * the content column is 1216px inside the rail's gutter, and viewport
 * breakpoints would be measuring the wrong box.
 */
export function AnalyticsView({
	daily,
	attempts,
	mastery,
	today,
}: {
	daily: DailyStudyStat[];
	attempts: AttemptHistoryEntry[];
	mastery: UserMastery;
	today?: Date;
}) {
	const [period, setPeriod] = useState<ExplorerPeriod>("all");
	const [mode, setMode] = useState<ExplorerMode>("both");

	const rollup = useMemo(() => buildProgressRollup(attempts), [attempts]);
	const scores = useMemo(() => attempts.map(attempt => attempt.score), [attempts]);

	return (
		<div className="@container flex flex-col gap-4">
			<PageToolbar
				breadcrumb={<UserBreadcrumb current="Analytics" />}
				actions={
					<>
						<SelectChip
							label="Periodo"
							value={period}
							onChange={setPeriod}
							options={PERIODS}
							lead={CalendarMinimalisticIcon}
						/>
						<SelectChip
							label="Modalità"
							value={mode}
							onChange={setMode}
							options={MODES}
							lead={LayersIcon}
						/>
						<Button variant="outline" size="sm" disabled>
							<ShareIcon className="size-3.5" />
							Condividi
						</Button>
						<Button size="sm" disabled>
							<DownloadIcon className="size-3.5" />
							Esporta
						</Button>
					</>
				}
			/>

			<MetricKpis daily={daily} period={period} mode={mode} today={today} />

			<div className="grid grid-cols-1 gap-4 @[900px]:grid-cols-12">
				<div className="@[900px]:col-span-8">
					<MetricExplorer daily={daily} today={today} period={period} mode={mode} />
				</div>
				<div className="@[900px]:col-span-4">
					<GradeDistribution scores={scores} />
				</div>

				<div className="@[900px]:col-span-8">
					<ConsistencyCard daily={daily} attempts={attempts} today={today} />
				</div>
				<div className="@[900px]:col-span-4">
					<WhenYouStudyCard attempts={attempts} today={today} />
				</div>

				<div className="@[900px]:col-span-4">
					<MasteryCard mastery={mastery} />
				</div>
				<div className="@[900px]:col-span-8">
					<SpeedAccuracy sections={mastery.sections} />
				</div>

				<div className="@[900px]:col-span-12">
					<ProgressRollup courses={rollup} />
				</div>
				<div className="@[900px]:col-span-12">
					<RecentAttempts attempts={attempts} />
				</div>
			</div>
		</div>
	);
}
