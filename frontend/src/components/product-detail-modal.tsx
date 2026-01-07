/**
 * Product Detail Modal
 * 
 * Dialog showing detailed product information with trend chart
 */

"use client";

import { useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
    ExternalLink,
    Star,
    Package,
    TrendingUp,
    Calendar,
    Tag,
    Clock,
} from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ProductMetrics } from "@/lib/validations";

// Lazy load Recharts for better performance
const TrendChart = dynamic(
    () => import("@/components/trend-chart").then((mod) => mod.TrendChart),
    {
        loading: () => <Skeleton className="h-64 w-full bg-zinc-800" />,
        ssr: false,
    }
);

interface ProductDetailModalProps {
    product: ProductMetrics | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onTimeMachine?: (product: ProductMetrics) => void;
}

function formatPrice(price: number, currency: string = "USD") {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
    }).format(price);
}

export function ProductDetailModal({
    product,
    open,
    onOpenChange,
    onTimeMachine,
}: ProductDetailModalProps) {
    if (!product) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl bg-zinc-900 border-zinc-800 text-white max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">
                        Product Details
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Product Info Header */}
                    <div className="flex gap-4">
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0">
                            {product.imageUrl ? (
                                <Image
                                    src={product.imageUrl}
                                    alt={product.description}
                                    fill
                                    className="object-cover"
                                    sizes="96px"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                    <Package className="h-8 w-8" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-base font-medium text-white line-clamp-2 mb-2">
                                {product.description}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                                    {formatPrice(product.price, product.currency)}
                                </Badge>
                                <Badge variant="secondary" className="bg-zinc-800 text-zinc-300">
                                    {product.platform}
                                </Badge>
                                <Badge variant="secondary" className="bg-zinc-800 text-zinc-300">
                                    {product.platformRegion}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-zinc-800/50 rounded-lg p-3">
                            <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-1">
                                <Star className="h-3 w-3" />
                                Rating
                            </div>
                            <p className="text-lg font-semibold text-white">
                                {product.rating.toFixed(1)}
                            </p>
                        </div>
                        <div className="bg-zinc-800/50 rounded-lg p-3">
                            <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-1">
                                <Package className="h-3 w-3" />
                                Reviews
                            </div>
                            <p className="text-lg font-semibold text-white">
                                {product.reviewCount.toLocaleString()}
                            </p>
                        </div>
                        <div className="bg-zinc-800/50 rounded-lg p-3">
                            <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-1">
                                <TrendingUp className="h-3 w-3" />
                                Sales/Month
                            </div>
                            <p className="text-lg font-semibold text-white">
                                {product.salesLastMonth.toLocaleString()}
                            </p>
                        </div>
                        <div className="bg-zinc-800/50 rounded-lg p-3">
                            <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-1">
                                <Tag className="h-3 w-3" />
                                Score
                            </div>
                            <p className="text-lg font-semibold text-white">
                                {product.score.toFixed(1)}
                            </p>
                        </div>
                    </div>

                    {/* Tabs for Trends and Details */}
                    <Tabs defaultValue="trends" className="w-full">
                        <TabsList className="w-full bg-zinc-800">
                            <TabsTrigger value="trends" className="flex-1 data-[state=active]:bg-zinc-700">
                                <TrendingUp className="h-4 w-4 mr-2" />
                                Trend Analysis
                            </TabsTrigger>
                            <TabsTrigger value="details" className="flex-1 data-[state=active]:bg-zinc-700">
                                <Package className="h-4 w-4 mr-2" />
                                Details
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="trends" className="mt-4 space-y-4">
                            {/* Trend Chart */}
                            <div className="bg-zinc-800/30 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-zinc-300 mb-4">
                                    Search Interest Over Time
                                </h4>
                                <TrendChart keyword={product.keywordSearched} />
                            </div>

                            {/* Time Machine Button */}
                            {onTimeMachine && (
                                <Button
                                    variant="outline"
                                    className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                                    onClick={() => onTimeMachine(product)}
                                >
                                    <Clock className="h-4 w-4 mr-2" />
                                    Open Time Machine (Historical Trends)
                                </Button>
                            )}
                        </TabsContent>

                        <TabsContent value="details" className="mt-4 space-y-3">
                            <div className="space-y-2">
                                <InfoRow label="Platform ID" value={product.uniqueId} />
                                <InfoRow label="Category" value={product.platformCategory} />
                                <InfoRow label="Search Keyword" value={product.keywordSearched} />
                                <InfoRow
                                    label="Search Ranking"
                                    value={`#${product.searchRanking}`}
                                />
                                <InfoRow
                                    label="Sponsored"
                                    value={product.sponsored ? "Yes" : "No"}
                                />
                            </div>
                        </TabsContent>
                    </Tabs>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                        <Button
                            className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
                            onClick={() => {
                                // Open product on original platform
                                window.open(`https://amazon.com/dp/${product.uniqueId}`, "_blank");
                            }}
                        >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View on {product.platform}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between items-center py-2 border-b border-zinc-800">
            <span className="text-sm text-zinc-500">{label}</span>
            <span className="text-sm text-white font-medium">{value}</span>
        </div>
    );
}
