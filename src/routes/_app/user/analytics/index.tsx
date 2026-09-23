import { CupFirstIcon } from "@solar-icons/react/linear/cup-first";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { ANALYTICS_TABS } from "@/components/layout/nav-items";
import { AnalyticsView } from "@/components/progress/analytics-view";
import { PageToolbar } from "@/components/shared/page-toolbar";
import { AnalyticsSkeleton } from "@/components/skeletons";
import { EmptyState } from "@/components/ui/empty-state";
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
			context.queryClient.ensureQueryData(userQueries.studyStats()),
			context.queryClient.ensureQueryData(userQueries.flashcardDays()),
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
	const { data: flashcardDays } = useSuspenseQuery(userQueries.flashcardDays());

	// No hero on this page: the breadcrumb names it and the space goes to the data.
	return (
		<div className="container space-y-6 py-6 pb-10 [--container-max:none]">
			{attempts.length === 0 ? (
				<>
					<PageToolbar tabs={ANALYTICS_TABS} title="Analytics" />
					<EmptyState
						icon={CupFirstIcon}
						title="Ancora nessun dato"
						description="Completa il primo quiz: da lì in poi trovi qui voti, costanza e punti deboli."
						actionLabel="Esplora i dipartimenti"
						actionHref="/browse"
					/>
				</>
			) : (
				<AnalyticsView
					daily={daily}
					flashcardDays={flashcardDays}
					attempts={attempts}
					tabs={ANALYTICS_TABS}
					period={window.period}
					mode={window.mode}
				/>
			)}
		</div>
	);
}
