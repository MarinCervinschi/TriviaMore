import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { EntityProgressDetail } from "@/components/progress/entity-progress-detail";
import { ProgressSkeleton } from "@/components/skeletons";
import { seoHead } from "@/lib/seo";
import { userQueries } from "@/lib/user/queries";

export const Route = createFileRoute("/_app/user/progress/section/$id")({
	loader: ({ context, params }) =>
		Promise.all([
			context.queryClient.ensureQueryData(userQueries.attemptHistory()),
			context.queryClient.ensureQueryData(
				userQueries.mastery({ level: "section", id: params.id })
			),
			context.queryClient.ensureQueryData(
				userQueries.studyStats({ level: "section", id: params.id })
			),
		]),
	head: () => seoHead({ title: "Dettaglio sezione", noindex: true }),
	pendingComponent: ProgressSkeleton,
	component: SectionProgress,
});

function SectionProgress() {
	const { id } = Route.useParams();
	const { data: attempts } = useSuspenseQuery(userQueries.attemptHistory());
	const { data: mastery } = useSuspenseQuery(
		userQueries.mastery({ level: "section", id })
	);
	const { data: daily } = useSuspenseQuery(
		userQueries.studyStats({ level: "section", id })
	);

	const scoped = attempts.filter(attempt => attempt.sectionId === id);
	const first = scoped[0];

	return (
		<EntityProgressDetail
			kindLabel="Sezione"
			name={first?.sectionName ?? "Sezione"}
			context={
				[first?.className, first?.courseName].filter(Boolean).join(" · ") || undefined
			}
			attempts={scoped}
			daily={daily}
			mastery={mastery}
			showSections={false}
		/>
	);
}
