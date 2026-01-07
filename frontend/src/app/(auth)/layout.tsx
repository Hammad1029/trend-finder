/**
 * Auth Layout
 * 
 * Minimal layout for authentication pages (no navbar)
 */

import type { ReactNode } from "react";

interface AuthLayoutProps {
    children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
            <div className="w-full max-w-md px-4">
                {children}
            </div>
        </div>
    );
}
