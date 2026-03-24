import { type ReactNode, useEffect, useMemo, useState } from "react"

import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister"
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query"
import { persistQueryClient } from "@tanstack/react-query-persist-client"

const ONE_HOUR = 1000 * 60 * 60
const ONE_WEEK = ONE_HOUR * 24 * 7

export function ReactQueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: ONE_HOUR,
            gcTime: ONE_WEEK,
          },
        },
      }),
  )

  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") {
      setIsHydrated(true)
      return
    }

    const persister = createAsyncStoragePersister({
      storage: window.localStorage,
      key: "PERSISTENT_QUERY_CACHE",
      throttleTime: 1000,
    })

    const [, persistPromise] = persistQueryClient({
      queryClient,
      persister,
      maxAge: ONE_WEEK,
      dehydrateOptions: {
        shouldDehydrateQuery: (query) =>
          query.gcTime !== 0 && !query.queryKey.includes("volatile"),
      },
    })

    persistPromise.then(() => setIsHydrated(true))
  }, [queryClient])

  if (!isHydrated) return null

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

export function useVolatileQuery<TData = unknown, TError = Error>(
  options: Parameters<typeof useQuery<TData, TError>>[0],
) {
  const modifiedOptions = useMemo(
    () => ({
      ...options,
      queryKey: ["volatile", ...(options.queryKey ?? [])],
      staleTime: 1000 * 60 * 5, // 5 min
      gcTime: 1000 * 60 * 30, // 30 min
    }),
    [options],
  )

  return useQuery<TData, TError>(modifiedOptions)
}
