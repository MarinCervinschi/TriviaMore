import { Skeleton } from "@/components/ui/skeleton";

export default function SectionCardSkeleton() {
	return (
		<div className="group relative">
			<div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
				{/* Header */}
				<div className="mb-4 flex items-start justify-between">
					<div className="flex-1 space-y-2">
						<Skeleton className="h-5 w-48" />
						<Skeleton className="h-4 w-24 rounded-full" />
					</div>
					<Skeleton className="h-5 w-5" />
				</div>

				{/* Description */}
				<div className="mb-4 space-y-2">
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-3/4" />
				</div>

				{/* Footer */}
				<div className="flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-700">
					<div className="flex items-center space-x-2">
						<Skeleton className="h-4 w-4" />
						<Skeleton className="h-4 w-20" />
					</div>
					<Skeleton className="h-5 w-20 rounded-full" />
				</div>
			</div>
		</div>
	);
}
