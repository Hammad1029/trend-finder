/**
 * Navbar Component
 * 
 * Main navigation bar for the dashboard
 */

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    TrendingUp,
    Search,
    History,
    Settings,
    LogOut,
    Menu,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface NavbarProps {
    userEmail?: string;
}

const navItems = [
    { href: "/", label: "Search", icon: Search },
    { href: "/history", label: "History", icon: History },
    { href: "/settings", label: "Settings", icon: Settings },
];

export function Navbar({ userEmail }: NavbarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    async function handleSignOut() {
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
    }

    const initials = userEmail
        ? userEmail
            .split("@")[0]
            .slice(0, 2)
            .toUpperCase()
        : "U";

    return (
        <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-900/95 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/80">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500">
                        <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-lg font-semibold text-white hidden sm:block">
                        TrendToy
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.href} href={item.href}>
                                <Button
                                    variant="ghost"
                                    className={cn(
                                        "gap-2 text-zinc-400 hover:text-white hover:bg-zinc-800",
                                        isActive && "text-white bg-zinc-800"
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    {item.label}
                                </Button>
                            </Link>
                        );
                    })}
                </nav>

                {/* User Menu (Desktop) */}
                <div className="hidden md:flex items-center gap-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="relative h-9 w-9 rounded-full hover:bg-zinc-800"
                            >
                                <Avatar className="h-9 w-9">
                                    <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-cyan-500 text-white text-sm font-medium">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="w-56 bg-zinc-900 border-zinc-800"
                        >
                            <div className="px-2 py-1.5">
                                <p className="text-sm font-medium text-white">{userEmail}</p>
                                <p className="text-xs text-zinc-500">Free Plan</p>
                            </div>
                            <DropdownMenuSeparator className="bg-zinc-800" />
                            <DropdownMenuItem
                                className="text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
                                onClick={() => router.push("/settings")}
                            >
                                <Settings className="mr-2 h-4 w-4" />
                                Settings
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-zinc-800" />
                            <DropdownMenuItem
                                className="text-red-400 hover:text-red-300 hover:bg-zinc-800 cursor-pointer"
                                onClick={handleSignOut}
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Sign Out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Mobile Menu */}
                <Sheet>
                    <SheetTrigger asChild className="md:hidden">
                        <Button variant="ghost" size="icon" className="text-zinc-400">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-64 bg-zinc-900 border-zinc-800 p-0">
                        <div className="flex flex-col h-full">
                            <div className="p-4 border-b border-zinc-800">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-cyan-500 text-white">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium text-white">{userEmail}</p>
                                        <p className="text-xs text-zinc-500">Free Plan</p>
                                    </div>
                                </div>
                            </div>

                            <nav className="flex-1 p-4 space-y-1">
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link key={item.href} href={item.href}>
                                            <Button
                                                variant="ghost"
                                                className={cn(
                                                    "w-full justify-start gap-3 text-zinc-400 hover:text-white hover:bg-zinc-800",
                                                    isActive && "text-white bg-zinc-800"
                                                )}
                                            >
                                                <Icon className="h-4 w-4" />
                                                {item.label}
                                            </Button>
                                        </Link>
                                    );
                                })}
                            </nav>

                            <div className="p-4 border-t border-zinc-800">
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-zinc-800"
                                    onClick={handleSignOut}
                                >
                                    <LogOut className="h-4 w-4" />
                                    Sign Out
                                </Button>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </header>
    );
}
