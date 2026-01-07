/**
 * Time Machine API Route
 * 
 * POST /api/trends/time-machine - Get historical Google Trends data
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { timeMachineSchema } from "@/lib/validations";

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
        const validationResult = timeMachineSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                { error: "Invalid request", details: validationResult.error.flatten() },
                { status: 400 }
            );
        }

        const { productKeywords, region, startYear, endYear } = validationResult.data;

        // Try to fetch from Python backend
        const pythonBackendUrl = process.env.PYTHON_BACKEND_URL;
        if (pythonBackendUrl) {
            try {
                const response = await fetch(`${pythonBackendUrl}/trends/historical`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        keywords: productKeywords,
                        region,
                        start_year: startYear,
                        end_year: endYear,
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    return NextResponse.json(data);
                }
            } catch (error) {
                console.error("Failed to fetch from Python backend:", error);
            }
        }

        // Return mock data if backend is not available
        const mockData = generateMockHistoricalData(startYear, endYear);

        return NextResponse.json({
            keywords: productKeywords,
            region,
            startYear,
            endYear,
            data: mockData,
        });
    } catch (error) {
        console.error("Time Machine API error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

/**
 * Generate mock historical trend data
 */
function generateMockHistoricalData(startYear: number, endYear: number) {
    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const data: Array<{ year: number; month: string; value: number }> = [];

    for (let year = startYear; year <= endYear; year++) {
        for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
            // Generate realistic trend pattern with growth over years
            const yearProgress = (year - startYear) / (endYear - startYear + 1);
            const baseValue = 30 + yearProgress * 40; // Growing trend
            const seasonality = Math.sin((monthIndex / 12) * 2 * Math.PI) * 10; // Seasonal variation
            const noise = (Math.random() - 0.5) * 15;

            data.push({
                year,
                month: `${months[monthIndex]} ${year}`,
                value: Math.max(0, Math.min(100, Math.round(baseValue + seasonality + noise))),
            });
        }
    }

    return data;
}
