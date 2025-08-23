import SectionCardSkeleton from "@/components/pages/Browse/Section/SectionCardSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function ClassLoadingPage() {
	return (
		<div className="min-h-screen bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
			<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				{/* Breadcrumb Skeleton */}
				<div className="mb-8">
					<div className="flex items-center space-x-2">
						<Skeleton className="h-4 w-4" />
						<Skeleton className="h-4 w-1" />
						<Skeleton className="h-4 w-28" />
						<Skeleton className="h-4 w-1" />
						<Skeleton className="h-4 w-36" />
						<Skeleton className="h-4 w-1" />
						<Skeleton className="h-4 w-32" />
					</div>
				</div>

				{/* Class Header Skeleton */}
				<div className="mb-8">
					<div className="flex items-start justify-between">
						<div className="flex-1">
							{/* Badges */}
							<div className="mb-4 flex flex-wrap items-center gap-3">
								<Skeleton className="h-6 w-16 rounded-full" />
								<Skeleton className="h-6 w-12 rounded-full" />
								<Skeleton className="h-6 w-20 rounded-full" />
							</div>

							{/* Title */}
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

							{/* Stats */}
							<div className="flex flex-wrap gap-6">
								<div className="flex items-center space-x-2">
									<Skeleton className="h-5 w-5" />
									<Skeleton className="h-4 w-20" />
								</div>
								<div className="flex items-center space-x-2">
									<Skeleton className="h-5 w-5" />
									<Skeleton className="h-4 w-24" />
								</div>
								<div className="flex items-center space-x-2">
									<Skeleton className="h-5 w-5" />
									<Skeleton className="h-4 w-16" />
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Exam Simulation Button Skeleton */}
				<div className="mb-8">
					<div className="rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 shadow-sm dark:border-blue-800 dark:from-blue-900/20 dark:to-indigo-900/20 sm:p-6">
						<div className="space-y-4">
							{/* Header */}
							<div>
								<div className="mb-2 flex items-center space-x-2">
									<Skeleton className="h-5 w-5" />
									<Skeleton className="h-6 w-32" />
								</div>

								{/* Description */}
								<div className="space-y-2">
									<Skeleton className="h-4 w-full" />
									<Skeleton className="h-4 w-full" />
									<Skeleton className="h-4 w-3/4" />
								</div>
							</div>

							{/* Notice for logged users */}
							<div className="rounded-lg bg-orange-50 p-3 dark:bg-orange-900/20">
								<div className="flex items-start space-x-3">
									<Skeleton className="mt-0.5 h-4 w-4 flex-shrink-0" />
									<div className="min-w-0 flex-1 space-y-1">
										<Skeleton className="h-4 w-32" />
										<Skeleton className="h-3 w-64" />
									</div>
								</div>
							</div>

							{/* Actions */}
							<div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-x-3 sm:space-y-0">
								<Skeleton className="h-10 w-full sm:w-40" />
								<Skeleton className="h-9 w-full sm:w-32" />
								<div className="flex items-center space-x-1">
									<Skeleton className="h-3 w-3" />
									<Skeleton className="h-3 w-32" />
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Filters Section Skeleton */}
				<div className="mb-8 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
					<div className="flex items-center justify-between">
						<div className="flex-1">
							<Skeleton className="h-10 w-full max-w-md" />
						</div>
						<div className="ml-4">
							<Skeleton className="h-4 w-24" />
						</div>
					</div>
				</div>

				{/* Sections Grid Skeleton */}
				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{Array.from({ length: 6 }).map((_, index) => (
						<SectionCardSkeleton key={index} />
					))}
				</div>
			</div>
		</div>
	);
}
