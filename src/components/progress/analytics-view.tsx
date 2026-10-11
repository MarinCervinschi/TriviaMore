import { type ReactNode, useMemo } from "react";

import { PageToolbar } from "@/components/shared/page-toolbar";
import type { TabNavItem } from "@/components/ui/tab-nav";
import {
	type ExplorerMode,
	type ExplorerPeriod,
	attemptsInWindow,
} from "@/lib/user/metric-explorer";
import type {
	AttemptHistoryEntry,
	DailyFlashcardDay,
	DailyStudyStat,
} from "@/lib/user/types";

import { ConsistencyCard } from "./consistency-card";
import { GradeDistribution } from "./grade-distribution";
import { MetricExplorer } from "./metric-explorer";
import { MetricKpis } from "./metric-kpis";
import { WhenYouStudyCard } from "./study-rhythm";

export function AnalyticsView({
	daily,
	flashcardDays,
	attempts,
	today,
	title,
	badge,
	meta,
	period,
	mode,
	tabs,
	actions,
	children,
}: {
	daily: DailyStudyStat[];
	flashcardDays?: DailyFlashcardDay[];
	attempts: AttemptHistoryEntry[];
	today?: Date;
	title?: ReactNode;
	badge?: ReactNode;
	meta?: ReactNode;
	period: ExplorerPeriod;
	mode: ExplorerMode;
	tabs?: TabNavItem[];
	actions?: ReactNode;
	/** Extra grid cards, each carrying its own `col-span`. */
	children?: ReactNode;
}) {
	const now = useMemo(() => today ?? new Date(), [today]);
	const windowed = useMemo(
		() => attemptsInWindow(attempts, period, mode, now),
		[attempts, period, mode, now]
	);
	const scores = useMemo(() => windowed.map(attempt => attempt.score), [windowed]);

	return (
		<div className="@container flex flex-col gap-4">
			<PageToolbar
				tabs={tabs}
				title={title ?? "Analytics"}
				badge={badge}
				meta={meta}
				actions={actions}
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
					<ConsistencyCard
						daily={daily}
						flashcardDays={flashcardDays}
						attempts={attempts}
						today={today}
					/>
				</div>
				<div className="@[900px]:col-span-4">
					<WhenYouStudyCard attempts={windowed} today={today} />
				</div>

				{children}
			</div>
		</div>
	);
}
