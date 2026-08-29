import { CupFirstIcon } from "@solar-icons/react/linear/cup-first";
import { GraphUpIcon } from "@solar-icons/react/linear/graph-up";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { AnalyticsView } from "@/components/progress/analytics-view";
import { AnalyticsSkeleton } from "@/components/skeletons";
import { EmptyState } from "@/components/ui/empty-state";
import { UserBreadcrumb } from "@/components/user/user-breadcrumb";
import { seoHead } from "@/lib/seo";
import { userQueries } from "@/lib/user/queries";
import {
	analyticsWindowSearch,
	useAnalyticsWindow,
} from "@/lib/user/use-analytics-window";

export const Route = createFileRoute("/_app/user/analytics/")({
	validateSearch: z.object(analyticsWindowSearch),
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
	const search = Route.useSearch();
	const window = useAnalyticsWindow(search, Route.fullPath);
	const { data: attempts } = useSuspenseQuery(userQueries.attemptHistory());
	const { data: daily } = useSuspenseQuery(userQueries.studyStats());
	// Not suspense: the window changes under the user, and a refetch must not
	// throw the whole page back to its skeleton.
	const { data: mastery } = useQuery({
		...userQueries.mastery(window.masteryWindow),
		placeholderData: previous => previous,
	});

	// No hero on this page: the breadcrumb names it and the space goes to the data.
	return (
		<div className="container space-y-6 py-6 pb-10">
			{attempts.length === 0 ? (
				<>
					<UserBreadcrumb current="Analytics" currentIcon={GraphUpIcon} />
					<EmptyState
						icon={CupFirstIcon}
						title="Ancora nessun dato"
						description="Completa il primo quiz: da lì in poi trovi qui voti, costanza e punti deboli."
						actionLabel="Esplora i dipartimenti"
						actionHref="/browse"
					/>
				</>
			) : mastery ? (
				<AnalyticsView
					daily={daily}
					attempts={attempts}
					mastery={mastery}
					period={window.period}
					mode={window.mode}
					onPeriodChange={window.onPeriodChange}
					onModeChange={window.onModeChange}
				/>
			) : (
				<AnalyticsSkeleton />
			)}
		</div>
	);
}
