import { CheckCircle, Circle } from "lucide-react";

import { Progress } from "@/components/ui/progress";

interface FlashcardProgressProps {
	currentIndex: number;
	totalCards: number;
	studiedCards: Set<number>;
}

export function FlashcardProgress({
	currentIndex,
	totalCards,
	studiedCards,
}: FlashcardProgressProps) {
	const progressPercentage = ((currentIndex + 1) / totalCards) * 100;
	const studiedPercentage = (studiedCards.size / totalCards) * 100;

	return (
		<div className="rounded-2xl border border-purple-100 bg-white/60 p-6 backdrop-blur-sm dark:border-purple-800 dark:bg-gray-900/60">
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<div>
						<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
							Progresso Studio
						</h3>
						<p className="text-sm text-gray-600 dark:text-gray-300">
							Carta {currentIndex + 1} di {totalCards}
						</p>
					</div>
					<div className="text-right">
						<div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
							{studiedCards.size}/{totalCards}
						</div>
						<p className="text-xs text-gray-600 dark:text-gray-300">Carte studiate</p>
					</div>
				</div>

				<div className="space-y-3">
					<div>
						<div className="mb-1 flex justify-between text-sm text-gray-600 dark:text-gray-300">
							<span>Progresso attuale</span>
							<span>{Math.round(progressPercentage)}%</span>
						</div>
						<Progress value={progressPercentage} className="h-2" />
					</div>

					<div>
						<div className="mb-1 flex justify-between text-sm text-gray-600 dark:text-gray-300">
							<span>Carte studiate</span>
							<span>{Math.round(studiedPercentage)}%</span>
						</div>
						<Progress value={studiedPercentage} className="h-2" />
					</div>
				</div>

				{/* Indicatori visivi delle carte */}
				<div className="flex flex-wrap gap-2 pt-2">
					{Array.from({ length: totalCards }, (_, index) => (
						<div
							key={index}
							className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-all duration-200 ${
								index === currentIndex
									? "scale-110 bg-purple-600 text-white shadow-lg"
									: studiedCards.has(index)
										? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300"
										: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
							}`}
						>
							{studiedCards.has(index) ? (
								<CheckCircle className="h-4 w-4" />
							) : index === currentIndex ? (
								index + 1
							) : (
								<Circle className="h-4 w-4" />
							)}
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
