import { AltArrowLeftIcon } from "@solar-icons/react/linear/alt-arrow-left";
import { GraphUpIcon } from "@solar-icons/react/linear/graph-up";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { UserHero } from "@/components/user/user-hero";
import type {
	AttemptHistoryEntry,
	DailyStudyStat,
	UserMastery,
} from "@/lib/user/types";
import { formatGradeOutOf33 } from "@/lib/utils/grading";
import { formatTimeSpent } from "@/lib/utils/quiz-results";

import { MasteryPanel } from "./mastery-panel";
import { MetricExplorer } from "./metric-explorer";

/**
 * One entity's progress (a section, insegnamento or course), reusing the trend
 * and mastery panels scoped to it. `attempts` are already filtered to the
 * entity by the route; `mastery` is fetched scoped.
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
	showSections: boolean;
}) {
	const count = attempts.length;
	const time = attempts.reduce((sum, a) => sum + (a.timeSpent ?? 0), 0);
	const avg = count ? attempts.reduce((sum, a) => sum + a.score, 0) / count : 0;

	return (
		<div className="space-y-8 pb-8">
			<UserHero
				icon={GraphUpIcon}
				title={name}
				description={context ? `${kindLabel} · ${context}` : kindLabel}
				stats={
					count
						? [
								{ label: "quiz", value: count },
								{ label: "media voto", value: formatGradeOutOf33(avg) },
								{ label: "tempo", value: formatTimeSpent(time) },
							]
						: undefined
				}
			/>

			<div className="container space-y-6">
				<Button asChild variant="ghost" size="sm" className="-ml-2">
					<Link to="/user/progress">
						<AltArrowLeftIcon className="h-4 w-4" />
						Progressi
					</Link>
				</Button>

				{count === 0 ? (
					<EmptyState
						icon={GraphUpIcon}
						title="Nessun dato"
						description="Non hai ancora completato quiz per questa voce."
						actionLabel="Esplora i dipartimenti"
						actionHref="/browse"
					/>
				) : (
					<>
						<MetricExplorer daily={daily} />
						<MasteryPanel mastery={mastery} sections={showSections} />
					</>
				)}
			</div>
		</div>
	);
}
