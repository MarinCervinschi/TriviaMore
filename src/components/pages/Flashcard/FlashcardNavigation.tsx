import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

interface FlashcardNavigationProps {
	currentIndex: number;
	totalCards: number;
	isLastCard: boolean;
	onPrevious: () => void;
	onNext: () => void;
	onComplete: () => void;
}

export function FlashcardNavigation({
	currentIndex,
	totalCards,
	isLastCard,
	onPrevious,
	onNext,
	onComplete,
}: FlashcardNavigationProps) {
	const isFirstCard = currentIndex === 0;

	const handleNextClick = () => {
		if (isLastCard) {
			onComplete();
		} else {
			onNext();
		}
	};

	return (
		<div className="border-t bg-white px-4 py-4 dark:border-gray-700 dark:bg-gray-800 sm:px-6">
			<div className="flex items-center justify-between">
				<Button
					variant="outline"
					onClick={onPrevious}
					disabled={isFirstCard}
					className="flex items-center space-x-2"
				>
					<ChevronLeft className="h-4 w-4" />
					<span className="hidden sm:inline">Precedente</span>
				</Button>

				<div className="text-center">
					<div className="text-sm text-gray-600 dark:text-gray-300">
						{currentIndex + 1} di {totalCards}
					</div>
				</div>

				<Button onClick={handleNextClick} className="flex items-center space-x-2">
					<span className="hidden sm:inline">
						{isLastCard ? "Completa Studio" : "Successiva"}
					</span>
					<ChevronRight className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);
}
