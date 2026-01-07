/**
 * Search Progress Card
 * 
 * Real-time progress indicator for search operations using Supabase Realtime
 */

"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, XCircle, Search, Bot, BarChart3, Layers } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type SearchStatus = "processing" | "completed" | "failed";
type StepStatus = "pending" | "active" | "completed" | "failed";

interface SearchStep {
    id: string;
    label: string;
    description: string;
    icon: typeof Search;
    status: StepStatus;
}

interface SearchProgressCardProps {
    requestId: number;
    status: SearchStatus;
    currentStep?: string;
    clustersFound?: number;
    productsFound?: number;
}

const searchSteps: Omit<SearchStep, "status">[] = [
    {
        id: "parsing",
        label: "Understanding Request",
        description: "AI is analyzing your search query...",
        icon: Bot,
    },
    {
        id: "scraping",
        label: "Gathering Products",
        description: "Scraping e-commerce platforms for products...",
        icon: Search,
    },
    {
        id: "analyzing",
        label: "Analyzing Trends",
        description: "Calculating trend scores and market data...",
        icon: BarChart3,
    },
    {
        id: "clustering",
        label: "Grouping Results",
        description: "Clustering similar products together...",
        icon: Layers,
    },
];

function getStepStatus(stepIndex: number, currentStepIndex: number, overallStatus: SearchStatus): StepStatus {
    if (overallStatus === "failed") {
        if (stepIndex < currentStepIndex) return "completed";
        if (stepIndex === currentStepIndex) return "failed";
        return "pending";
    }
    if (overallStatus === "completed") return "completed";
    if (stepIndex < currentStepIndex) return "completed";
    if (stepIndex === currentStepIndex) return "active";
    return "pending";
}

export function SearchProgressCard({
    requestId,
    status,
    currentStep = "parsing",
    clustersFound = 0,
    productsFound = 0,
}: SearchProgressCardProps) {
    const currentStepIndex = searchSteps.findIndex((s) => s.id === currentStep);
    const progress = status === "completed"
        ? 100
        : status === "failed"
            ? (currentStepIndex / searchSteps.length) * 100
            : ((currentStepIndex + 0.5) / searchSteps.length) * 100;

    return (
        <Card className="bg-zinc-900/80 border-zinc-800 backdrop-blur-sm">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                        {status === "processing" && (
                            <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
                        )}
                        {status === "completed" && (
                            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                        )}
                        {status === "failed" && (
                            <XCircle className="h-5 w-5 text-red-400" />
                        )}
                        {status === "processing" && "Search in Progress"}
                        {status === "completed" && "Search Complete"}
                        {status === "failed" && "Search Failed"}
                    </CardTitle>
                    <span className="text-sm text-zinc-500">ID: {requestId}</span>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Progress Bar */}
                <div className="space-y-2">
                    <Progress
                        value={progress}
                        className="h-2 bg-zinc-800"
                    />
                    <div className="flex justify-between text-xs text-zinc-500">
                        <span>{Math.round(progress)}% complete</span>
                        {status === "processing" && (
                            <span className="animate-pulse">Processing...</span>
                        )}
                    </div>
                </div>

                {/* Steps */}
                <div className="space-y-3">
                    {searchSteps.map((step, index) => {
                        const stepStatus = getStepStatus(index, currentStepIndex, status);
                        const Icon = step.icon;

                        return (
                            <div
                                key={step.id}
                                className={cn(
                                    "flex items-start gap-3 p-3 rounded-lg transition-all duration-300",
                                    stepStatus === "active" && "bg-emerald-500/10 border border-emerald-500/20",
                                    stepStatus === "completed" && "opacity-60",
                                    stepStatus === "pending" && "opacity-40",
                                    stepStatus === "failed" && "bg-red-500/10 border border-red-500/20"
                                )}
                            >
                                <div
                                    className={cn(
                                        "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                                        stepStatus === "active" && "bg-emerald-500/20 text-emerald-400",
                                        stepStatus === "completed" && "bg-emerald-500/20 text-emerald-400",
                                        stepStatus === "pending" && "bg-zinc-800 text-zinc-500",
                                        stepStatus === "failed" && "bg-red-500/20 text-red-400"
                                    )}
                                >
                                    {stepStatus === "active" ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : stepStatus === "completed" ? (
                                        <CheckCircle2 className="h-4 w-4" />
                                    ) : stepStatus === "failed" ? (
                                        <XCircle className="h-4 w-4" />
                                    ) : (
                                        <Icon className="h-4 w-4" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p
                                        className={cn(
                                            "text-sm font-medium",
                                            stepStatus === "active" && "text-emerald-400",
                                            stepStatus === "completed" && "text-zinc-300",
                                            stepStatus === "pending" && "text-zinc-500",
                                            stepStatus === "failed" && "text-red-400"
                                        )}
                                    >
                                        {step.label}
                                    </p>
                                    {stepStatus === "active" && (
                                        <p className="text-xs text-zinc-500 mt-0.5">
                                            {step.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Stats (when complete) */}
                {status === "completed" && (clustersFound > 0 || productsFound > 0) && (
                    <div className="flex gap-4 pt-2 border-t border-zinc-800">
                        <div className="flex-1 text-center">
                            <p className="text-2xl font-bold text-emerald-400">{clustersFound}</p>
                            <p className="text-xs text-zinc-500">Trend Clusters</p>
                        </div>
                        <div className="flex-1 text-center">
                            <p className="text-2xl font-bold text-cyan-400">{productsFound}</p>
                            <p className="text-xs text-zinc-500">Products Found</p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// Add missing Progress component to shadcn
// Run: npx shadcn@latest add progress
