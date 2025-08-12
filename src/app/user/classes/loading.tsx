import { Skeleton } from "@/components/ui/skeleton";

export default function UserClassesLoadingPage() {
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

			{/* Stats Card Skeleton */}
			<div className="rounded-lg border p-6">
				<div className="flex items-center justify-between">
					<div className="space-y-2">
						<Skeleton className="h-4 w-24" />
						<Skeleton className="h-8 w-16" />
					</div>
					<Skeleton className="h-8 w-8 rounded-full" />
				</div>
			</div>

			{/* Classes Grid Skeleton */}
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{Array.from({ length: 6 }).map((_, i) => (
					<div key={i} className="rounded-lg border">
						<div className="border-b p-4">
							<div className="flex items-start justify-between">
								<div className="space-y-2">
									<Skeleton className="h-5 w-32" />
									<Skeleton className="h-4 w-24" />
								</div>
								<Skeleton className="h-6 w-16 rounded-full" />
							</div>
						</div>
						<div className="space-y-3 p-4">
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-3/4" />
							<div className="flex items-center justify-between pt-2">
								<Skeleton className="h-4 w-20" />
								<Skeleton className="h-8 w-20" />
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
