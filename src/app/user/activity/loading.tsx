import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ActivityLoadingPage() {
	return (
		<div className="container mx-auto space-y-8 px-4 py-8">
			{/* Breadcrumb Skeleton */}
			<div className="flex items-center space-x-2">
				<Skeleton className="h-4 w-20" />
				<Skeleton className="h-4 w-4" />
				<Skeleton className="h-4 w-32" />
			</div>

			{/* Header Skeleton */}
			<div className="space-y-2">
				<Skeleton className="h-8 w-64" />
				<Skeleton className="h-4 w-96" />
			</div>

			{/* Statistics Cards Skeleton */}
			<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
				{Array.from({ length: 3 }).map((_, i) => (
					<Card key={i}>
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div className="space-y-2">
									<Skeleton className="h-4 w-24" />
									<Skeleton className="h-8 w-16" />
								</div>
								<Skeleton className="h-8 w-8 rounded-full" />
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Activities List Skeleton */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<Skeleton className="h-6 w-48" />
						<Skeleton className="h-6 w-20" />
					</div>
				</CardHeader>
				<CardContent className="space-y-6">
					{Array.from({ length: 3 }).map((_, dateIndex) => (
						<div key={dateIndex} className="space-y-4">
							<Skeleton className="h-6 w-64 border-b pb-2" />
							<div className="space-y-3">
								{Array.from({ length: 4 }).map((_, activityIndex) => (
									<div
										key={activityIndex}
										className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
									>
										<div className="flex-1 space-y-2">
											<div className="flex items-center gap-2">
												<Skeleton className="h-5 w-32" />
												<Skeleton className="h-5 w-16" />
											</div>
											<Skeleton className="h-4 w-80" />
											<div className="flex items-center gap-4">
												<Skeleton className="h-4 w-20" />
												<Skeleton className="h-4 w-24" />
												<Skeleton className="h-4 w-16" />
											</div>
										</div>
										<div className="flex items-center gap-3">
											<Skeleton className="h-6 w-12" />
											<Skeleton className="h-8 w-24" />
										</div>
									</div>
								))}
							</div>
						</div>
					))}
				</CardContent>
			</Card>

			{/* Pagination Skeleton */}
			<div className="flex items-center justify-between border-t bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-900 sm:px-6">
				<Skeleton className="h-4 w-48" />
				<div className="flex items-center space-x-2">
					{Array.from({ length: 7 }).map((_, i) => (
						<Skeleton key={i} className="h-8 w-8" />
					))}
				</div>
			</div>
		</div>
	);
}
