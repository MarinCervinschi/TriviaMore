import { Brain, Loader2 } from "lucide-react";

export function QuizLoader() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-100 to-green-400 dark:from-green-900/40 dark:to-green-700/40">
			<div className="space-y-6 text-center">
				<div className="flex justify-center">
					<div className="relative">
						<Brain className="h-16 w-16 text-green-600 dark:text-green-400" />
						<Loader2 className="absolute -right-2 -top-2 h-6 w-6 animate-spin text-green-500" />
					</div>
				</div>
				<div>
					<h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
						Preparazione Quiz
					</h2>
					<p className="text-gray-600 dark:text-gray-300">
						Stiamo caricando le domande del quiz...
					</p>
				</div>
			</div>
		</div>
	);
}
