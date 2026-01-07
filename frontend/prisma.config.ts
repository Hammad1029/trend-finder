// Prisma configuration for TrendToy MVP
// Database URLs are configured here for Prisma 7+
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Database URL for connection
    url: process.env["DATABASE_URL"],
  },
});
