/**
 * Next.js Middleware for Supabase Auth
 * 
 * - Refreshes user session on every request
 * - Protects dashboard routes from unauthenticated access
 * - Redirects authenticated users away from auth pages
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Routes that require authentication
const protectedRoutes = ["/", "/search", "/history", "/settings"];

// Auth routes (login, signup, etc.)
const authRoutes = ["/login"];

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // IMPORTANT: DO NOT use getSession() here - it doesn't refresh tokens
    // Always use getUser() to validate the session server-side
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;

    // Check if the current route is protected
    const isProtectedRoute = protectedRoutes.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`)
    );

    // Check if the current route is an auth route
    const isAuthRoute = authRoutes.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`)
    );

    // Redirect unauthenticated users to login
    if (isProtectedRoute && !user) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("redirect", pathname);
        return NextResponse.redirect(url);
    }

    // Redirect authenticated users away from auth pages
    if (isAuthRoute && user) {
        const url = request.nextUrl.clone();
        const redirect = url.searchParams.get("redirect") || "/";
        url.pathname = redirect;
        url.searchParams.delete("redirect");
        return NextResponse.redirect(url);
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         * - api routes (handled separately)
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
