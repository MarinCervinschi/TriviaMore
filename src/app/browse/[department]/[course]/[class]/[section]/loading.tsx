import { Skeleton } from "@/components/ui/skeleton";

export default function SectionLoadingPage() {
	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
			<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				{/* Breadcrumb Skeleton */}
				<div className="mb-8">
					<div className="flex items-center space-x-2">
						<Skeleton className="h-4 w-4" />
						<Skeleton className="h-4 w-1" />
						<Skeleton className="h-4 w-24" />
						<Skeleton className="h-4 w-1" />
						<Skeleton className="h-4 w-32" />
						<Skeleton className="h-4 w-1" />
						<Skeleton className="h-4 w-28" />
						<Skeleton className="h-4 w-1" />
						<Skeleton className="h-4 w-36" />
					</div>
				</div>

				{/* Header Section Skeleton */}
				<div className="mb-8">
					{/* Main Title */}
					<div className="mb-2">
						<Skeleton className="h-9 w-80 md:h-10" />
					</div>

					{/* Subtitle */}
					<div className="mb-4">
						<Skeleton className="h-6 w-96" />
					</div>

					{/* Description */}
					<div className="mb-6 max-w-3xl space-y-2">
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-3/4" />
					</div>

					{/* Status Tags */}
					<div className="flex items-center space-x-4">
						<Skeleton className="h-5 w-32" />
						<Skeleton className="h-6 w-24 rounded-full" />
					</div>
				</div>

				{/* Content Cards Section */}
				<div className="space-y-6">
					{/* Quiz Card Skeleton */}
					<QuizCardSkeleton />

					{/* Flashcard Card Skeleton */}
					<FlashcardCardSkeleton />
				</div>
			</div>
		</div>
	);
}

function QuizCardSkeleton() {
	return (
		<div className="rounded-lg border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-4 shadow-sm dark:border-green-800 dark:from-green-900/20 dark:to-emerald-900/20 sm:p-6">
			<div className="space-y-4">
				{/* Header */}
				<div>
					<div className="mb-2 flex items-center space-x-2">
						<Skeleton className="h-5 w-5" />
						<Skeleton className="h-6 w-24" />
					</div>

					{/* Description */}
					<div className="space-y-2">
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-3/4" />
						<Skeleton className="h-4 w-2/3" />
					</div>
				</div>

				{/* Actions */}
				<div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-x-3 sm:space-y-0">
					{/* Start Button */}
					<Skeleton className="h-10 w-full sm:w-32" />

					{/* Settings Info */}
					<div className="flex items-center space-x-1">
						<Skeleton className="h-3 w-3" />
						<Skeleton className="h-3 w-48" />
					</div>

					{/* Additional Info */}
					<div className="flex items-center space-x-1">
						<Skeleton className="h-3 w-3" />
						<Skeleton className="h-3 w-28" />
					</div>
				</div>
			</div>
		</div>
	);
}

function FlashcardCardSkeleton() {
	return (
		<div className="rounded-lg border border-purple-200 bg-gradient-to-r from-purple-50 to-violet-50 p-4 shadow-sm dark:border-purple-800 dark:from-purple-900/20 dark:to-violet-900/20 sm:p-6">
			<div className="space-y-4">
				{/* Header */}
				<div>
					<div className="mb-2 flex items-center space-x-2">
						<Skeleton className="h-5 w-5" />
						<Skeleton className="h-6 w-20" />
					</div>

					{/* Description */}
					<div className="space-y-2">
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-5/6" />
					</div>
				</div>

				{/* Actions */}
				<div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-x-3 sm:space-y-0">
					{/* Start Button */}
					<Skeleton className="h-10 w-full sm:w-40" />

					{/* Settings Info */}
					<div className="flex items-center space-x-1">
						<Skeleton className="h-3 w-3" />
						<Skeleton className="h-3 w-48" />
					</div>

					{/* Additional Info */}
					<div className="flex items-center space-x-1">
						<Skeleton className="h-3 w-3" />
						<Skeleton className="h-3 w-24" />
					</div>
				</div>
			</div>
		</div>
	);
}
