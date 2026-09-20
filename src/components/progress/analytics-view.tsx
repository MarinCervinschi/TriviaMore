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
	/** A chip beside the title: the kind of thing the page is about. */
	badge?: ReactNode;
	/** The line under the title: where this entity sits. */
	meta?: ReactNode;
	period: ExplorerPeriod;
	mode: ExplorerMode;
	/** The section's tab row, which the page's own head would otherwise carry. */
	tabs?: TabNavItem[];
	/** Controls for the head. The overview leaves it empty: the shell header has them. */
	actions?: ReactNode;
	/**
	 * Extra cards for the grid, each carrying its own `col-span`. The entity pages
	 * add mastery and their recent attempts here; the overview adds nothing, which
	 * is what took it from nine blocks to five.
	 */
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
