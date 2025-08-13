"use client";

import { useState } from "react";

import { User } from "next-auth";

import { FlashcardSession } from "@/lib/types/flashcard.types";

import { FlashcardCard } from "./FlashcardCard";
import { FlashcardHeader } from "./FlashcardHeader";
import { FlashcardNavigation } from "./FlashcardNavigation";
import { FlashcardProgress } from "./FlashcardProgress";
import { FlashcardResults } from "./FlashcardResults";

interface FlashcardContainerProps {
	session: FlashcardSession;
	isGuest: boolean;
	user?: User | null;
	onExit: () => void;
}

export function FlashcardContainer({
	session,
	isGuest,
	user,
	onExit,
}: FlashcardContainerProps) {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [isComplete, setIsComplete] = useState(false);
	const [studiedCards, setStudiedCards] = useState<Set<number>>(new Set());

	const currentCard = session.questions[currentIndex];
	const totalCards = session.questions.length;
	const isLastCard = currentIndex === totalCards - 1;

	const handleNext = () => {
		setStudiedCards(prev => new Set(prev).add(currentIndex));

		if (isLastCard) {
			setIsComplete(true);
		} else {
			setCurrentIndex(prev => prev + 1);
		}
	};

	const handlePrevious = () => {
		if (currentIndex > 0) {
			setCurrentIndex(prev => prev - 1);
		}
	};

	const handleJumpToCard = (index: number) => {
		setCurrentIndex(index);
	};

	const handleRestart = () => {
		setCurrentIndex(0);
		setIsComplete(false);
		setStudiedCards(new Set());
	};

	if (isComplete) {
		return (
			<FlashcardResults
				session={session}
				studiedCardsCount={studiedCards.size}
				onRestart={handleRestart}
				onExit={onExit}
			/>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-violet-50 dark:from-purple-900/10 dark:via-gray-900 dark:to-violet-900/10">
			<FlashcardHeader
				session={session}
				isGuest={isGuest}
				user={user}
				onExit={onExit}
			/>

			<div className="container mx-auto px-4 py-6">
				<FlashcardProgress
					currentIndex={currentIndex}
					totalCards={totalCards}
					studiedCards={studiedCards}
				/>

				<div className="mt-8">
					<FlashcardCard
						question={currentCard}
						cardNumber={currentIndex + 1}
						totalCards={totalCards}
					/>
				</div>

				<FlashcardNavigation
					currentIndex={currentIndex}
					totalCards={totalCards}
					onPrevious={handlePrevious}
					onNext={handleNext}
					onJumpToCard={handleJumpToCard}
					studiedCards={studiedCards}
				/>
			</div>
		</div>
	);
}
