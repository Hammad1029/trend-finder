/**
 * History Page
 * 
 * User's search history with pagination and actions
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Search,
    Trash2,
    ExternalLink,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    History as HistoryIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    useSearchHistory,
    useDeleteSearch,
    type SearchHistoryItem,
} from "@/hooks/use-search-history";

export default function HistoryPage() {
    const [page, setPage] = useState(1);
    const [deleteTarget, setDeleteTarget] = useState<SearchHistoryItem | null>(null);

    const { data, isLoading, refetch } = useSearchHistory({ page, limit: 10 });
    const deleteSearch = useDeleteSearch();

    function handleDelete() {
        if (!deleteTarget) return;
        deleteSearch.mutate(deleteTarget.id, {
            onSuccess: () => setDeleteTarget(null),
        });
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <HistoryIcon className="h-6 w-6 text-emerald-400" />
                        Search History
                    </h1>
                    <p className="text-sm text-zinc-500 mt-1">
                        View and manage your past trend searches
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetch()}
                    className="border-zinc-700 text-zinc-300"
                >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Loading State */}
            {isLoading && (
                <Card className="bg-zinc-900/50 border-zinc-800">
                    <CardContent className="p-0">
                        <div className="space-y-4 p-4">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-12 w-full bg-zinc-800" />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Empty State */}
            {!isLoading && data?.history.length === 0 && (
                <Card className="bg-zinc-900/50 border-zinc-800">
                    <CardContent className="py-16 text-center">
                        <Search className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-white mb-2">
                            No searches yet
                        </h3>
                        <p className="text-zinc-500 mb-6">
                            Start discovering trending products with your first search
                        </p>
                        <Link href="/">
                            <Button>Start Searching</Button>
                        </Link>
                    </CardContent>
                </Card>
            )}

            {/* History Table */}
            {!isLoading && data && data.history.length > 0 && (
                <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-zinc-800 hover:bg-transparent">
                                <TableHead className="text-zinc-400">Search Query</TableHead>
                                <TableHead className="text-zinc-400">Date</TableHead>
                                <TableHead className="text-zinc-400">Status</TableHead>
                                <TableHead className="text-zinc-400">Results</TableHead>
                                <TableHead className="text-zinc-400 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.history.map((item) => (
                                <TableRow
                                    key={item.id}
                                    className="border-zinc-800 hover:bg-zinc-800/30"
                                >
                                    <TableCell className="font-medium text-white max-w-xs truncate">
                                        {item.query}
                                    </TableCell>
                                    <TableCell className="text-zinc-400">
                                        {new Date(item.createdAt).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            className={
                                                item.status === "completed"
                                                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                                    : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                                            }
                                        >
                                            {item.status === "completed" ? "Completed" : "Processing"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-zinc-400">
                                        {item.status === "completed"
                                            ? `${item.clustersCount} clusters, ${item.productsCount} products`
                                            : "-"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={`/search/${item.id}`}>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-zinc-400 hover:text-white"
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-zinc-400 hover:text-red-400"
                                                onClick={() => setDeleteTarget(item)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    {data.pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800">
                            <p className="text-sm text-zinc-500">
                                Showing {(page - 1) * 10 + 1} to{" "}
                                {Math.min(page * 10, data.pagination.total)} of{" "}
                                {data.pagination.total} searches
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page === 1}
                                    onClick={() => setPage(page - 1)}
                                    className="border-zinc-700"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="text-sm text-zinc-400 px-2">
                                    Page {page} of {data.pagination.totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page === data.pagination.totalPages}
                                    onClick={() => setPage(page + 1)}
                                    className="border-zinc-700"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
                <DialogContent className="bg-zinc-900 border-zinc-800">
                    <DialogHeader>
                        <DialogTitle className="text-white">Delete Search</DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            Are you sure you want to delete this search? This will also delete
                            all associated results and cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    {deleteTarget && (
                        <div className="bg-zinc-800/50 rounded-lg p-3 my-2">
                            <p className="text-sm text-white truncate">{deleteTarget.query}</p>
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteTarget(null)}
                            className="border-zinc-700"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleteSearch.isPending}
                        >
                            {deleteSearch.isPending ? "Deleting..." : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
