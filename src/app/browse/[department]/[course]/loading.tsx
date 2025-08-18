import { Skeleton } from "@/components/ui/skeleton";

export default function CourseLoadingPage() {
	return (
		<div className="min-h-[calc(100vh-200px)] bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
			<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				{/* Breadcrumb Skeleton */}
				<div className="mb-8">
					<div className="flex items-center space-x-2">
						<Skeleton className="h-4 w-4" />
						<Skeleton className="h-4 w-1" />
						<Skeleton className="h-4 w-32" />
						<Skeleton className="h-4 w-1" />
						<Skeleton className="h-4 w-40" />
					</div>
				</div>

				{/* Course Header Skeleton */}
				<div className="mb-8 rounded-2xl border border-gray-100 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800">
					<div className="flex flex-col md:flex-row md:items-start md:justify-between">
						<div className="mb-6 flex-1 md:mb-0">
							{/* Icon, Title and Code */}
							<div className="mb-4 flex items-center space-x-3">
								<div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
									<Skeleton className="h-6 w-6" />
								</div>
								<div className="space-y-2">
									<Skeleton className="h-8 w-72" />
									<div className="flex items-center space-x-2">
										<Skeleton className="h-5 w-20" />
										<Skeleton className="h-5 w-32 rounded-full" />
									</div>
								</div>
							</div>

							{/* Description */}
							<div className="max-w-3xl space-y-2">
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-4 w-2/3" />
							</div>

							{/* Add Course Button (for logged users) */}
							<div className="mt-4">
								<Skeleton className="h-9 w-40" />
							</div>
						</div>

						{/* Stats Card */}
						<div className="rounded-xl bg-gray-50 p-4 text-center dark:bg-gray-700">
							<Skeleton className="mx-auto mb-2 h-8 w-8" />
							<Skeleton className="h-4 w-24" />
						</div>
					</div>
				</div>

				{/* Filters Section Skeleton */}
				<div className="mb-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
					<div className="mb-4 flex items-center justify-between">
						<Skeleton className="h-6 w-32" />
						<Skeleton className="h-8 w-20 md:hidden" />
					</div>
					<div className="space-y-4">
						<div className="flex flex-col gap-4 md:flex-row">
							{/* Search Input */}
							<div className="flex-1">
								<div className="flex gap-2">
									<Skeleton className="h-10 flex-1" />
									<Skeleton className="h-10 w-16" />
								</div>
							</div>
							{/* Year Filter */}
							<Skeleton className="h-10 w-full md:w-48" />
						</div>
					</div>
				</div>

				{/* Classes Section Skeleton */}
				<div className="space-y-12">
					{/* First Year Section */}
					<div>
						<div className="mb-6 flex items-center">
							<div className="rounded-lg bg-gray-100 px-4 py-2 dark:bg-gray-700">
								<Skeleton className="h-6 w-16" />
							</div>
							<div className="ml-4">
								<Skeleton className="h-4 w-20" />
							</div>
						</div>
						<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
							{Array.from({ length: 3 }).map((_, index) => (
								<ClassCardSkeleton key={`year1-${index}`} />
							))}
						</div>
					</div>

					{/* Second Year Section */}
					<div>
						<div className="mb-6 flex items-center">
							<div className="rounded-lg bg-gray-100 px-4 py-2 dark:bg-gray-700">
								<Skeleton className="h-6 w-16" />
							</div>
							<div className="ml-4">
								<Skeleton className="h-4 w-20" />
							</div>
						</div>
						<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
							{Array.from({ length: 2 }).map((_, index) => (
								<ClassCardSkeleton key={`year2-${index}`} />
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function ClassCardSkeleton() {
	return (
		<div className="group relative">
			<div className="rounded-xl border border-gray-100 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
				{/* Header */}
				<div className="mb-4 flex items-start justify-between">
					<div className="flex-1 space-y-2">
						<Skeleton className="h-5 w-48" />
						<Skeleton className="h-4 w-16" />
					</div>
					<Skeleton className="h-5 w-5" />
				</div>

				{/* Description */}
				<div className="mb-4 space-y-2">
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-2/3" />
				</div>

				{/* Footer */}
				<div className="flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-700">
					<div className="flex items-center space-x-2">
						<Skeleton className="h-4 w-4" />
						<Skeleton className="h-4 w-20" />
					</div>
					<Skeleton className="h-5 w-16 rounded-full" />
				</div>
			</div>
		</div>
	);
}
