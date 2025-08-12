import { Brain } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";

export function QuizLoader() {
	return (
		<div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
			{/* Sidebar Skeleton */}
			<div className="hidden w-80 border-r border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800 lg:block">
				<div className="mb-6">
					<Skeleton className="h-6 w-32" />
				</div>
				<div className="space-y-3">
					{Array.from({ length: 10 }).map((_, index) => (
						<div key={index} className="flex items-center space-x-3">
							<Skeleton className="h-8 w-8 rounded-full" />
							<Skeleton className="h-4 flex-1" />
						</div>
					))}
				</div>
			</div>

			{/* Main Content */}
			<div className="flex flex-1 flex-col">
				{/* Header Skeleton */}
				<div className="border-b border-gray-200 bg-white px-4 py-4 dark:border-gray-700 dark:bg-gray-800 sm:px-6">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-4">
							{/* Mobile menu button */}
							<Skeleton className="h-8 w-8 lg:hidden" />
							<div className="space-y-1">
								<Skeleton className="h-5 w-48" />
								<Skeleton className="h-4 w-32" />
							</div>
						</div>
						<div className="flex items-center space-x-4">
							{/* Timer */}
							<div className="flex items-center space-x-2">
								<Skeleton className="h-4 w-4" />
								<Skeleton className="h-4 w-16" />
							</div>
							{/* Exit button */}
							<Skeleton className="h-8 w-20" />
						</div>
					</div>
				</div>

				{/* Progress Skeleton */}
				<div className="border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800 sm:px-6">
					<div className="mb-2 flex items-center justify-between">
						<Skeleton className="h-4 w-32" />
						<Skeleton className="h-4 w-12" />
					</div>
					<Skeleton className="h-2 w-full rounded-full" />
				</div>

				{/* Question Content Skeleton */}
				<div className="flex-1 p-4 sm:p-6">
					<div className="mx-auto max-w-4xl">
						<div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
							{/* Question Header */}
							<div className="border-b border-gray-200 p-6 dark:border-gray-700">
								<div className="mb-2 flex items-center justify-between">
									<div className="flex items-center space-x-2">
										<Skeleton className="h-4 w-24" />
										<Skeleton className="h-5 w-16 rounded-full" />
									</div>
								</div>
								<div className="space-y-2">
									<Skeleton className="h-6 w-full" />
									<Skeleton className="h-6 w-3/4" />
									<Skeleton className="h-6 w-1/2" />
								</div>
							</div>

							{/* Question Options */}
							<div className="p-6">
								<div className="space-y-4">
									{Array.from({ length: 4 }).map((_, index) => (
										<div key={index} className="flex items-center space-x-3">
											<Skeleton className="h-5 w-5 rounded" />
											<Skeleton className="h-5 flex-1" />
										</div>
									))}
								</div>
							</div>
						</div>

						{/* Loading Message */}
						<div className="mt-8 text-center">
							<div className="mb-6 flex justify-center">
								<Brain className="h-12 w-12 animate-pulse text-blue-600 dark:text-blue-400" />
							</div>
							<h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
								Preparazione Quiz
							</h2>
							<p className="text-gray-600 dark:text-gray-400">
								Stiamo caricando le domande per te...
							</p>
						</div>
					</div>
				</div>

				{/* Navigation Skeleton */}
				<div className="border-t border-gray-200 bg-white px-4 py-4 dark:border-gray-700 dark:bg-gray-800 sm:px-6">
					<div className="flex items-center justify-between">
						<Skeleton className="h-10 w-24" />
						<Skeleton className="h-10 w-24" />
					</div>
				</div>
			</div>
		</div>
	);
}
