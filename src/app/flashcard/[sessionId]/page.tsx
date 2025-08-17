import { redirect } from "next/navigation";

import FlashcardPageComponent from "@/components/pages/Flashcard";
import { auth } from "@/lib/auth";

interface FlashcardPageProps {
	params: Promise<{
		sessionId: string;
	}>;
}

export default async function FlashcardPage({ params }: FlashcardPageProps) {
	const session = await auth();
	const resolvedParams = await params;

	const isGuest = resolvedParams.sessionId.startsWith("guest-");

	return (
		<FlashcardPageComponent
			sessionId={resolvedParams.sessionId}
			isGuest={isGuest}
			user={session?.user}
		/>
	);
}

export async function generateMetadata({ params }: FlashcardPageProps) {
	const resolvedParams = await params;

	if (resolvedParams.sessionId.startsWith("guest-")) {
		return {
			title: "Flashcard - TriviaMore",
			description: "Studia con le flashcard interattive.",
			robots: "noindex, nofollow",
		};
	}

	return {
		title: "Flashcard - TriviaMore",
		description: "Migliora la tua conoscenza con le flashcard.",
	};
}
