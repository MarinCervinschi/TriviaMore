import { Skeleton } from "@/components/ui/skeleton";

export default function UserSettingsLoadingPage() {
	return (
		<div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
			{/* Breadcrumb Skeleton */}
			<nav className="flex items-center space-x-2">
				<Skeleton className="h-4 w-4" />
				<Skeleton className="h-4 w-20" />
				<Skeleton className="h-4 w-4" />
				<Skeleton className="h-4 w-20" />
			</nav>

			{/* Header Skeleton */}
			<div>
				<Skeleton className="mb-2 h-8 w-48" />
				<Skeleton className="h-5 w-80" />
			</div>

			{/* Settings Form Skeleton */}
			<div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
				{/* Profile Section */}
				<div className="space-y-6 lg:col-span-2">
					<div className="rounded-lg border p-6">
						<div className="space-y-4">
							<Skeleton className="h-6 w-32" />
							<div className="flex items-center space-x-4">
								<Skeleton className="h-20 w-20 rounded-full" />
								<div className="space-y-2">
									<Skeleton className="h-4 w-48" />
									<Skeleton className="h-9 w-32" />
								</div>
							</div>
						</div>
					</div>

					<div className="rounded-lg border p-6">
						<div className="space-y-4">
							<Skeleton className="h-6 w-40" />
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<div className="space-y-2">
									<Skeleton className="h-4 w-16" />
									<Skeleton className="h-10 w-full" />
								</div>
								<div className="space-y-2">
									<Skeleton className="h-4 w-12" />
									<Skeleton className="h-10 w-full" />
								</div>
							</div>
							<div className="space-y-2">
								<Skeleton className="h-4 w-20" />
								<Skeleton className="h-10 w-full" />
							</div>
						</div>
					</div>
				</div>

				{/* Sidebar */}
				<div className="space-y-6">
					<div className="rounded-lg border p-6">
						<div className="space-y-4">
							<Skeleton className="h-6 w-24" />
							<div className="space-y-3">
								{Array.from({ length: 3 }).map((_, i) => (
									<div key={i} className="flex items-center justify-between">
										<Skeleton className="h-4 w-32" />
										<Skeleton className="h-6 w-12" />
									</div>
								))}
							</div>
						</div>
					</div>

					<div className="rounded-lg border p-6">
						<div className="space-y-4">
							<Skeleton className="h-6 w-28" />
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-9 w-full" />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
