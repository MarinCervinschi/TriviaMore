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
	showSections: boolean;
	period: ExplorerPeriod;
	mode: ExplorerMode;
	onPeriodChange: (period: ExplorerPeriod) => void;
	onModeChange: (mode: ExplorerMode) => void;
}) {
	if (attempts.length === 0) {
		return (
			<div className="container space-y-4 py-6 pb-10 [--container-max:none]">
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
		<div className="container space-y-4 py-6 pb-10 [--container-max:none]">
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
