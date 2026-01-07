/**
 * Search Results API Route
 * 
 * GET /api/search/[id] - Get search results by request ID
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        // Verify authentication
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await params;
        const requestId = parseInt(id, 10);

        if (isNaN(requestId)) {
            return NextResponse.json(
                { error: "Invalid request ID" },
                { status: 400 }
            );
        }

        // Fetch the request with related data
        const searchRequest = await prisma.request.findUnique({
            where: { id: requestId },
            include: {
                searchCriteria: true,
                productClusters: {
                    orderBy: { trendFinalScore: "desc" },
                },
            },
        });

        if (!searchRequest) {
            return NextResponse.json(
                { error: "Request not found" },
                { status: 404 }
            );
        }

        // Verify ownership
        if (searchRequest.userId !== user.id) {
            return NextResponse.json(
                { error: "Forbidden" },
                { status: 403 }
            );
        }

        // Fetch products for each cluster (excluding embedding column!)
        const clustersWithProducts = await Promise.all(
            searchRequest.productClusters.map(async (cluster) => {
                const products = await prisma.productMetrics.findMany({
                    where: { clusterId: cluster.id },
                    select: {
                        id: true,
                        keywordSearched: true,
                        platform: true,
                        uniqueId: true,
                        description: true,
                        price: true,
                        currency: true,
                        imageUrl: true,
                        platformCategory: true,
                        platformRegion: true,
                        rating: true,
                        reviewCount: true,
                        salesLastMonth: true,
                        searchRanking: true,
                        sponsored: true,
                        score: true,
                        clusterId: true,
                        // NOTE: embedding is NOT selected - it's 1536 floats!
                    },
                    orderBy: { score: "desc" },
                    take: 10, // Limit products per cluster
                });

                return {
                    ...cluster,
                    products,
                };
            })
        );

        // Determine status based on data presence
        const hasResults = searchRequest.productClusters.length > 0;
        const status = hasResults ? "completed" : "processing";

        return NextResponse.json({
            requestId: searchRequest.id,
            query: searchRequest.userRequest,
            createdAt: searchRequest.createdAt,
            status,
            searchCriteria: searchRequest.searchCriteria,
            clusters: clustersWithProducts,
            totalClusters: searchRequest.productClusters.length,
            totalProducts: clustersWithProducts.reduce(
                (sum, c) => sum + c.products.length,
                0
            ),
        });
    } catch (error) {
        console.error("Search results API error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
