import { notFound } from "next/navigation";

import QuizResultsPageComponent from "@/components/pages/Quiz/QuizResults";
import { auth } from "@/lib/auth";

interface QuizResultsPageProps {
	params: Promise<{
		attemptId: string;
	}>;
}

export default async function QuizResultsPage({ params }: QuizResultsPageProps) {
	const session = await auth();
	const resolvedParams = await params;

	// Solo utenti autenticati possono vedere i risultati
	if (!session?.user) {
		notFound();
	}

	// TODO: Recuperare i risultati dal database usando attemptId
	// const results = await QuizService.getQuizResults(resolvedParams.attemptId, session.user.id);

	return (
		<QuizResultsPageComponent
			attemptId={resolvedParams.attemptId}
			user={session.user}
		/>
	);
}

export async function generateMetadata({ params }: QuizResultsPageProps) {
	const resolvedParams = await params;

	return {
		title: "Risultati Quiz - TriviaMore",
		description: "Visualizza i risultati del tuo quiz completato.",
		robots: "noindex, nofollow", // I risultati non dovrebbero essere indicizzati
	};
}
