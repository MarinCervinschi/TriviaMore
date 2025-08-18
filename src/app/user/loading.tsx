import { Skeleton } from "@/components/ui/skeleton";

export default function UserDashboardLoadingPage() {
	return (
		<div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
			{/* Header Skeleton */}
			<div className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 p-6">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center">
					<Skeleton className="h-20 w-20 rounded-full bg-white/20" />
					<div className="space-y-2">
						<Skeleton className="h-8 w-48 bg-white/20" />
						<Skeleton className="h-5 w-32 bg-white/20" />
						<div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
							<Skeleton className="h-4 w-40 bg-white/20" />
							<Skeleton className="h-4 w-32 bg-white/20" />
						</div>
					</div>
				</div>
			</div>

			{/* Stats Cards Skeleton */}
			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
				{Array.from({ length: 4 }).map((_, i) => (
					<div key={i} className="rounded-lg border p-6">
						<div className="flex items-center justify-between">
							<div className="space-y-2">
								<Skeleton className="h-4 w-24" />
								<Skeleton className="h-8 w-16" />
							</div>
							<Skeleton className="h-8 w-8 rounded-full" />
						</div>
					</div>
				))}
			</div>

			{/* Action Cards Skeleton */}
			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
				{Array.from({ length: 4 }).map((_, i) => (
					<div key={i} className="rounded-lg border">
						<div className="border-b p-6">
							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<Skeleton className="h-5 w-5" />
									<Skeleton className="h-5 w-32" />
								</div>
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-4 w-3/4" />
							</div>
						</div>
						<div className="p-6">
							<Skeleton className="h-10 w-full" />
						</div>
					</div>
				))}
			</div>

			{/* Recent Activity Skeleton */}
			<div className="rounded-lg border">
				<div className="border-b p-6">
					<div className="flex items-center justify-between">
						<div className="space-y-2">
							<Skeleton className="h-6 w-32" />
							<Skeleton className="h-4 w-48" />
						</div>
						<Skeleton className="h-9 w-24" />
					</div>
				</div>
				<div className="p-6">
					<div className="space-y-4">
						{Array.from({ length: 3 }).map((_, i) => (
							<div
								key={i}
								className="flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-gray-800"
							>
								<div className="flex items-center gap-3">
									<Skeleton className="h-8 w-8 rounded-full" />
									<div className="space-y-2">
										<Skeleton className="h-4 w-32" />
										<Skeleton className="h-3 w-48" />
										<Skeleton className="h-3 w-24" />
									</div>
								</div>
								<div className="flex items-center gap-3">
									<Skeleton className="h-6 w-12 rounded-full" />
									<Skeleton className="h-8 w-16" />
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Favorite Subjects Skeleton */}
			<div className="rounded-lg border">
				<div className="border-b p-6">
					<Skeleton className="mb-2 h-6 w-40" />
					<Skeleton className="h-4 w-64" />
				</div>
				<div className="p-6">
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
						{Array.from({ length: 6 }).map((_, i) => (
							<div
								key={i}
								className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
							>
								<Skeleton className="h-4 w-24" />
								<Skeleton className="h-5 w-16 rounded-full" />
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
