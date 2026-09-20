import { GraphUpIcon } from "@solar-icons/react/linear/graph-up";

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import type { ExplorerMode, ExplorerPeriod } from "@/lib/user/metric-explorer";
import type {
	AttemptHistoryEntry,
	DailyFlashcardDay,
	DailyStudyStat,
	UserMastery,
} from "@/lib/user/types";

import { AnalyticsView } from "./analytics-view";
import { AnalyticsWindowChips } from "./analytics-window-chips";
import { MasteryCard } from "./mastery-card";
import { RecentAttempts } from "./recent-attempts";
import { SpeedAccuracy } from "./speed-accuracy";

/**
 * One entity's analytics — a section, an insegnamento or a course. It is the same
 * page as `/user/analytics` with its inputs already scoped, so it stays the same
 * page as that one changes; only the two cards that compare *across* the scope
 * are dropped.
 */
export function EntityProgressDetail({
	kindLabel,
	name,
	context,
	attempts,
	daily,
	flashcardDays,
	mastery,
	showSections,
	period,
	mode,
	onPeriodChange,
	onModeChange,
}: {
	kindLabel: string;
	name: string;
	context?: string;
	attempts: AttemptHistoryEntry[];
	daily: DailyStudyStat[];
	flashcardDays?: DailyFlashcardDay[];
	mastery: UserMastery;
	/** False on a section: there are no sub-sections to break down. */
	showSections: boolean;
	period: ExplorerPeriod;
	mode: ExplorerMode;
	onPeriodChange: (period: ExplorerPeriod) => void;
	onModeChange: (mode: ExplorerMode) => void;
}) {
	if (attempts.length === 0) {
		return (
			<div className="container space-y-4 py-6 pb-10">
				<EmptyState
					icon={GraphUpIcon}
					title="Nessun dato"
					description={`Non hai ancora completato quiz per questa ${kindLabel.toLowerCase()}.`}
					actionLabel="Esplora i dipartimenti"
					actionHref="/browse"
				/>
			</div>
		);
	}

	return (
		<div className="container space-y-4 py-6 pb-10">
			<AnalyticsView
				daily={daily}
				flashcardDays={flashcardDays}
				attempts={attempts}
				period={period}
				mode={mode}
				actions={
					<AnalyticsWindowChips
						period={period}
						mode={mode}
						onPeriodChange={onPeriodChange}
						onModeChange={onModeChange}
					/>
				}
				title={name}
				badge={<Badge variant="secondary">{kindLabel}</Badge>}
				meta={context}
			>
				{/* One entity, so no rollup: the tree would have a single branch. */}
				<div className={showSections ? "@[900px]:col-span-4" : "@[900px]:col-span-12"}>
					<MasteryCard mastery={mastery} />
				</div>
				{showSections && (
					<div className="@[900px]:col-span-8">
						<SpeedAccuracy sections={mastery.sections} />
					</div>
				)}
				<div className="@[900px]:col-span-12">
					<RecentAttempts attempts={attempts} />
				</div>
			</AnalyticsView>
		</div>
	);
}
