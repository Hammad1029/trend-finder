/**
 * useSearchHistory Hook
 * 
 * Query hook for fetching user's search history with pagination
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface SearchHistoryItem {
    id: number;
    query: string;
    createdAt: string;
    searchCriteria: {
        targetRegion: string;
        verticalCategory: string;
    } | null;
    clustersCount: number;
    productsCount: number;
    status: "processing" | "completed";
}

interface SearchHistoryResponse {
    history: SearchHistoryItem[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

async function fetchSearchHistory(
    page: number = 1,
    limit: number = 10
): Promise<SearchHistoryResponse> {
    const response = await fetch(`/api/history?page=${page}&limit=${limit}`);

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch history");
    }

    return response.json();
}

async function deleteSearchRequest(requestId: number): Promise<void> {
    const response = await fetch("/api/history", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete search");
    }
}

interface UseSearchHistoryOptions {
    page?: number;
    limit?: number;
}

export function useSearchHistory(options: UseSearchHistoryOptions = {}) {
    const { page = 1, limit = 10 } = options;

    return useQuery({
        queryKey: ["history", page, limit],
        queryFn: () => fetchSearchHistory(page, limit),
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
}

export function useDeleteSearch() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteSearchRequest,
        onSuccess: () => {
            toast.success("Search deleted");
            // Invalidate history to refresh the list
            queryClient.invalidateQueries({ queryKey: ["history"] });
        },
        onError: (error: Error) => {
            toast.error("Failed to delete", {
                description: error.message,
            });
        },
    });
}

// Export types
export type { SearchHistoryItem, SearchHistoryResponse };
