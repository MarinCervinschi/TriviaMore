import { ChevronLeft, ChevronRight, Grid3X3 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

interface FlashcardNavigationProps {
	currentIndex: number;
	totalCards: number;
	onPrevious: () => void;
	onNext: () => void;
	onJumpToCard: (index: number) => void;
	studiedCards: Set<number>;
}

export function FlashcardNavigation({
	currentIndex,
	totalCards,
	onPrevious,
	onNext,
	onJumpToCard,
	studiedCards,
}: FlashcardNavigationProps) {
	const isFirstCard = currentIndex === 0;
	const isLastCard = currentIndex === totalCards - 1;

	return (
		<div className="mt-8 flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
			{/* Navigazione principale */}
			<div className="flex items-center space-x-4">
				<Button
					variant="outline"
					size="lg"
					onClick={onPrevious}
					disabled={isFirstCard}
					className="border-purple-200 bg-white/80 backdrop-blur-sm hover:bg-purple-50 dark:border-purple-700 dark:bg-gray-900/80 dark:hover:bg-purple-900/50"
				>
					<ChevronLeft className="mr-2 h-4 w-4" />
					Precedente
				</Button>

				<div className="px-4 text-center">
					<div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
						{currentIndex + 1}
					</div>
					<div className="text-sm text-gray-600 dark:text-gray-300">
						di {totalCards}
					</div>
				</div>

				<Button
					size="lg"
					onClick={onNext}
					className="bg-purple-600 text-white shadow-lg hover:bg-purple-700"
				>
					{isLastCard ? "Completa" : "Successiva"}
					<ChevronRight className="ml-2 h-4 w-4" />
				</Button>
			</div>

			{/* Grid di navigazione rapida */}
			<Dialog>
				<DialogTrigger asChild>
					<Button
						variant="outline"
						size="sm"
						className="border-purple-200 bg-white/80 backdrop-blur-sm hover:bg-purple-50 dark:border-purple-700 dark:bg-gray-900/80 dark:hover:bg-purple-900/50"
					>
						<Grid3X3 className="mr-2 h-4 w-4" />
						Vai a carta
					</Button>
				</DialogTrigger>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>Seleziona una carta</DialogTitle>
					</DialogHeader>
					<div className="grid grid-cols-5 gap-2 p-4">
						{Array.from({ length: totalCards }, (_, index) => (
							<Button
								key={index}
								variant={index === currentIndex ? "default" : "outline"}
								size="sm"
								onClick={() => onJumpToCard(index)}
								className={`aspect-square p-0 ${
									studiedCards.has(index)
										? "border-green-300 bg-green-100 text-green-700 hover:bg-green-200 dark:border-green-700 dark:bg-green-900/50 dark:text-green-300"
										: index === currentIndex
											? "bg-purple-600 text-white"
											: ""
								}`}
							>
								{index + 1}
							</Button>
						))}
					</div>
					<div className="flex items-center justify-center space-x-4 pb-2 text-sm text-gray-600 dark:text-gray-300">
						<div className="flex items-center space-x-1">
							<div className="h-3 w-3 rounded bg-purple-600"></div>
							<span>Attuale</span>
						</div>
						<div className="flex items-center space-x-1">
							<div className="h-3 w-3 rounded border border-green-300 bg-green-100 dark:border-green-700 dark:bg-green-900/50"></div>
							<span>Studiata</span>
						</div>
						<div className="flex items-center space-x-1">
							<div className="h-3 w-3 rounded border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-800"></div>
							<span>Non vista</span>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
