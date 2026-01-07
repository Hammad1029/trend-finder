/**
 * Search Results Page
 * 
 * Displays search progress and clustered product results
 */

"use client";

import { useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ClusterCard, ClusterCardSkeleton } from "@/components/cluster-card";
import { SearchProgressCard } from "@/components/search-progress-card";
import { ProductDetailModal } from "@/components/product-detail-modal";
import { TimeMachineModal } from "@/components/time-machine-modal";
import { useSearchResults } from "@/hooks/use-search-results";
import { useRealtimeSearch } from "@/hooks/use-realtime-search";
import type { ProductMetrics } from "@/lib/validations";

interface SearchResultsPageProps {
    params: Promise<{ id: string }>;
}

export default function SearchResultsPage({ params }: SearchResultsPageProps) {
    const resolvedParams = use(params);
    const requestId = parseInt(resolvedParams.id, 10);

    const [selectedProduct, setSelectedProduct] = useState<ProductMetrics | null>(null);
    const [productModalOpen, setProductModalOpen] = useState(false);
    const [timeMachineProduct, setTimeMachineProduct] = useState<ProductMetrics | null>(null);
    const [timeMachineOpen, setTimeMachineOpen] = useState(false);

    const {
        data,
        isLoading,
        isError,
        error,
        refetch,
    } = useSearchResults(requestId, {
        refetchInterval: 5000, // Poll every 5 seconds while processing
    });

    // Subscribe to realtime updates
    useRealtimeSearch({
        requestId,
        enabled: data?.status === "processing",
    });

    function handleProductClick(product: ProductMetrics) {
        setSelectedProduct(product);
        setProductModalOpen(true);
    }

    function handleTimeMachine(product: ProductMetrics) {
        setProductModalOpen(false);
        setTimeMachineProduct(product);
        setTimeMachineOpen(true);
    }

    if (isNaN(requestId)) {
        return (
            <div className="text-center py-20">
                <p className="text-red-400">Invalid search ID</p>
                <Link href="/">
                    <Button variant="outline" className="mt-4">
                        Go back to search
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/">
                        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-semibold text-white">Search Results</h1>
                        {data && (
                            <p className="text-sm text-zinc-400 truncate max-w-md">
                                {data.query}
                            </p>
                        )}
                    </div>
                </div>
                {data?.status === "processing" && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetch()}
                        className="border-zinc-700 text-zinc-300"
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                )}
            </div>

            {/* Error State */}
            {isError && (
                <div className="text-center py-12 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-red-400 mb-4">
                        {error instanceof Error ? error.message : "Failed to load results"}
                    </p>
                    <Button onClick={() => refetch()} variant="outline">
                        Try Again
                    </Button>
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="space-y-6">
                    <SearchProgressCard
                        requestId={requestId}
                        status="processing"
                        currentStep="parsing"
                    />
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <ClusterCardSkeleton key={i} />
                        ))}
                    </div>
                </div>
            )}

            {/* Processing State */}
            {data?.status === "processing" && (
                <SearchProgressCard
                    requestId={requestId}
                    status="processing"
                    currentStep="scraping"
                    clustersFound={data.totalClusters}
                    productsFound={data.totalProducts}
                />
            )}

            {/* Results */}
            {data && data.clusters.length > 0 && (
                <div className="space-y-4">
                    {data.status === "completed" && (
                        <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-3">
                            <p className="text-sm text-emerald-400">
                                Found <strong>{data.totalClusters} trend clusters</strong> with{" "}
                                <strong>{data.totalProducts} products</strong>
                            </p>
                        </div>
                    )}

                    {data.clusters.map((cluster) => (
                        <ClusterCard
                            key={cluster.id}
                            cluster={cluster}
                            products={cluster.products}
                            onProductClick={handleProductClick}
                        />
                    ))}
                </div>
            )}

            {/* No Results State */}
            {data?.status === "completed" && data.clusters.length === 0 && (
                <div className="text-center py-20 bg-zinc-900/50 rounded-lg border border-zinc-800">
                    <p className="text-zinc-400 mb-4">
                        No trending products found for this search.
                    </p>
                    <Link href="/">
                        <Button>Try a different search</Button>
                    </Link>
                </div>
            )}

            {/* Product Detail Modal */}
            <ProductDetailModal
                product={selectedProduct}
                open={productModalOpen}
                onOpenChange={setProductModalOpen}
                onTimeMachine={handleTimeMachine}
            />

            {/* Time Machine Modal */}
            <TimeMachineModal
                product={timeMachineProduct}
                open={timeMachineOpen}
                onOpenChange={setTimeMachineOpen}
            />
        </div>
    );
}
