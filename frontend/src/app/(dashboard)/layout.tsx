/**
 * Dashboard Layout
 * 
 * Protected layout with navbar for authenticated users
 */

import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { getUser } from "@/lib/supabase/server";
import { Navbar } from "@/components/navbar";
import { QueryProvider } from "@/lib/react-query";
import { Toaster } from "@/components/ui/sonner";

interface DashboardLayoutProps {
    children: ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
    const user = await getUser();

    if (!user) {
        redirect("/login");
    }

    return (
        <QueryProvider>
            <div className="min-h-screen bg-zinc-950">
                <Navbar userEmail={user.email} />
                <main className="container mx-auto px-4 py-8">
                    {children}
                </main>
            </div>
            <Toaster richColors position="top-right" />
        </QueryProvider>
    );
}
