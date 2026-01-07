/**
 * useSearchResults Hook
 * 
 * Query hook for fetching search results with polling
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import type { Cluster, ProductMetrics } from "@/lib/validations";

interface SearchCriteria {
    id: number;
    primaryKeywords: string;
    negativeKeywords: string;
    targetRegion: string;
    priceMin: number;
    priceMax: number;
    currency: string;
    verticalCategory: string;
    timeHorizonInMonths: number;
}

interface ClusterWithProducts extends Cluster {
    products: ProductMetrics[];
}

interface SearchResultsResponse {
    requestId: number;
    query: string;
    createdAt: string;
    status: "processing" | "completed" | "failed";
    searchCriteria: SearchCriteria | null;
    clusters: ClusterWithProducts[];
    totalClusters: number;
    totalProducts: number;
}

async function fetchSearchResults(requestId: number): Promise<SearchResultsResponse> {
    const response = await fetch(`/api/search/${requestId}`);

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch results");
    }

    return response.json();
}

interface UseSearchResultsOptions {
    enabled?: boolean;
    refetchInterval?: number | false;
}

export function useSearchResults(
    requestId: number,
    options: UseSearchResultsOptions = {}
) {
    const {
        enabled = true,
        refetchInterval = false,
    } = options;

    return useQuery({
        queryKey: ["search", requestId],
        queryFn: () => fetchSearchResults(requestId),
        enabled: enabled && !!requestId,
        refetchInterval: (query) => {
            // Stop polling once completed
            if (query.state.data?.status === "completed") {
                return false;
            }
            if (query.state.data?.status === "failed") {
                return false;
            }
            return refetchInterval;
        },
        staleTime: 1000 * 30, // 30 seconds
    });
}

// Export types for use in components
export type { SearchResultsResponse, ClusterWithProducts, SearchCriteria };
