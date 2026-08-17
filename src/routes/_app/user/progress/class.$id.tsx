import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { EntityProgressDetail } from "@/components/progress/entity-progress-detail";
import { ProgressSkeleton } from "@/components/skeletons";
import { seoHead } from "@/lib/seo";
import { userQueries } from "@/lib/user/queries";

export const Route = createFileRoute("/_app/user/progress/class/$id")({
	loader: ({ context, params }) =>
		Promise.all([
			context.queryClient.ensureQueryData(userQueries.attemptHistory()),
			context.queryClient.ensureQueryData(
				userQueries.mastery({ level: "class", id: params.id })
			),
			context.queryClient.ensureQueryData(
				userQueries.studyStats({ level: "class", id: params.id })
			),
		]),
	head: () => seoHead({ title: "Dettaglio insegnamento", noindex: true }),
	pendingComponent: ProgressSkeleton,
	component: ClassProgress,
});

function ClassProgress() {
	const { id } = Route.useParams();
	const { data: attempts } = useSuspenseQuery(userQueries.attemptHistory());
	const { data: mastery } = useSuspenseQuery(
		userQueries.mastery({ level: "class", id })
	);
	const { data: daily } = useSuspenseQuery(
		userQueries.studyStats({ level: "class", id })
	);

	const scoped = attempts.filter(attempt => attempt.classId === id);
	const first = scoped[0];

	return (
		<EntityProgressDetail
			kindLabel="Insegnamento"
			name={first?.className ?? "Insegnamento"}
			context={first?.courseName ?? undefined}
			attempts={scoped}
			daily={daily}
			mastery={mastery}
			showSections
		/>
	);
}
