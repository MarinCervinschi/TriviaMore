'use client'

import { QueryClient, QueryClientProvider, QueryClientConfig } from '@tanstack/react-query'
import { persistQueryClient } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { useState, useEffect, ReactNode } from 'react'

export default function ReactQueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(() => {
    const config: QueryClientConfig = {
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60 * 5, // 5 minutes
          gcTime: 1000 * 60 * 60 * 24, // 24 hours
          retry: 1,
        },
      },
    }
    return new QueryClient(config)
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const localStoragePersister = createSyncStoragePersister({
        storage: window.localStorage,
      });

      persistQueryClient({
        queryClient: client,
        persister: localStoragePersister,
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
      });
    }
  }, [client]);

  return (
    <QueryClientProvider client={client}>
      {children}
    </QueryClientProvider>
  );
}