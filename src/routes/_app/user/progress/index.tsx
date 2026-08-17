import { useMemo } from "react";

import { ClockCircleIcon } from "@solar-icons/react/linear/clock-circle";
import { CupFirstIcon } from "@solar-icons/react/linear/cup-first";
import { GraphUpIcon } from "@solar-icons/react/linear/graph-up";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { MasteryPanel } from "@/components/progress/mastery-panel";
import { MetricExplorer } from "@/components/progress/metric-explorer";
import { ProgressRollup } from "@/components/progress/progress-rollup";
import { ProgressSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { UserBreadcrumb } from "@/components/user/user-breadcrumb";
import { UserHero } from "@/components/user/user-hero";
import { seoHead } from "@/lib/seo";
import { userQueries } from "@/lib/user/queries";
import { buildProgressRollup } from "@/lib/user/rollup";
import { formatThirtyScaleGrade } from "@/lib/utils/grading";
import { formatTimeSpent } from "@/lib/utils/quiz-results";

export const Route = createFileRoute("/_app/user/progress/")({
	loader: ({ context }) =>
		Promise.all([
			context.queryClient.ensureQueryData(userQueries.attemptHistory()),
			context.queryClient.ensureQueryData(userQueries.mastery()),
			context.queryClient.ensureQueryData(userQueries.studyStats()),
		]),
	head: () => seoHead({ title: "Progressi", noindex: true }),
	pendingComponent: ProgressSkeleton,
	component: ProgressPage,
});

function ProgressPage() {
	const { data: attempts } = useSuspenseQuery(userQueries.attemptHistory());
	const { data: mastery } = useSuspenseQuery(userQueries.mastery());
	const { data: daily } = useSuspenseQuery(userQueries.studyStats());

	const rollup = useMemo(() => buildProgressRollup(attempts), [attempts]);
	const summary = useMemo(() => {
		const count = attempts.length;
		const avg = count ? attempts.reduce((s, a) => s + a.score, 0) / count : 0;
		const time = attempts.reduce((s, a) => s + (a.timeSpent ?? 0), 0);
		return { count, avg, time };
	}, [attempts]);

	if (attempts.length === 0) {
		return (
			<div className="space-y-8 pb-8">
				<UserHero
					icon={GraphUpIcon}
					title="I miei progressi"
					description="Analizza le tue performance e i tuoi miglioramenti nel tempo"
				/>
				<div className="container space-y-6">
					<UserBreadcrumb current="Progressi" />
					<EmptyState
						icon={CupFirstIcon}
						title="Nessun progresso disponibile"
						description="Inizia a completare alcuni quiz per vedere i tuoi progressi qui!"
						actionLabel="Esplora i dipartimenti"
						actionHref="/browse"
					/>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-8 pb-8">
			<UserHero
				icon={GraphUpIcon}
				title="I miei progressi"
				description="Analizza le tue performance e i tuoi miglioramenti nel tempo"
				stats={[
					{ label: "quiz totali", value: summary.count },
					{ label: "media voto", value: formatThirtyScaleGrade(summary.avg) },
					{ label: "tempo totale", value: formatTimeSpent(summary.time) },
				]}
			/>

			<div className="container space-y-6">
				<UserBreadcrumb current="Progressi" />

				<MetricExplorer daily={daily} />
				<MasteryPanel mastery={mastery} />
				<ProgressRollup courses={rollup} />

				<div className="flex justify-center">
					<Button asChild variant="outline">
						<Link to="/user/progress/history">
							<ClockCircleIcon className="h-4 w-4" />
							Cronologia completa
						</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}
