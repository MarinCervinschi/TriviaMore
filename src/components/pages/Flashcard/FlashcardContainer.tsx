"use client";

import { useState } from "react";

import { User } from "next-auth";

import { FlashcardSession } from "@/lib/types/flashcard.types";

import { FlashcardCard } from "./FlashcardCard";
import { FlashcardHeader } from "./FlashcardHeader";
import { FlashcardNavigation } from "./FlashcardNavigation";
import { FlashcardProgress } from "./FlashcardProgress";
import { FlashcardResults } from "./FlashcardResults";
import { FlashcardSidebar } from "./FlashcardSidebar";

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
	const [sidebarOpen, setSidebarOpen] = useState(true);

	const currentCard = session.questions[currentIndex];
	const totalCards = session.questions.length;
	const isLastCard = currentIndex === totalCards - 1;
	const progress = ((currentIndex + 1) / totalCards) * 100;

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

	const handleCardFlipped = () => {
		setStudiedCards(prev => new Set(prev).add(currentIndex));
	};

	const handleJumpToCard = (index: number) => {
		setCurrentIndex(index);
		const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;
		if (isMobile) {
			setSidebarOpen(false);
		}
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
		<div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
			{/* Sidebar per desktop */}
			<FlashcardSidebar
				questions={session.questions}
				studiedCards={studiedCards}
				currentCardIndex={currentIndex}
				onCardSelect={handleJumpToCard}
				isOpen={sidebarOpen}
				onToggle={() => setSidebarOpen(!sidebarOpen)}
			/>

			{/* Contenuto principale */}
			<div className="flex flex-1 flex-col">
				{/* Header */}
				<FlashcardHeader
					session={session}
					isGuest={isGuest}
					user={user}
					onExit={onExit}
					onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
					sidebarOpen={sidebarOpen}
				/>

				{/* Progress */}
				<FlashcardProgress
					current={currentIndex + 1}
					total={totalCards}
					progress={progress}
				/>

				{/* Flashcard */}
				<div className="flex-1 p-4 sm:p-6">
					<div className="mx-auto max-w-4xl">
						<FlashcardCard
							question={currentCard}
							cardNumber={currentIndex + 1}
							totalCards={totalCards}
							isGuest={isGuest}
							onFlip={handleCardFlipped}
                            onNext={handleNext}
                            onPrevious={handlePrevious}
                            canGoNext={currentIndex < totalCards - 1}
                            canGoPrevious={currentIndex > 0}
						/>
					</div>
				</div>

				{/* Navigation */}
				<FlashcardNavigation
					currentIndex={currentIndex}
					totalCards={totalCards}
					isLastCard={isLastCard}
					onPrevious={handlePrevious}
					onNext={handleNext}
					onComplete={() => setIsComplete(true)}
				/>
			</div>
		</div>
	);
}
