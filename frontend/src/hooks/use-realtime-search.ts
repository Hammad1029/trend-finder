/**
 * useRealtimeSearch Hook
 * 
 * Supabase Realtime subscription for live search updates
 */

"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

interface UseRealtimeSearchOptions {
    requestId: number;
    enabled?: boolean;
}

export function useRealtimeSearch(options: UseRealtimeSearchOptions) {
    const { requestId, enabled = true } = options;
    const queryClient = useQueryClient();
    const supabase = createClient();

    useEffect(() => {
        if (!enabled || !requestId) return;

        // Subscribe to product_clusters table changes for this request
        const channel = supabase
            .channel(`search-${requestId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "product_clusters",
                    filter: `request_id=eq.${requestId}`,
                },
                (payload) => {
                    console.log("New cluster inserted:", payload);
                    // Invalidate the search results query to refresh data
                    queryClient.invalidateQueries({ queryKey: ["search", requestId] });
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "product_clusters",
                    filter: `request_id=eq.${requestId}`,
                },
                (payload) => {
                    console.log("Cluster updated:", payload);
                    queryClient.invalidateQueries({ queryKey: ["search", requestId] });
                }
            )
            .subscribe((status) => {
                console.log(`Realtime subscription status: ${status}`);
            });

        // Cleanup subscription on unmount
        return () => {
            supabase.removeChannel(channel);
        };
    }, [requestId, enabled, queryClient, supabase]);
}

/**
 * useRealtimeHistory Hook
 * 
 * Subscribe to new search requests being created
 */
export function useRealtimeHistory() {
    const queryClient = useQueryClient();
    const supabase = createClient();

    useEffect(() => {
        const channel = supabase
            .channel("history-updates")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "requests",
                },
                () => {
                    // Refresh history when any request changes
                    queryClient.invalidateQueries({ queryKey: ["history"] });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [queryClient, supabase]);
}
