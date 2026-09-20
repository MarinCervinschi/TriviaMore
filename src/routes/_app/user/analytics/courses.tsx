import { useMemo } from "react";

import { CupFirstIcon } from "@solar-icons/react/linear/cup-first";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { ANALYTICS_TABS } from "@/components/layout/nav-items";
import { MasteryCard } from "@/components/progress/mastery-card";
import { ProgressRollup } from "@/components/progress/progress-rollup";
import { SpeedAccuracy } from "@/components/progress/speed-accuracy";
import { PageToolbar } from "@/components/shared/page-toolbar";
import { AnalyticsSkeleton } from "@/components/skeletons";
import { EmptyState } from "@/components/ui/empty-state";
import { seoHead } from "@/lib/seo";
import { userQueries } from "@/lib/user/queries";
import { buildProgressRollup } from "@/lib/user/rollup";

export const Route = createFileRoute("/_app/user/analytics/courses")({
	loader: ({ context }) =>
		Promise.all([
			context.queryClient.ensureQueryData(userQueries.attemptHistory()),
			context.queryClient.ensureQueryData(userQueries.mastery()),
		]),
	head: () => seoHead({ title: "Analytics — per corso", noindex: true }),
	pendingComponent: AnalyticsSkeleton,
	component: AnalyticsCoursesPage,
});

function AnalyticsCoursesPage() {
	const { data: attempts } = useSuspenseQuery(userQueries.attemptHistory());
	const { data: mastery } = useQuery(userQueries.mastery());
	const rollup = useMemo(() => buildProgressRollup(attempts), [attempts]);

	return (
		<div className="@container container space-y-6 py-6 pb-10">
			<PageToolbar tabs={ANALYTICS_TABS} title="Analytics" />

			{attempts.length === 0 ? (
				<EmptyState
					icon={CupFirstIcon}
					title="Ancora nessun dato"
					description="Completa il primo quiz: da lì in poi trovi qui il quadro per corso."
					actionLabel="Esplora i dipartimenti"
					actionHref="/browse"
				/>
			) : (
				<div className="grid grid-cols-1 gap-4 @[900px]:grid-cols-12">
					<div className="@[900px]:col-span-12">
						<ProgressRollup courses={rollup} />
					</div>
					{mastery && (
						<>
							<div className="@[900px]:col-span-4">
								<MasteryCard mastery={mastery} />
							</div>
							<div className="@[900px]:col-span-8">
								<SpeedAccuracy sections={mastery.sections} />
							</div>
						</>
					)}
				</div>
			)}
		</div>
	);
}
