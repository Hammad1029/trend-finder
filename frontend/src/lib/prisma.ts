/**
 * Prisma Client Singleton
 * 
 * Creates a single instance of PrismaClient to avoid multiple connections
 * in development mode with hot reloading.
 * 
 * Uses the pg driver adapter for Prisma 7+.
 * 
 * IMPORTANT: Never fetch the 'embedding' column in normal queries!
 * It contains 1536 floats and will significantly slow down queries.
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
    pool: Pool | undefined;
};

function createPrismaClient(): PrismaClient {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        throw new Error("DATABASE_URL environment variable is not set");
    }

    // Create a PostgreSQL pool
    const pool = globalForPrisma.pool ?? new Pool({ connectionString });

    if (process.env.NODE_ENV !== "production") {
        globalForPrisma.pool = pool;
    }

    // Create the Prisma adapter
    const adapter = new PrismaPg(pool);

    // Create PrismaClient with the adapter
    return new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}

// Helper types for safe queries (excluding embedding)
export type ProductMetricsWithoutEmbedding = Omit<
    Awaited<ReturnType<typeof prisma.productMetrics.findFirst>>,
    "embedding"
>;

export default prisma;
