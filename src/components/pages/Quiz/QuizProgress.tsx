import { Progress } from "@/components/ui/progress";

interface QuizProgressProps {
	current: number;
	total: number;
	progress: number;
}

export function QuizProgress({ current, total, progress }: QuizProgressProps) {
	return (
		<div className="border-b bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800 sm:px-6">
			<div className="flex items-center justify-between">
				<span className="text-sm font-medium text-gray-900 dark:text-white">
					Domanda {current} di {total}
				</span>
				<span className="text-sm text-gray-600 dark:text-gray-400">
					{Math.round(progress)}% completato
				</span>
			</div>
			<div className="mt-2">
				<Progress value={progress} className="h-2" />
			</div>
		</div>
	);
}
