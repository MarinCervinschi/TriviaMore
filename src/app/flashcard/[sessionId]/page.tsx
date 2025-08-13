import { redirect } from "next/navigation";

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

	// TODO: Implementare il componente Flashcard
	return (
		<div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
			<div className="text-center">
				<h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
					Flashcard Page
				</h1>
				<p className="mb-4 text-gray-700 dark:text-gray-300">
					Session ID: {resolvedParams.sessionId}
				</p>
				<p className="mb-4 text-gray-700 dark:text-gray-300">
					Is Guest: {isGuest ? "Yes" : "No"}
				</p>
				<p className="text-gray-700 dark:text-gray-300">
					User: {session?.user?.name || "Not logged in"}
				</p>
			</div>
		</div>
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
