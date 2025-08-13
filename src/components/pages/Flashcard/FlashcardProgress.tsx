import { Progress } from "@/components/ui/progress";

interface FlashcardProgressProps {
	current: number;
	total: number;
	progress: number;
}

export function FlashcardProgress({
	current,
	total,
	progress,
}: FlashcardProgressProps) {
	return (
		<div className="border-b bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800 sm:px-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-4">
					<span className="text-sm font-medium text-gray-900 dark:text-white">
						Flashcard {current} di {total}
					</span>
					<span className="text-sm text-gray-600 dark:text-gray-300">
						{Math.round(progress)}% completato
					</span>
				</div>
			</div>
			<div className="mt-2">
				<Progress value={progress} className="h-2" />
			</div>
		</div>
	);
}
