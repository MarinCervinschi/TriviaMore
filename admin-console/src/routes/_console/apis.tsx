import { Suspense } from "react";

import { createFileRoute } from "@tanstack/react-router";

import { Skeleton } from "@/components/ui/skeleton";
import { useIsHydrated } from "@/hooks/useIsHydrated";
import { useTheme } from "@/hooks/useTheme";

import { SourcesExplorer, loadScalar } from "~/components/sources-explorer";

export const Route = createFileRoute("/_console/apis")({
	loader: () => {
		if (typeof window !== "undefined") void loadScalar();
	},
	head: () => ({ meta: [{ title: "API delle fonti · Console" }] }),
	component: SourceApisPage,
});

function SourceApisPage() {
	const hydrated = useIsHydrated();
	const { resolvedTheme } = useTheme();

	return (
		// Scalar sizes its sticky sidebar from --full-height: the panel below the console header, not the viewport.
		<div className="min-h-full [--full-height:calc(100svh-3rem)] md:[--full-height:calc(100svh-4rem)]">
			{hydrated ? (
				<Suspense fallback={<ExplorerSkeleton />}>
					<SourcesExplorer dark={resolvedTheme === "dark"} />
				</Suspense>
			) : (
				<ExplorerSkeleton />
			)}
		</div>
	);
}

function ExplorerSkeleton() {
	return (
		<div className="flex min-h-[var(--full-height)]">
			<div className="border-border/50 hidden w-72 shrink-0 space-y-3 border-r p-4 min-[1000px]:block">
				<Skeleton className="h-5 w-32" />
				<Skeleton className="h-8 w-full rounded-lg" />
				{Array.from({ length: 8 }, (_, index) => (
					<Skeleton key={index} className="h-4 w-4/5" />
				))}
			</div>
			<div className="min-w-0 flex-1 space-y-3 p-6">
				<Skeleton className="h-4 w-24" />
				<Skeleton className="h-7 w-56" />
				<Skeleton className="h-4 w-full max-w-xl" />
				<Skeleton className="h-4 w-full max-w-lg" />
				<Skeleton className="h-40 w-full max-w-2xl rounded-xl" />
			</div>
		</div>
	);
}
