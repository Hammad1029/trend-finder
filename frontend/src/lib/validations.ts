/**
 * Zod Validation Schemas
 * 
 * Runtime validation for API requests and form data
 */

import { z } from "zod";

// ============================================
// Auth Schemas
// ============================================

export const loginSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z
    .object({
        email: z.string().email("Please enter a valid email address"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;

// ============================================
// Search Schemas
// ============================================

export const searchQuerySchema = z.object({
    query: z
        .string()
        .min(3, "Search query must be at least 3 characters")
        .max(255, "Search query must be less than 255 characters"),
});

export type SearchQueryInput = z.infer<typeof searchQuerySchema>;

// ============================================
// Time Machine Schemas
// ============================================

export const timeMachineSchema = z.object({
    productKeywords: z.string().min(1, "Keywords are required"),
    region: z.string().min(2, "Region is required").max(10),
    startYear: z
        .number()
        .int()
        .min(2004, "Google Trends data starts from 2004")
        .max(new Date().getFullYear()),
    endYear: z
        .number()
        .int()
        .min(2004)
        .max(new Date().getFullYear()),
}).refine((data) => data.endYear >= data.startYear, {
    message: "End year must be after start year",
    path: ["endYear"],
});

export type TimeMachineInput = z.infer<typeof timeMachineSchema>;

// ============================================
// API Response Schemas
// ============================================

export const searchResultSchema = z.object({
    requestId: z.number(),
    status: z.enum(["processing", "completed", "failed"]),
});

export const clusterSchema = z.object({
    id: z.number(),
    label: z.number(),
    trendKeywords: z.array(z.string()),
    trendFinalScore: z.number(),
    trendLabel: z.string(),
    trendExplanation: z.string(),
    trendSearchScore: z.number(),
    trendMarketScore: z.number(),
    trendSlope: z.number(),
    trendVolatility: z.number(),
    trendSalesVolume: z.number(),
    trendSaturationRatio: z.number(),
    clusterSize: z.number(),
    minPrice: z.number(),
    maxPrice: z.number(),
    averagePrice: z.number(),
    averageSalesLastMonth: z.number(),
    averageRating: z.number(),
    averageReviewCount: z.number(),
    averageSearchRanking: z.number(),
    averageProductScore: z.number(),
});

export const productMetricsSchema = z.object({
    id: z.number(),
    keywordSearched: z.string(),
    platform: z.string(),
    uniqueId: z.string(),
    description: z.string(),
    price: z.number(),
    currency: z.string(),
    imageUrl: z.string(),
    platformCategory: z.string(),
    platformRegion: z.string(),
    rating: z.number(),
    reviewCount: z.number(),
    salesLastMonth: z.number(),
    searchRanking: z.number(),
    sponsored: z.boolean(),
    score: z.number(),
    clusterId: z.number().nullable(),
});

export type Cluster = z.infer<typeof clusterSchema>;
export type ProductMetrics = z.infer<typeof productMetricsSchema>;
