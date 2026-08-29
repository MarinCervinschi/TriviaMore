import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { EntityProgressDetail } from "@/components/progress/entity-progress-detail";
import { EntityProgressSkeleton } from "@/components/skeletons";
import { seoHead } from "@/lib/seo";
import { userQueries } from "@/lib/user/queries";

export const Route = createFileRoute("/_app/user/analytics/course/$id")({
	loader: ({ context, params }) => {
		const scope = { level: "course", id: params.id } as const;
		return Promise.all([
			context.queryClient.ensureQueryData(userQueries.attemptHistory(scope)),
			context.queryClient.ensureQueryData(userQueries.mastery(scope)),
			context.queryClient.ensureQueryData(userQueries.studyStats(scope)),
		]);
	},
	head: () => seoHead({ title: "Dettaglio corso", noindex: true }),
	pendingComponent: EntityProgressSkeleton,
	component: CourseProgress,
});

function CourseProgress() {
	const { id } = Route.useParams();
	const scope = { level: "course", id } as const;
	const { data: attempts } = useSuspenseQuery(userQueries.attemptHistory(scope));
	const { data: mastery } = useSuspenseQuery(userQueries.mastery(scope));
	const { data: daily } = useSuspenseQuery(userQueries.studyStats(scope));

	const first = attempts[0];

	return (
		<EntityProgressDetail
			kindLabel="Corso"
			name={first?.courseName ?? "Corso"}
			context={first?.departmentName ?? undefined}
			attempts={attempts}
			daily={daily}
			mastery={mastery}
			showSections
		/>
	);
}
