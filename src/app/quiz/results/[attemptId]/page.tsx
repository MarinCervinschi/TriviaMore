import { notFound } from "next/navigation";

import { AppLayout } from "@/components/layouts/AppLayout";
import QuizResultsPageComponent from "@/components/pages/Quiz/QuizResults";
import { auth } from "@/lib/auth";
import { QuizService } from "@/lib/services/quiz.service";

interface QuizResultsPageProps {
	params: Promise<{
		attemptId: string;
	}>;
}

export default async function QuizResultsPage({ params }: QuizResultsPageProps) {
	const session = await auth();
	const resolvedParams = await params;

	if (!session?.user) {
		notFound();
	}

	try {
		const results = await QuizService.getQuizResults(
			resolvedParams.attemptId,
			session.user.id
		);

		if (!results) {
			notFound();
		}

		return (
			<AppLayout user={session.user}>
				<QuizResultsPageComponent
					attemptId={resolvedParams.attemptId}
					user={session.user}
					results={results}
				/>
			</AppLayout>
		);
	} catch (error) {
		console.error("Error loading quiz results:", error);
		notFound();
	}
}

export function generateMetadata() {
	return {
		title: "Risultati Quiz - TriviaMore",
		description: "Visualizza i risultati del tuo quiz completato.",
		robots: "noindex, nofollow",
	};
}
