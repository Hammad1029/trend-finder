/**
 * Search Bar Component
 * 
 * Large search input with example queries and debounced input
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const exampleQueries = [
    "Trending toys for ADHD kids in USA",
    "Best selling kitchen gadgets UK",
    "Emerging beauty products Southeast Asia",
    "Popular fitness accessories Germany",
    "Hot electronics accessories Japan",
];

interface SearchBarProps {
    onSearch: (query: string) => Promise<void>;
    isLoading?: boolean;
}

export function SearchBar({ onSearch, isLoading = false }: SearchBarProps) {
    const [query, setQuery] = useState("");
    const [isFocused, setIsFocused] = useState(false);

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            if (query.trim().length >= 3 && !isLoading) {
                await onSearch(query.trim());
            }
        },
        [query, onSearch, isLoading]
    );

    const handleExampleClick = useCallback(
        async (example: string) => {
            setQuery(example);
            if (!isLoading) {
                await onSearch(example);
            }
        },
        [onSearch, isLoading]
    );

    return (
        <div className="w-full max-w-3xl mx-auto space-y-6">
            {/* Main Search Input */}
            <form onSubmit={handleSubmit}>
                <div
                    className={`
            relative rounded-2xl transition-all duration-300
            ${isFocused
                            ? "ring-2 ring-emerald-500/50 shadow-lg shadow-emerald-500/10"
                            : "ring-1 ring-zinc-700"
                        }
          `}
                >
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        {isLoading ? (
                            <Loader2 className="h-5 w-5 text-zinc-400 animate-spin" />
                        ) : (
                            <Search className="h-5 w-5 text-zinc-400" />
                        )}
                    </div>
                    <Input
                        type="text"
                        placeholder="Describe the trending products you're looking for..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        disabled={isLoading}
                        className="
              h-14 pl-12 pr-28 text-base
              bg-zinc-900 border-0 text-white
              placeholder:text-zinc-500
              focus-visible:ring-0 focus-visible:ring-offset-0
              rounded-2xl
            "
                    />
                    <Button
                        type="submit"
                        disabled={query.trim().length < 3 || isLoading}
                        className="
              absolute right-2 top-1/2 -translate-y-1/2
              bg-gradient-to-r from-emerald-500 to-cyan-500
              hover:from-emerald-600 hover:to-cyan-600
              text-white font-medium px-6
              disabled:opacity-50 disabled:cursor-not-allowed
            "
                    >
                        {isLoading ? "Searching..." : "Search"}
                    </Button>
                </div>
            </form>

            {/* Example Queries */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                    <Sparkles className="h-4 w-4" />
                    <span>Try an example:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {exampleQueries.map((example) => (
                        <button
                            key={example}
                            onClick={() => handleExampleClick(example)}
                            disabled={isLoading}
                            className="
                inline-flex items-center px-3 py-1.5 rounded-full
                bg-zinc-800/50 border border-zinc-700/50
                text-xs text-zinc-400
                hover:bg-zinc-800 hover:text-zinc-300 hover:border-zinc-600
                transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
              "
                        >
                            {example}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
