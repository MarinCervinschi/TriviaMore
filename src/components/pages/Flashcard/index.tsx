"use client";

import { useRouter } from "next/navigation";

import { User } from "next-auth";

import { useFlashcardData } from "@/hooks";
import { clearFlashcardSession } from "@/lib/utils/flashcard-session";

import { FlashcardContainer } from "./FlashcardContainer";
import { FlashcardLoader } from "./FlashcardLoader";

interface FlashcardPageComponentProps {
	sessionId: string;
	isGuest: boolean;
	user?: User | null;
}

export default function FlashcardPageComponent({
	sessionId,
	isGuest,
	user,
}: FlashcardPageComponentProps) {
	const router = useRouter();
	const { data, isLoading, error } = useFlashcardData(sessionId, isGuest);
	const { session } = data || {};

	const handleFlashcardExit = () => {
		if (isGuest) {
			clearFlashcardSession(sessionId);
		}
		router.back();
	};

	if (isLoading) {
		return <FlashcardLoader />;
	}

	if (error) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
				<div className="text-center">
					<h1 className="mb-4 text-2xl font-bold text-red-600 dark:text-red-400">
						Errore
					</h1>
					<p className="mb-4 text-gray-700 dark:text-gray-300">{error.message}</p>
					<button
						onClick={() => router.back()}
						className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
					>
						Torna Indietro
					</button>
				</div>
			</div>
		);
	}

	if (!session) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
				<div className="text-center">
					<h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
						Sessione non trovata
					</h1>
					<button
						onClick={() => router.back()}
						className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
					>
						Torna Indietro
					</button>
				</div>
			</div>
		);
	}

	return (
		<FlashcardContainer
			session={session}
			isGuest={isGuest}
			user={user}
			onExit={handleFlashcardExit}
		/>
	);
}
