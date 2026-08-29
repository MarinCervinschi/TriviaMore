import { CupFirstIcon } from "@solar-icons/react/linear/cup-first";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { AnalyticsView } from "@/components/progress/analytics-view";
import { AnalyticsSkeleton } from "@/components/skeletons";
import { EmptyState } from "@/components/ui/empty-state";
import { UserBreadcrumb } from "@/components/user/user-breadcrumb";
import { seoHead } from "@/lib/seo";
import { userQueries } from "@/lib/user/queries";

export const Route = createFileRoute("/_app/user/analytics/")({
	loader: ({ context }) =>
		Promise.all([
			context.queryClient.ensureQueryData(userQueries.attemptHistory()),
			context.queryClient.ensureQueryData(userQueries.mastery()),
			context.queryClient.ensureQueryData(userQueries.studyStats()),
		]),
	head: () => seoHead({ title: "Analytics", noindex: true }),
	pendingComponent: AnalyticsSkeleton,
	component: AnalyticsPage,
});

function AnalyticsPage() {
	const { data: attempts } = useSuspenseQuery(userQueries.attemptHistory());
	const { data: mastery } = useSuspenseQuery(userQueries.mastery());
	const { data: daily } = useSuspenseQuery(userQueries.studyStats());

	// No hero on this page: the breadcrumb names it and the space goes to the data.
	return (
		<div className="container space-y-6 py-6 pb-10">
			{attempts.length === 0 ? (
				<>
					<UserBreadcrumb current="Analytics" />
					<EmptyState
						icon={CupFirstIcon}
						title="Ancora nessun dato"
						description="Completa il primo quiz: da lì in poi trovi qui voti, costanza e punti deboli."
						actionLabel="Esplora i dipartimenti"
						actionHref="/browse"
					/>
				</>
			) : (
				<AnalyticsView daily={daily} attempts={attempts} mastery={mastery} />
			)}
		</div>
	);
}
