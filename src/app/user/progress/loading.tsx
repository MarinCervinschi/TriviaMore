import { Skeleton } from "@/components/ui/skeleton";

export default function UserProgressLoadingPage() {
	return (
		<div className="container mx-auto space-y-8 px-4 py-8">
			{/* Breadcrumb Skeleton */}
			<nav className="flex items-center space-x-2">
				<Skeleton className="h-4 w-4" />
				<Skeleton className="h-4 w-20" />
				<Skeleton className="h-4 w-4" />
				<Skeleton className="h-4 w-16" />
			</nav>

			{/* Header Skeleton */}
			<div>
				<Skeleton className="mb-2 h-8 w-48" />
				<Skeleton className="h-5 w-80" />
			</div>

			{/* Stats Cards Skeleton */}
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
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

			{/* Tabs Skeleton */}
			<div className="space-y-6">
				<div className="flex space-x-1 rounded-lg bg-muted p-1">
					{Array.from({ length: 3 }).map((_, i) => (
						<Skeleton key={i} className="h-9 flex-1" />
					))}
				</div>

				{/* Charts Skeleton */}
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
					{Array.from({ length: 2 }).map((_, i) => (
						<div key={i} className="rounded-lg border">
							<div className="border-b p-6">
								<Skeleton className="mb-2 h-6 w-48" />
								<Skeleton className="h-4 w-64" />
							</div>
							<div className="p-6">
								<Skeleton className="h-[300px] w-full" />
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
