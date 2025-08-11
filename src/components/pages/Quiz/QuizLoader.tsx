import { Brain } from "lucide-react";

import Loader from "@/components/Common/Loader";

export function QuizLoader() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
			<div className="text-center">
				<div className="mb-6 flex justify-center">
					<Brain className="h-12 w-12 text-blue-600 dark:text-blue-400" />
				</div>
				<h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
					Preparazione Quiz
				</h2>
				<p className="mb-6 text-gray-600 dark:text-gray-400">
					Stiamo caricando le domande per te...
				</p>
				<Loader />
			</div>
		</div>
	);
}
