/**
 * Dashboard Page
 * 
 * Main hub with search bar and recent searches
 */

"use client";

import { TrendingUp, Sparkles, Zap, Globe } from "lucide-react";

import { SearchBar } from "@/components/search-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCreateSearch } from "@/hooks/use-create-search";
import { useSearchHistory } from "@/hooks/use-search-history";
import { useRealtimeHistory } from "@/hooks/use-realtime-search";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export default function DashboardPage() {
    const createSearch = useCreateSearch();
    const { data: historyData, isLoading: historyLoading } = useSearchHistory({ limit: 5 });

    // Subscribe to realtime updates
    useRealtimeHistory();

    async function handleSearch(query: string) {
        await createSearch.mutateAsync({ query });
    }

    return (
        <div className="min-h-[calc(100vh-8rem)] flex flex-col">
            {/* Hero Section */}
            <div className="flex-1 flex flex-col items-center justify-center py-12 px-4">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-4">
                        <Sparkles className="h-4 w-4" />
                        AI-Powered Trend Discovery
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Find Trending Products
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                            Before They Peak
                        </span>
                    </h1>
                    <p className="text-lg text-zinc-400 max-w-xl mx-auto">
                        Discover emerging product trends in any market. Our AI analyzes
                        e-commerce data and search trends to find opportunities.
                    </p>
                </div>

                <SearchBar onSearch={handleSearch} isLoading={createSearch.isPending} />

                {/* Feature Highlights */}
                <div className="flex flex-wrap justify-center gap-4 mt-12">
                    <FeatureCard
                        icon={TrendingUp}
                        title="Trend Scoring"
                        description="0-10 composite score based on real data"
                    />
                    <FeatureCard
                        icon={Zap}
                        title="Fast Analysis"
                        description="Results in under 60 seconds"
                    />
                    <FeatureCard
                        icon={Globe}
                        title="Global Markets"
                        description="USA, UK, EU, and more regions"
                    />
                </div>
            </div>

            {/* Recent Searches Section */}
            <div className="py-8 border-t border-zinc-800">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-lg font-semibold text-white mb-4">Recent Searches</h2>

                    {historyLoading ? (
                        <div className="space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <Skeleton key={i} className="h-16 w-full bg-zinc-800 rounded-lg" />
                            ))}
                        </div>
                    ) : historyData?.history.length === 0 ? (
                        <Card className="bg-zinc-900/50 border-zinc-800">
                            <CardContent className="py-8 text-center">
                                <p className="text-zinc-500">No searches yet. Try one above!</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-2">
                            {historyData?.history.map((item) => (
                                <Link key={item.id} href={`/search/${item.id}`}>
                                    <Card className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer">
                                        <CardContent className="py-3 px-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-white truncate">{item.query}</p>
                                                    <p className="text-xs text-zinc-500">
                                                        {new Date(item.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge
                                                        variant="secondary"
                                                        className={
                                                            item.status === "completed"
                                                                ? "bg-emerald-500/20 text-emerald-400"
                                                                : "bg-amber-500/20 text-amber-400"
                                                        }
                                                    >
                                                        {item.status === "completed"
                                                            ? `${item.clustersCount} clusters`
                                                            : "Processing..."}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}

                            {(historyData?.pagination.total ?? 0) > 5 && (
                                <Link href="/history" className="block">
                                    <p className="text-sm text-emerald-400 hover:text-emerald-300 text-center py-2">
                                        View all {historyData?.pagination.total} searches →
                                    </p>
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function FeatureCard({
    icon: Icon,
    title,
    description,
}: {
    icon: typeof TrendingUp;
    title: string;
    description: string;
}) {
    return (
        <div className="flex items-center gap-3 px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-800">
                <Icon className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
                <p className="text-sm font-medium text-white">{title}</p>
                <p className="text-xs text-zinc-500">{description}</p>
            </div>
        </div>
    );
}
