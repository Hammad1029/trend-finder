/**
 * Time Machine Modal
 * 
 * Historical Google Trends exploration with year range selector
 */

"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Calendar, Clock, TrendingUp, Loader2 } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { TimeMachineChart } from "@/components/trend-chart";
import type { ProductMetrics } from "@/lib/validations";

interface TimeMachineModalProps {
    product: ProductMetrics | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface TimeMachineData {
    keywords: string;
    region: string;
    startYear: number;
    endYear: number;
    data: Array<{ year: number; month: string; value: number }>;
}

async function fetchHistoricalTrends(params: {
    productKeywords: string;
    region: string;
    startYear: number;
    endYear: number;
}): Promise<TimeMachineData> {
    const response = await fetch("/api/trends/time-machine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
    });

    if (!response.ok) {
        throw new Error("Failed to fetch historical trends");
    }

    return response.json();
}

const currentYear = new Date().getFullYear();
const availableYears = Array.from(
    { length: currentYear - 2004 + 1 },
    (_, i) => 2004 + i
);

export function TimeMachineModal({
    product,
    open,
    onOpenChange,
}: TimeMachineModalProps) {
    const [startYear, setStartYear] = useState(currentYear - 3);
    const [endYear, setEndYear] = useState(currentYear);

    const mutation = useMutation({
        mutationFn: fetchHistoricalTrends,
    });

    function handleFetch() {
        if (!product) return;

        mutation.mutate({
            productKeywords: product.keywordSearched,
            region: product.platformRegion || "US",
            startYear,
            endYear,
        });
    }

    if (!product) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl bg-zinc-900 border-zinc-800 text-white max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold flex items-center gap-2">
                        <Clock className="h-5 w-5 text-emerald-400" />
                        Trend Time Machine
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Keyword Info */}
                    <div className="bg-zinc-800/50 rounded-lg p-4">
                        <p className="text-sm text-zinc-400 mb-1">Analyzing trends for:</p>
                        <p className="text-base font-medium text-white">
                            {product.keywordSearched}
                        </p>
                    </div>

                    {/* Year Range Selector */}
                    <div className="flex flex-wrap items-end gap-4">
                        <div className="flex-1 min-w-[140px]">
                            <label className="text-sm text-zinc-400 mb-2 block">
                                Start Year
                            </label>
                            <Select
                                value={startYear.toString()}
                                onValueChange={(v) => setStartYear(parseInt(v))}
                            >
                                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-800 border-zinc-700">
                                    {availableYears
                                        .filter((y) => y < endYear)
                                        .map((year) => (
                                            <SelectItem key={year} value={year.toString()}>
                                                {year}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex-1 min-w-[140px]">
                            <label className="text-sm text-zinc-400 mb-2 block">
                                End Year
                            </label>
                            <Select
                                value={endYear.toString()}
                                onValueChange={(v) => setEndYear(parseInt(v))}
                            >
                                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-800 border-zinc-700">
                                    {availableYears
                                        .filter((y) => y > startYear)
                                        .map((year) => (
                                            <SelectItem key={year} value={year.toString()}>
                                                {year}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            onClick={handleFetch}
                            disabled={mutation.isPending}
                            className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
                        >
                            {mutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Loading...
                                </>
                            ) : (
                                <>
                                    <TrendingUp className="h-4 w-4 mr-2" />
                                    Analyze Trends
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Chart */}
                    <div className="bg-zinc-800/30 rounded-lg p-4 min-h-[320px]">
                        {mutation.isPending && (
                            <Skeleton className="h-80 w-full bg-zinc-800" />
                        )}

                        {mutation.isError && (
                            <div className="h-80 flex items-center justify-center">
                                <p className="text-red-400">
                                    Failed to load trends. Please try again.
                                </p>
                            </div>
                        )}

                        {mutation.isSuccess && mutation.data && (
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-sm font-medium text-zinc-300">
                                        Search Interest: {mutation.data.startYear} - {mutation.data.endYear}
                                    </h4>
                                    <span className="text-xs text-zinc-500">
                                        Region: {mutation.data.region}
                                    </span>
                                </div>
                                <TimeMachineChart data={mutation.data.data} />
                            </div>
                        )}

                        {!mutation.isPending && !mutation.isSuccess && !mutation.isError && (
                            <div className="h-80 flex flex-col items-center justify-center text-center">
                                <Calendar className="h-12 w-12 text-zinc-700 mb-4" />
                                <p className="text-zinc-500 mb-2">
                                    Select a year range and click &quot;Analyze Trends&quot;
                                </p>
                                <p className="text-xs text-zinc-600">
                                    Historical data available from 2004 onwards
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Insights */}
                    {mutation.isSuccess && mutation.data && (
                        <div className="grid grid-cols-3 gap-4">
                            <InsightCard
                                label="Peak Interest"
                                value={Math.max(...mutation.data.data.map((d) => d.value)).toString()}
                                subtext="Max search volume"
                            />
                            <InsightCard
                                label="Current Level"
                                value={mutation.data.data[mutation.data.data.length - 1]?.value.toString() || "0"}
                                subtext="Latest data point"
                            />
                            <InsightCard
                                label="Data Points"
                                value={mutation.data.data.length.toString()}
                                subtext="Months analyzed"
                            />
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

function InsightCard({
    label,
    value,
    subtext,
}: {
    label: string;
    value: string;
    subtext: string;
}) {
    return (
        <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
            <p className="text-xs text-zinc-500 mb-1">{label}</p>
            <p className="text-xl font-bold text-white">{value}</p>
            <p className="text-xs text-zinc-600">{subtext}</p>
        </div>
    );
}
