/**
 * History API Route
 * 
 * GET /api/history - Get user's search history
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
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

        // Parse query params
        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "10", 10);
        const skip = (page - 1) * limit;

        // Fetch user's search history
        const [requests, total] = await Promise.all([
            prisma.request.findMany({
                where: { userId: user.id },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
                include: {
                    searchCriteria: true,
                    _count: {
                        select: {
                            productClusters: true,
                            productMetrics: true,
                        },
                    },
                },
            }),
            prisma.request.count({
                where: { userId: user.id },
            }),
        ]);

        // Transform the response
        const history = requests.map((req) => ({
            id: req.id,
            query: req.userRequest,
            createdAt: req.createdAt,
            searchCriteria: req.searchCriteria,
            clustersCount: req._count.productClusters,
            productsCount: req._count.productMetrics,
            status: req._count.productClusters > 0 ? "completed" : "processing",
        }));

        return NextResponse.json({
            history,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("History API error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/history - Delete a search request
 */
export async function DELETE(request: NextRequest) {
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

        const body = await request.json();
        const { requestId } = body;

        if (!requestId || typeof requestId !== "number") {
            return NextResponse.json(
                { error: "Invalid request ID" },
                { status: 400 }
            );
        }

        // Verify ownership before deletion
        const existingRequest = await prisma.request.findUnique({
            where: { id: requestId },
        });

        if (!existingRequest) {
            return NextResponse.json(
                { error: "Request not found" },
                { status: 404 }
            );
        }

        if (existingRequest.userId !== user.id) {
            return NextResponse.json(
                { error: "Forbidden" },
                { status: 403 }
            );
        }

        // Delete the request (cascades to related records)
        await prisma.request.delete({
            where: { id: requestId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete history API error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
