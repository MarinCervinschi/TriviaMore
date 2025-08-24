import { useEffect } from "react";

import { CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

interface QuizNavigationProps {
	currentIndex: number;
	totalQuestions: number;
	isLastQuestion: boolean;
	onPrevious: () => void;
	onNext: () => void;
	onComplete: () => void;
}

export function QuizNavigation({
	currentIndex,
	totalQuestions,
	isLastQuestion,
	onPrevious,
	onNext,
	onComplete,
}: QuizNavigationProps) {
	const isFirstQuestion = currentIndex === 0;
	const isLastQuestionIndex = currentIndex === totalQuestions - 1;
	const canGoNext = !isLastQuestionIndex;
	const canGoPrevious = !isFirstQuestion;

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (
				event.target instanceof HTMLInputElement ||
				event.target instanceof HTMLTextAreaElement
			) {
				return;
			}

			switch (event.key) {
				case "ArrowLeft":
					event.preventDefault();
					if (canGoPrevious && onPrevious) {
						onPrevious();
					}
					break;
				case "ArrowRight":
					event.preventDefault();
					if (canGoNext && onNext) {
						onNext();
					}
					break;
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [canGoNext, canGoPrevious, onNext, onPrevious]);

	return (
		<div className="border-t bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800 sm:px-6">
			<div className="flex items-center justify-between">
				{/* Previous button */}
				<Button
					variant="outline"
					onClick={onPrevious}
					disabled={isFirstQuestion}
					className="flex items-center space-x-2"
				>
					<ChevronLeft className="h-4 w-4" />
					<span className="hidden sm:inline">Precedente</span>
				</Button>

				{/* Question counter */}
				<span className="text-sm text-gray-600 dark:text-gray-400">
					{currentIndex + 1} di {totalQuestions}
				</span>

				{/* Next/Complete button */}
				{isLastQuestion ? (
					<Button
						onClick={onComplete}
						className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
					>
						<CheckCircle className="h-4 w-4" />
						<span>Completa Quiz</span>
					</Button>
				) : (
					<Button onClick={onNext} className="flex items-center space-x-2">
						<span className="hidden sm:inline">Prossima</span>
						<ChevronRight className="h-4 w-4" />
					</Button>
				)}
			</div>
		</div>
	);
}
