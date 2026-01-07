/**
 * useCreateSearch Hook
 * 
 * Mutation hook for creating new search requests
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface CreateSearchInput {
    query: string;
}

interface CreateSearchResponse {
    requestId: number;
    status: "processing";
}

async function createSearch(input: CreateSearchInput): Promise<CreateSearchResponse> {
    const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create search");
    }

    return response.json();
}

export function useCreateSearch() {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createSearch,
        onSuccess: (data) => {
            toast.success("Search started!", {
                description: "We're finding trending products for you...",
            });
            // Invalidate history to show new search
            queryClient.invalidateQueries({ queryKey: ["history"] });
            // Navigate to results page
            router.push(`/search/${data.requestId}`);
        },
        onError: (error: Error) => {
            toast.error("Search failed", {
                description: error.message,
            });
        },
    });
}
