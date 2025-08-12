import { redirect } from "next/navigation";

import QuizPageComponent from "@/components/pages/Quiz";
import { auth } from "@/lib/auth";

interface QuizPageProps {
	params: Promise<{
		quizId: string;
	}>;
}

export default async function QuizPage({ params }: QuizPageProps) {
	const session = await auth();
	const resolvedParams = await params;

	const isGuest = resolvedParams.quizId.startsWith("guest-");

	return (
		<QuizPageComponent
			quizId={resolvedParams.quizId}
			isGuest={isGuest}
			user={session?.user}
		/>
	);
}

export async function generateMetadata({ params }: QuizPageProps) {
	const resolvedParams = await params;

	if (resolvedParams.quizId.startsWith("guest-")) {
		return {
			title: "Quiz - TriviaMore",
			description: "Mettiti alla prova con questo quiz interattivo.",
			robots: "noindex, nofollow",
		};
	}

	return {
		title: "Quiz - TriviaMore",
		description: "Completa il tuo quiz e testa le tue conoscenze.",
	};
}
