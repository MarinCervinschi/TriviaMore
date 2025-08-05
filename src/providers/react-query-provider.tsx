'use client'

import {
    QueryClient,
    QueryClientProvider,
    useQuery
} from '@tanstack/react-query';
import {
    persistQueryClient
} from '@tanstack/react-query-persist-client';
import {
    createSyncStoragePersister
} from '@tanstack/query-sync-storage-persister';
import {
    createContext,
    useContext,
    ReactNode
} from 'react';

const VolatileQueryContext = createContext<QueryClient | undefined>(undefined);

const persistentClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: Infinity,
            gcTime: 1000 * 60 * 60 * 24 * 7, // 1 settimana
        },
    },
});

const volatileClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minuti
            gcTime: 1000 * 60 * 30, // 30 minuti
        },
    },
});

if (typeof window !== 'undefined') {
    const persister = createSyncStoragePersister({
        storage: window.localStorage,
        key: 'PERSISTENT_QUERY_CACHE', // Chiave personalizzata
        throttleTime: 1000, // Salva al massimo 1 volta al secondo
    });

    persistQueryClient({
        queryClient: persistentClient,
        persister,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 settimana
        dehydrateOptions: {
            shouldDehydrateQuery: (query) =>
                query.gcTime !== 0 && // Ignora query con gcTime: 0
                !query.queryKey.includes('volatile') // Filtra chiavi specifiche
        }
    });
}

export function ReactQueryProviders({ children }: { children: ReactNode }) {
    return (
        <QueryClientProvider client={persistentClient}>
            <VolatileQueryContext.Provider value={volatileClient}>
                {children}
            </VolatileQueryContext.Provider>
        </QueryClientProvider>
    );
}

export function useVolatileQuery(options: any) {
    const client = useContext(VolatileQueryContext);

    if (!client) {
        throw new Error('useVolatileQuery must be used within ReactQueryProviders');
    }

    return useQuery({
        ...options,
        client,
        queryKey: ['volatile', ...(options.queryKey || [])],
    });
}