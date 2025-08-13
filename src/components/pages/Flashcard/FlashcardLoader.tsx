import { Loader2, Zap } from "lucide-react";

export function FlashcardLoader() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20">
			<div className="space-y-6 text-center">
				<div className="flex justify-center">
					<div className="relative">
						<Zap className="h-16 w-16 text-purple-600 dark:text-purple-400" />
						<Loader2 className="absolute -right-2 -top-2 h-6 w-6 animate-spin text-purple-500" />
					</div>
				</div>
				<div>
					<h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
						Preparazione Flashcard
					</h2>
					<p className="text-gray-600 dark:text-gray-300">
						Stiamo caricando le tue carte di studio...
					</p>
				</div>
			</div>
		</div>
	);
}
