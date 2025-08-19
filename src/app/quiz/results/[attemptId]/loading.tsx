import { AppLayout } from "@/components/layouts/AppLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { auth } from "@/lib/auth";

export default async function QuizResultsLoadingPage() {
	const session = await auth();
	return (
		<AppLayout user={session?.user}>
			<div className="container mx-auto max-w-4xl px-4 py-8">
				<div className="space-y-6">
					{/* Header Skeleton */}
					<div className="text-center">
						<div className="mb-4 flex items-center justify-center">
							<Skeleton className="mr-2 h-8 w-8" />
							<Skeleton className="h-9 w-64" />
						</div>
						<Skeleton className="mx-auto h-6 w-48" />
					</div>

					{/* Main Results Card Skeleton */}
					<div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
						{/* Card Header */}
						<div className="border-b border-gray-200 p-6 dark:border-gray-700">
							<div className="flex items-center justify-between">
								<Skeleton className="h-6 w-32" />
								<Skeleton className="h-5 w-20 rounded-full" />
							</div>
						</div>

						{/* Card Content */}
						<div className="p-6">
							<div className="grid grid-cols-1 gap-6 md:grid-cols-4">
								{/* Percentage */}
								<div className="text-center">
									<Skeleton className="mx-auto mb-2 h-10 w-16" />
									<Skeleton className="mx-auto h-4 w-20" />
								</div>
								{/* Correct Answers */}
								<div className="text-center">
									<Skeleton className="mx-auto mb-2 h-10 w-12" />
									<Skeleton className="mx-auto h-4 w-24" />
								</div>
								{/* Total Points */}
								<div className="text-center">
									<Skeleton className="mx-auto mb-2 h-10 w-12" />
									<Skeleton className="mx-auto h-4 w-20" />
								</div>
								{/* Time Spent */}
								<div className="text-center">
									<div className="flex items-center justify-center">
										<Skeleton className="mr-1 h-6 w-6" />
										<Skeleton className="h-10 w-16" />
									</div>
									<Skeleton className="mx-auto mt-2 h-4 w-24" />
								</div>
							</div>
						</div>
					</div>

					{/* Evaluation Mode Card Skeleton */}
					<div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
						<div className="border-b border-gray-200 p-6 dark:border-gray-700">
							<Skeleton className="h-6 w-40" />
						</div>
						<div className="p-6">
							<div className="mb-4 flex items-center justify-between">
								<Skeleton className="h-4 w-20" />
								<Skeleton className="h-5 w-24 rounded-full" />
							</div>
							<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
								{Array.from({ length: 3 }).map((_, index) => (
									<div key={index} className="rounded-lg border p-3 text-center">
										<Skeleton className="mx-auto mb-2 h-6 w-8" />
										<Skeleton className="mx-auto h-3 w-24" />
									</div>
								))}
							</div>
						</div>
					</div>

					{/* Detailed Review Card Skeleton */}
					<div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
						<div className="border-b border-gray-200 p-6 dark:border-gray-700">
							<Skeleton className="mb-2 h-6 w-36" />
							<div className="flex items-center space-x-4">
								<div className="flex items-center">
									<Skeleton className="mr-1 h-3 w-3 rounded-full" />
									<Skeleton className="h-4 w-16" />
								</div>
								<div className="flex items-center">
									<Skeleton className="mr-1 h-3 w-3 rounded-full" />
									<Skeleton className="h-4 w-20" />
								</div>
								<div className="flex items-center">
									<Skeleton className="mr-1 h-3 w-3 rounded-full" />
									<Skeleton className="h-4 w-16" />
								</div>
							</div>
						</div>
						<div className="p-6">
							<div className="space-y-6">
								{/* Generate multiple question skeletons */}
								{Array.from({ length: 5 }).map((_, index) => (
									<QuestionResultSkeleton key={index} />
								))}
							</div>
						</div>
					</div>

					{/* Action Buttons Skeleton */}
					<div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
						<Skeleton className="h-10 w-full sm:w-32" />
						<Skeleton className="h-10 w-full sm:w-40" />
					</div>
				</div>
			</div>
		</AppLayout>
	);
}

function QuestionResultSkeleton() {
	return (
		<div className="rounded-lg border bg-white p-6 dark:bg-gray-800">
			{/* Question Header */}
			<div className="mb-4 flex items-start justify-between">
				<div className="flex-1">
					<div className="mb-3 flex items-center gap-3">
						<Skeleton className="h-4 w-20" />
						<Skeleton className="h-5 w-16 rounded-full" />
					</div>
					<div className="space-y-2">
						<Skeleton className="h-5 w-full" />
						<Skeleton className="h-5 w-3/4" />
					</div>
				</div>
				<Skeleton className="mt-1 h-6 w-6 rounded-full" />
			</div>

			{/* Question Options */}
			<div className="space-y-3">
				<Skeleton className="h-4 w-32" />
				<div className="grid gap-2">
					{Array.from({ length: 4 }).map((_, optionIndex) => (
						<div
							key={optionIndex}
							className="flex items-center justify-between rounded-lg border-2 p-3"
						>
							<Skeleton className="h-4 flex-1" />
							<Skeleton className="h-4 w-4 rounded-full" />
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
