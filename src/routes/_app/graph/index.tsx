import { Suspense, lazy, useMemo, useState } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { GraphFilters } from "@/components/graph/graph-filters";
import { GraphPageSkeleton } from "@/components/skeletons";
import {
	type GraphFiltersState,
	computeFilterActives,
	createEmptyFiltersState,
} from "@/lib/browse/graph-filters";
import { browseQueries } from "@/lib/browse/queries";
import { seoHead } from "@/lib/seo";

const NetworkGraph = lazy(() =>
	import("@/components/graph/network-graph").then(m => ({
		default: m.NetworkGraph,
	}))
);

export const Route = createFileRoute("/_app/graph/")({
	loader: ({ context }) => context.queryClient.ensureQueryData(browseQueries.graph()),
	head: () =>
		seoHead({
			title: "Mappa dei contenuti",
			description:
				"Esplora interattivamente la rete di dipartimenti e corsi UniMore disponibili su TriviaMore.",
			path: "/graph",
		}),
	pendingComponent: GraphPageSkeleton,
	component: GraphPage,
});

function GraphPage() {
	const { data } = useSuspenseQuery(browseQueries.graph());
	const [filters, setFilters] = useState<GraphFiltersState>(() =>
		createEmptyFiltersState()
	);

	const counts = useMemo(() => computeFilterActives(data, filters), [data, filters]);

	const totalCounts = useMemo(
		() => ({
			departments: data.departments.length,
			courses: data.courses.length,
		}),
		[data]
	);

	return (
		<div className="relative h-[calc(100vh-4rem)] w-full overflow-hidden">
			<header className="pointer-events-none absolute top-0 left-0 z-10 max-w-2xl p-6 sm:p-10">
				<p className="text-muted-foreground eyebrow">Mappa dei contenuti</p>
				<h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
					La rete UniMore su TriviaMore
				</h1>
				<p className="text-muted-foreground mt-2 text-sm sm:text-base">
					13 dipartimenti e 96 corsi collegati. Passa il mouse su un nodo per vederne i
					dettagli, clicca per fissare la selezione.
				</p>
			</header>

			<GraphFilters
				filters={filters}
				onChange={setFilters}
				visibleCounts={{
					departments: counts.deptCount,
					courses: counts.courseCount,
				}}
				totalCounts={totalCounts}
			/>

			<Suspense fallback={<GraphPageSkeleton />}>
				<NetworkGraph data={data} filters={filters} />
			</Suspense>
		</div>
	);
}
