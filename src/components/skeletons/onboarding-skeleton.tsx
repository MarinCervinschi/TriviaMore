import { Skeleton } from "@/components/ui/skeleton";

import { SkeletonRoot, SkeletonText } from "./primitives";

export function OnboardingSkeleton() {
	return (
		<SkeletonRoot
			label="Caricamento…"
			className="container flex min-h-[70vh] items-center py-10"
		>
			<div className="mx-auto w-full max-w-2xl">
				<div className="bg-muted/40 border-border/60 rounded-2xl border p-1 shadow-xs">
					<div className="flex items-center gap-3 px-4 py-3">
						{[0, 1, 2].map(index => (
							<div key={index} className="flex flex-1 items-center gap-3">
								{index > 0 && <Skeleton className="h-px flex-1" />}
								<Skeleton className="size-7 rounded-full" />
								<SkeletonText width={96} />
							</div>
						))}
					</div>
					<div className="bg-card border-border/50 space-y-4 rounded-xl border p-5">
						<SkeletonText className="h-6" width={240} />
						<SkeletonText width={320} />
						<Skeleton className="h-10 w-full rounded-lg" />
						<div className="space-y-2">
							{Array.from({ length: 6 }, (_, index) => (
								<Skeleton key={index} className="h-10 w-full rounded-lg" />
							))}
						</div>
					</div>
					<div className="flex justify-end gap-2 px-4 py-3">
						<Skeleton className="h-10 w-28 rounded-lg" />
					</div>
				</div>
			</div>
		</SkeletonRoot>
	);
}
