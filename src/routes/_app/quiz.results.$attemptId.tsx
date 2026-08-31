import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";

import { NotFoundPage } from "@/components/error/not-found-page";
import { QuizResultsView } from "@/components/results/quiz-results-view";
import { QuizResultsSkeleton } from "@/components/skeletons";
import { quizQueries } from "@/lib/quiz/queries";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/_app/quiz/results/$attemptId")({
	loader: async ({ context, params }) => {
		const data = await context.queryClient.ensureQueryData(
			quizQueries.results(params.attemptId)
		);
		if (!data) throw notFound();
		return data;
	},
	head: () => seoHead({ title: "Risultati quiz", noindex: true }),
	pendingComponent: QuizResultsSkeleton,
	component: ResultsPage,
	notFoundComponent: () => (
		<NotFoundPage
			title="Risultato non disponibile"
			message="Il risultato del quiz non è stato trovato."
			withBand={false}
		/>
	),
});

function ResultsPage() {
	const { attemptId } = Route.useParams();
	const { data: result } = useSuspenseQuery(quizQueries.results(attemptId));

	if (!result) return null;
	return <QuizResultsView result={result} />;
}
