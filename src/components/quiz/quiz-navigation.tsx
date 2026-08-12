import { AltArrowLeftIcon } from "@solar-icons/react/linear/alt-arrow-left";
import { AltArrowRightIcon } from "@solar-icons/react/linear/alt-arrow-right";
import { CheckCircleIcon } from "@solar-icons/react/linear/check-circle";

import { Spinner } from "@/components/icons";
import { Button } from "@/components/ui/button";

export function QuizNavigation({
	currentIndex,
	totalQuestions,
	onPrevious,
	onNext,
	onComplete,
	isCompleting = false,
}: {
	currentIndex: number;
	totalQuestions: number;
	onPrevious: () => void;
	onNext: () => void;
	onComplete: () => void;
	isCompleting?: boolean;
}) {
	const isFirst = currentIndex === 0;
	const isLast = currentIndex === totalQuestions - 1;

	return (
		<div className="border-border/50 bg-background flex items-center justify-between gap-2 border-t px-3 py-3 backdrop-blur-xl sm:px-4">
			<Button
				variant="outline"
				onClick={onPrevious}
				disabled={isFirst || isCompleting}
				className="text-sm sm:text-base"
			>
				<AltArrowLeftIcon className="h-4 w-4 sm:mr-1.5" />
				<span className="hidden sm:inline">Precedente</span>
			</Button>

			<Button
				onClick={onComplete}
				variant="default"
				disabled={isCompleting}
				aria-busy={isCompleting}
				className="text-sm shadow-sm transition-all sm:text-base"
			>
				{isCompleting ? (
					<>
						<Spinner className="mr-1.5" />
						<span className="hidden sm:inline">Completamento...</span>
						<span className="sm:hidden">Attendi</span>
					</>
				) : (
					<>
						<CheckCircleIcon className="mr-1.5 h-4 w-4" />
						<span className="hidden sm:inline">Completa quiz</span>
						<span className="sm:hidden">Completa</span>
					</>
				)}
			</Button>

			<Button
				variant="outline"
				onClick={onNext}
				disabled={isLast || isCompleting}
				className="text-sm sm:text-base"
			>
				<span className="hidden sm:inline">Successiva</span>
				<AltArrowRightIcon className="h-4 w-4 sm:ml-1.5" />
			</Button>
		</div>
	);
}
