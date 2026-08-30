import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { EntityProgressDetail } from "@/components/progress/entity-progress-detail";
import { EntityProgressSkeleton } from "@/components/skeletons";
import { sectionDisplayName } from "@/lib/catalog/constants";
import { seoHead } from "@/lib/seo";
import { userQueries } from "@/lib/user/queries";
import {
	analyticsWindowSearch,
	useAnalyticsWindow,
} from "@/lib/user/use-analytics-window";

export const Route = createFileRoute("/_app/user/analytics/section/$id")({
	validateSearch: z.object(analyticsWindowSearch),
	loader: ({ context, params }) => {
		const scope = { level: "section", id: params.id } as const;
		return Promise.all([
			context.queryClient.ensureQueryData(userQueries.attemptHistory(scope)),
			context.queryClient.ensureQueryData(userQueries.mastery({ scope })),
			context.queryClient.ensureQueryData(userQueries.studyStats(scope)),
		]);
	},
	head: () => seoHead({ title: "Dettaglio sezione", noindex: true }),
	pendingComponent: EntityProgressSkeleton,
	component: SectionProgress,
});

function SectionProgress() {
	const { id } = Route.useParams();
	const scope = { level: "section", id } as const;
	const search = Route.useSearch();
	const { data: attempts } = useSuspenseQuery(userQueries.attemptHistory(scope));
	const window = useAnalyticsWindow(search, Route.fullPath);
	const { data: mastery } = useQuery({
		...userQueries.mastery({ scope, ...window.masteryWindow }),
		placeholderData: previous => previous,
	});
	const { data: daily } = useSuspenseQuery(userQueries.studyStats(scope));
	const { data: flashcardDays } = useSuspenseQuery(userQueries.flashcardDays(scope));

	const first = attempts[0];

	if (!mastery) return <EntityProgressSkeleton />;

	return (
		<EntityProgressDetail
			kindLabel="Sezione"
			name={first?.sectionName ? sectionDisplayName(first.sectionName) : "Sezione"}
			context={
				[first?.className, first?.courseName].filter(Boolean).join(" · ") || undefined
			}
			attempts={attempts}
			daily={daily}
			flashcardDays={flashcardDays}
			mastery={mastery}
			period={window.period}
			mode={window.mode}
			onPeriodChange={window.onPeriodChange}
			onModeChange={window.onModeChange}
			showSections={false}
		/>
	);
}
