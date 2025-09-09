"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";

import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";

import Loader from "@/components/Common/Loader";

export function ReactQueryProviders({ children }: { children: ReactNode }) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 1000 * 60 * 60, // 1 ora
						gcTime: 1000 * 60 * 60 * 24 * 7, // 1 settimana
					},
				},
			})
	);

	const [isHydrated, setIsHydrated] = useState(false);

	useEffect(() => {
		if (typeof window !== "undefined") {
			const persister = createAsyncStoragePersister({
				storage: window.localStorage,
				key: "PERSISTENT_QUERY_CACHE",
				throttleTime: 1000,
			});

			const [, persistPromise] = persistQueryClient({
				queryClient,
				persister,
				maxAge: 1000 * 60 * 60 * 24 * 7, // 1 settimana
				dehydrateOptions: {
					shouldDehydrateQuery: query =>
						query.gcTime !== 0 && !query.queryKey.includes("volatile"),
				},
			});

			persistPromise.then(() => {
				setIsHydrated(true);
			});
		} else {
			setIsHydrated(true);
		}
	}, [queryClient]);

	if (!isHydrated) {
		return <Loader />;
	}

	return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

export function useVolatileQuery<TQueryFnData = unknown, TError = Error>(options: any) {
	const modifiedOptions = useMemo(
		() => ({
			...options,
			queryKey: ["volatile", ...(options.queryKey || [])],
			staleTime: 1000 * 60 * 5, // 5 minuti
			gcTime: 1000 * 60 * 30, // 30 minuti
		}),
		[options]
	);

	return useQuery<TQueryFnData, TError>(modifiedOptions);
}
