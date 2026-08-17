import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { EntityProgressDetail } from "@/components/progress/entity-progress-detail";
import { ProgressSkeleton } from "@/components/skeletons";
import { seoHead } from "@/lib/seo";
import { userQueries } from "@/lib/user/queries";

export const Route = createFileRoute("/_app/user/progress/course/$id")({
	loader: ({ context, params }) =>
		Promise.all([
			context.queryClient.ensureQueryData(userQueries.attemptHistory()),
			context.queryClient.ensureQueryData(
				userQueries.mastery({ level: "course", id: params.id })
			),
			context.queryClient.ensureQueryData(
				userQueries.studyStats({ level: "course", id: params.id })
			),
		]),
	head: () => seoHead({ title: "Dettaglio corso", noindex: true }),
	pendingComponent: ProgressSkeleton,
	component: CourseProgress,
});

function CourseProgress() {
	const { id } = Route.useParams();
	const { data: attempts } = useSuspenseQuery(userQueries.attemptHistory());
	const { data: mastery } = useSuspenseQuery(
		userQueries.mastery({ level: "course", id })
	);
	const { data: daily } = useSuspenseQuery(
		userQueries.studyStats({ level: "course", id })
	);

	const scoped = attempts.filter(attempt => attempt.courseId === id);
	const first = scoped[0];

	return (
		<EntityProgressDetail
			kindLabel="Corso"
			name={first?.courseName ?? "Corso"}
			context={first?.departmentName ?? undefined}
			attempts={scoped}
			daily={daily}
			mastery={mastery}
			showSections
		/>
	);
}
