import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { EntityProgressDetail } from "@/components/progress/entity-progress-detail";
import { EntityProgressSkeleton } from "@/components/skeletons";
import { seoHead } from "@/lib/seo";
import { userQueries } from "@/lib/user/queries";

export const Route = createFileRoute("/_app/user/analytics/class/$id")({
	loader: ({ context, params }) => {
		const scope = { level: "class", id: params.id } as const;
		return Promise.all([
			context.queryClient.ensureQueryData(userQueries.attemptHistory(scope)),
			context.queryClient.ensureQueryData(userQueries.mastery(scope)),
			context.queryClient.ensureQueryData(userQueries.studyStats(scope)),
		]);
	},
	head: () => seoHead({ title: "Dettaglio insegnamento", noindex: true }),
	pendingComponent: EntityProgressSkeleton,
	component: ClassProgress,
});

function ClassProgress() {
	const { id } = Route.useParams();
	const scope = { level: "class", id } as const;
	const { data: attempts } = useSuspenseQuery(userQueries.attemptHistory(scope));
	const { data: mastery } = useSuspenseQuery(userQueries.mastery(scope));
	const { data: daily } = useSuspenseQuery(userQueries.studyStats(scope));

	const first = attempts[0];

	return (
		<EntityProgressDetail
			kindLabel="Insegnamento"
			name={first?.className ?? "Insegnamento"}
			context={first?.courseName ?? undefined}
			attempts={attempts}
			daily={daily}
			mastery={mastery}
			showSections
		/>
	);
}
