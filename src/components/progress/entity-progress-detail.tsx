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

import { MasteryPanel } from "./mastery-panel";
import { MetricExplorer } from "./metric-explorer";
import { StudyRhythm } from "./study-rhythm";

/**
 * One entity's progress (a section, insegnamento or course), reusing the trend
 * and mastery panels. Every input is already fetched scoped to the entity.
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

	return (
		<div className="space-y-8 pb-8">
			<UserHero
				icon={GraphUpIcon}
				title={name}
				description={context ? `${kindLabel} · ${context}` : kindLabel}
			/>

			<div className="container space-y-6">
				<Button asChild variant="ghost" size="sm" className="-ml-2">
					<Link to="/user/analytics">
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
						<StudyRhythm attempts={attempts} />
						<MasteryPanel mastery={mastery} sections={showSections} />
					</>
				)}
			</div>
		</div>
	);
}
