/**
 * Cluster Card Component
 * 
 * Expandable card displaying product cluster with trend information
 */

"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus, ExternalLink, Star } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Cluster, ProductMetrics } from "@/lib/validations";
import { cn } from "@/lib/utils";

interface ClusterCardProps {
    cluster: Cluster;
    products: ProductMetrics[];
    onProductClick?: (product: ProductMetrics) => void;
}

function getTrendBadgeProps(score: number) {
    if (score >= 8) {
        return {
            variant: "default" as const,
            className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
            icon: TrendingUp,
        };
    }
    if (score >= 6) {
        return {
            variant: "default" as const,
            className: "bg-amber-500/20 text-amber-400 border-amber-500/30",
            icon: Minus,
        };
    }
    return {
        variant: "default" as const,
        className: "bg-red-500/20 text-red-400 border-red-500/30",
        icon: TrendingDown,
    };
}

function formatPrice(price: number, currency: string = "USD") {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
    }).format(price);
}

export function ClusterCard({ cluster, products, onProductClick }: ClusterCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const trendBadge = getTrendBadgeProps(cluster.trendFinalScore);
    const TrendIcon = trendBadge.icon;

    const topProduct = products[0];
    const otherProducts = products.slice(1, 5);

    return (
        <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden hover:border-zinc-700 transition-colors">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        {/* Trend Keywords */}
                        <div className="flex flex-wrap gap-1.5 mb-2">
                            {cluster.trendKeywords.slice(0, 5).map((keyword, idx) => (
                                <Badge
                                    key={idx}
                                    variant="secondary"
                                    className="bg-zinc-800 text-zinc-300 border-zinc-700"
                                >
                                    {keyword}
                                </Badge>
                            ))}
                            {cluster.trendKeywords.length > 5 && (
                                <Badge variant="secondary" className="bg-zinc-800 text-zinc-500">
                                    +{cluster.trendKeywords.length - 5}
                                </Badge>
                            )}
                        </div>

                        {/* Trend Score & Label */}
                        <div className="flex items-center gap-3">
                            <Badge className={cn("gap-1", trendBadge.className)}>
                                <TrendIcon className="h-3 w-3" />
                                {cluster.trendFinalScore.toFixed(1)}
                            </Badge>
                            <span className="text-sm font-medium text-zinc-300">
                                {cluster.trendLabel}
                            </span>
                        </div>
                    </div>

                    {/* Cluster Stats */}
                    <div className="text-right text-sm">
                        <p className="text-zinc-400">
                            {cluster.clusterSize} products
                        </p>
                        <p className="text-zinc-500">
                            {formatPrice(cluster.minPrice)} - {formatPrice(cluster.maxPrice)}
                        </p>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Trend Explanation */}
                <p className="text-sm text-zinc-400 leading-relaxed">
                    {cluster.trendExplanation}
                </p>

                {/* Analytics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-zinc-800/50 rounded-lg p-3">
                        <p className="text-xs text-zinc-500 mb-1">Avg. Rating</p>
                        <p className="text-sm font-medium text-white flex items-center gap-1">
                            <Star className="h-3 w-3 text-amber-400" />
                            {cluster.averageRating.toFixed(1)}
                        </p>
                    </div>
                    <div className="bg-zinc-800/50 rounded-lg p-3">
                        <p className="text-xs text-zinc-500 mb-1">Avg. Reviews</p>
                        <p className="text-sm font-medium text-white">
                            {cluster.averageReviewCount.toLocaleString()}
                        </p>
                    </div>
                    <div className="bg-zinc-800/50 rounded-lg p-3">
                        <p className="text-xs text-zinc-500 mb-1">Avg. Price</p>
                        <p className="text-sm font-medium text-white">
                            {formatPrice(cluster.averagePrice)}
                        </p>
                    </div>
                    <div className="bg-zinc-800/50 rounded-lg p-3">
                        <p className="text-xs text-zinc-500 mb-1">Sales/Month</p>
                        <p className="text-sm font-medium text-white">
                            {cluster.averageSalesLastMonth.toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* Top Product */}
                {topProduct && (
                    <div
                        className="flex gap-4 p-3 bg-zinc-800/30 rounded-lg cursor-pointer hover:bg-zinc-800/50 transition-colors"
                        onClick={() => onProductClick?.(topProduct)}
                    >
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0">
                            {topProduct.imageUrl ? (
                                <Image
                                    src={topProduct.imageUrl}
                                    alt={topProduct.description}
                                    fill
                                    className="object-cover"
                                    sizes="64px"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                    No Image
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-white line-clamp-2 mb-1">
                                {topProduct.description}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-zinc-400">
                                <span className="font-medium text-emerald-400">
                                    {formatPrice(topProduct.price, topProduct.currency)}
                                </span>
                                <span className="flex items-center gap-0.5">
                                    <Star className="h-3 w-3 text-amber-400" />
                                    {topProduct.rating.toFixed(1)}
                                </span>
                                <span>{topProduct.reviewCount.toLocaleString()} reviews</span>
                            </div>
                        </div>
                        <ExternalLink className="h-4 w-4 text-zinc-500 flex-shrink-0" />
                    </div>
                )}

                {/* Expand/Collapse Button */}
                {otherProducts.length > 0 && (
                    <>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="w-full text-zinc-400 hover:text-white hover:bg-zinc-800"
                        >
                            {isExpanded ? (
                                <>
                                    <ChevronUp className="h-4 w-4 mr-2" />
                                    Hide Similar Products
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="h-4 w-4 mr-2" />
                                    Show {otherProducts.length} Similar Products
                                </>
                            )}
                        </Button>

                        {/* Expanded Products */}
                        {isExpanded && (
                            <div className="space-y-2">
                                {otherProducts.map((product) => (
                                    <div
                                        key={product.id}
                                        className="flex gap-3 p-2 bg-zinc-800/20 rounded-lg cursor-pointer hover:bg-zinc-800/40 transition-colors"
                                        onClick={() => onProductClick?.(product)}
                                    >
                                        <div className="relative w-12 h-12 rounded overflow-hidden bg-zinc-800 flex-shrink-0">
                                            {product.imageUrl ? (
                                                <Image
                                                    src={product.imageUrl}
                                                    alt={product.description}
                                                    fill
                                                    className="object-cover"
                                                    sizes="48px"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-zinc-700" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-white line-clamp-1">
                                                {product.description}
                                            </p>
                                            <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
                                                <span className="text-emerald-400">
                                                    {formatPrice(product.price, product.currency)}
                                                </span>
                                                <span>★ {product.rating.toFixed(1)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}

// Loading skeleton
export function ClusterCardSkeleton() {
    return (
        <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex gap-2 mb-2">
                            <Skeleton className="h-5 w-20 bg-zinc-800" />
                            <Skeleton className="h-5 w-16 bg-zinc-800" />
                            <Skeleton className="h-5 w-24 bg-zinc-800" />
                        </div>
                        <div className="flex gap-3">
                            <Skeleton className="h-5 w-12 bg-zinc-800" />
                            <Skeleton className="h-5 w-28 bg-zinc-800" />
                        </div>
                    </div>
                    <div className="text-right">
                        <Skeleton className="h-4 w-20 bg-zinc-800 mb-1" />
                        <Skeleton className="h-4 w-24 bg-zinc-800" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-12 w-full bg-zinc-800" />
                <div className="grid grid-cols-4 gap-3">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-16 bg-zinc-800 rounded-lg" />
                    ))}
                </div>
                <Skeleton className="h-20 w-full bg-zinc-800 rounded-lg" />
            </CardContent>
        </Card>
    );
}
