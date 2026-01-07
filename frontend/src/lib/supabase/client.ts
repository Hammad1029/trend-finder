/**
 * Supabase Browser Client
 * 
 * Creates a Supabase client for client-side usage (Client Components)
 * Uses cookies for session management - NEVER localStorage!
 */

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}
