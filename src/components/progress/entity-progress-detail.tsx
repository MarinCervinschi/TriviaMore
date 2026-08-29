import { GraphUpIcon } from "@solar-icons/react/linear/graph-up";

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { UserBreadcrumb } from "@/components/user/user-breadcrumb";
import type {
	AttemptHistoryEntry,
	DailyStudyStat,
	UserMastery,
} from "@/lib/user/types";

import { AnalyticsView } from "./analytics-view";

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
	mastery,
	showSections,
}: {
	kindLabel: string;
	name: string;
	context?: string;
	attempts: AttemptHistoryEntry[];
	daily: DailyStudyStat[];
	mastery: UserMastery;
	/** False on a section: there are no sub-sections to break down. */
	showSections: boolean;
}) {
	if (attempts.length === 0) {
		return (
			<div className="container space-y-4 py-6 pb-10">
				<UserBreadcrumb
					current={name}
					trail={[{ label: "Analytics", to: "/user/analytics" }]}
				/>
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
				attempts={attempts}
				mastery={mastery}
				showRollup={false}
				showSectionBreakdown={showSections}
				breadcrumb={
					<UserBreadcrumb
						current={name}
						trail={[{ label: "Analytics", to: "/user/analytics" }]}
					/>
				}
				title={name}
				badge={<Badge variant="secondary">{kindLabel}</Badge>}
				meta={context}
			/>
		</div>
	);
}
