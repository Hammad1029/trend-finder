/**
 * React Query Configuration
 * 
 * Provides QueryClient configuration and providers for server state management
 */

"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type ReactNode } from "react";

function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                // With SSR, we want to set a stale time to avoid refetching immediately
                staleTime: 1000 * 60 * 5, // 5 minutes
                refetchOnWindowFocus: false,
                retry: 1,
            },
        },
    });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
    if (typeof window === "undefined") {
        // Server: always make a new query client
        return makeQueryClient();
    } else {
        // Browser: make a new query client if we don't already have one
        // This prevents re-making the client on hot reloads
        if (!browserQueryClient) browserQueryClient = makeQueryClient();
        return browserQueryClient;
    }
}

interface QueryProviderProps {
    children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
    // NOTE: Avoid useState when initializing the query client if you don't
    //       have a suspense boundary between this and the code that may
    //       suspend because React will throw away the client on the initial
    //       render if it suspends and there is no boundary
    const [queryClient] = useState(() => getQueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}

// Export for use in hooks
export { getQueryClient };
