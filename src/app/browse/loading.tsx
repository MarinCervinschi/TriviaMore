import { Skeleton } from "@/components/ui/skeleton";

export default function BrowseLoadingPage() {
	return (
		<div className="min-h-[calc(100vh-200px)] bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
			<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				{/* Hero Section Skeleton */}
				<div className="mb-8 rounded-2xl border border-gray-100 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800">
					<div className="text-center">
						{/* Icon Skeleton */}
						<div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
							<Skeleton className="h-8 w-8 rounded-full" />
						</div>

						{/* Title Skeleton */}
						<div className="mb-4">
							<Skeleton className="mx-auto h-10 w-80 max-w-full" />
						</div>

						{/* Description Skeleton */}
						<div className="mx-auto max-w-2xl space-y-2">
							<Skeleton className="mx-auto h-6 w-full" />
							<Skeleton className="mx-auto h-6 w-3/4" />
						</div>
					</div>
				</div>

				{/* Stats Section Skeleton */}
				<div className="mb-12 flex justify-center">
					<div className="rounded-2xl border border-gray-100 bg-white px-8 py-4 shadow-lg dark:border-gray-700 dark:bg-gray-800">
						<div className="flex items-center space-x-8">
							{/* First Stat */}
							<div className="text-center">
								<Skeleton className="mx-auto mb-2 h-8 w-12" />
								<Skeleton className="h-4 w-20" />
							</div>

							{/* Divider */}
							<div className="h-8 w-px bg-gray-200 dark:bg-gray-600"></div>

							{/* Second Stat */}
							<div className="text-center">
								<Skeleton className="mx-auto mb-2 h-8 w-12" />
								<Skeleton className="h-4 w-20" />
							</div>
						</div>
					</div>
				</div>

				{/* Department Grid Skeleton */}
				<div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
					{/* Generate 6 skeleton cards */}
					{Array.from({ length: 6 }).map((_, index) => (
						<DepartmentCardSkeleton key={index} />
					))}
				</div>
			</div>
		</div>
	);
}

function DepartmentCardSkeleton() {
	return (
		<div className="group relative">
			<div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800">
				{/* Header */}
				<div className="mb-6 flex items-start justify-between">
					<div className="flex-1">
						{/* Title */}
						<div className="mb-2">
							<Skeleton className="h-6 w-48" />
						</div>

						{/* Code Badge */}
						<Skeleton className="h-6 w-16 rounded-full" />
					</div>

					{/* Arrow Icon */}
					<Skeleton className="h-5 w-5 rounded" />
				</div>

				{/* Description */}
				<div className="mb-6 space-y-2">
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-3/4" />
				</div>

				{/* Footer */}
				<div className="flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-700">
					{/* Course Count */}
					<div className="flex items-center space-x-2">
						<Skeleton className="h-4 w-4 rounded" />
						<Skeleton className="h-4 w-16" />
					</div>

					{/* Department Badge */}
					<Skeleton className="h-6 w-20 rounded-full" />
				</div>
			</div>
		</div>
	);
}
