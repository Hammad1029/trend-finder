/**
 * Search API Route
 * 
 * POST /api/search - Create a new search request
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { searchQuerySchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
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

        // Parse and validate request body
        const body = await request.json();
        const validationResult = searchQuerySchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                { error: "Invalid request", details: validationResult.error.flatten() },
                { status: 400 }
            );
        }

        const { query } = validationResult.data;

        // Create request record in database
        // const searchRequest = await prisma.request.create({
        //     data: {
        //         userRequest: query,
        //         userId: user.id,
        //     },
        // });

        // Forward request to Python backend (if available)
        const pythonBackendUrl = process.env.PYTHON_BACKEND_URL;
        let res;
        if (pythonBackendUrl) {
            try {
                res = await fetch(`${pythonBackendUrl}/search`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        query,
                        user_id: user.id,
                    }),
                });
            } catch (error) {
                console.error("Failed to forward request to Python backend:", error);
                // Don't fail the request - backend might process it later
            }
        }

        const jsonRes = await res?.json()
        return NextResponse.json({
            requestId: jsonRes?.requestId,
            status: "processing",
        });
    } catch (error) {
        console.error("Search API error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
