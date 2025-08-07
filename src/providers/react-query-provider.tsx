"use client";

import { ReactNode, useEffect, useMemo } from "react";

import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";

const persistentClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: Infinity,
			gcTime: 1000 * 60 * 60 * 24 * 7, // 1 settimana
		},
	},
});

export function ReactQueryProviders({ children }: { children: ReactNode }) {
	useEffect(() => {
		if (typeof window !== "undefined") {
			const persister = createSyncStoragePersister({
				storage: window.localStorage,
				key: "PERSISTENT_QUERY_CACHE",
				throttleTime: 1000,
			});

			persistQueryClient({
				queryClient: persistentClient,
				persister,
				maxAge: 1000 * 60 * 60 * 24 * 7, // 1 settimana
				dehydrateOptions: {
					shouldDehydrateQuery: query =>
						query.gcTime !== 0 && !query.queryKey.includes("volatile"),
				},
			});
		}
	}, []);

	return (
		<QueryClientProvider client={persistentClient}>{children}</QueryClientProvider>
	);
}

export function useVolatileQuery(options: any) {
	const modifiedOptions = useMemo(
		() => ({
			...options,
			queryKey: ["volatile", ...(options.queryKey || [])],
			staleTime: 1000 * 60 * 5, // 5 minuti
			gcTime: 1000 * 60 * 30, // 30 minuti
		}),
		[options]
	);

	return useQuery(modifiedOptions);
}
