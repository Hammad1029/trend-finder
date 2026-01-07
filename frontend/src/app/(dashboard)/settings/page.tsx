/**
 * Settings Page
 * 
 * User account settings and preferences
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Settings, User, Bell, Shield, LogOut, Loader2 } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function SettingsPage() {
    const router = useRouter();
    const supabase = createClient();
    const [isLoading, setIsLoading] = useState(false);

    async function handleSignOut() {
        setIsLoading(true);
        try {
            await supabase.auth.signOut();
            router.push("/login");
            router.refresh();
        } catch (error) {
            toast.error("Failed to sign out");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Settings className="h-6 w-6 text-emerald-400" />
                    Settings
                </h1>
                <p className="text-sm text-zinc-500 mt-1">
                    Manage your account settings and preferences
                </p>
            </div>

            {/* Account Section */}
            <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Account
                    </CardTitle>
                    <CardDescription className="text-zinc-500">
                        Your account information and settings
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-zinc-300">
                            Email Address
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            disabled
                            placeholder="Loading..."
                            className="bg-zinc-800 border-zinc-700 text-zinc-400"
                        />
                        <p className="text-xs text-zinc-600">
                            Contact support to change your email address
                        </p>
                    </div>

                    <Separator className="bg-zinc-800" />

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-white">Password</p>
                            <p className="text-xs text-zinc-500">
                                Change your account password
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-zinc-700 text-zinc-300"
                        >
                            Change Password
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Subscription Section */}
            <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Subscription
                    </CardTitle>
                    <CardDescription className="text-zinc-500">
                        Your current plan and usage
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="text-lg font-semibold text-white">Free Plan</p>
                                <Badge className="bg-zinc-700 text-zinc-300">Current</Badge>
                            </div>
                            <p className="text-sm text-zinc-500 mt-1">
                                5 searches per month • Basic features
                            </p>
                        </div>
                        <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600">
                            Upgrade
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-zinc-500">Searches this month</span>
                            <span className="text-white">2 / 5</span>
                        </div>
                        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                                style={{ width: "40%" }}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Notifications Section */}
            <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Notifications
                    </CardTitle>
                    <CardDescription className="text-zinc-500">
                        Configure how you receive updates
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <NotificationToggle
                        title="Email notifications"
                        description="Receive search result updates via email"
                        defaultChecked={true}
                    />
                    <Separator className="bg-zinc-800" />
                    <NotificationToggle
                        title="Weekly digest"
                        description="Get a summary of trending products weekly"
                        defaultChecked={false}
                    />
                    <Separator className="bg-zinc-800" />
                    <NotificationToggle
                        title="Marketing emails"
                        description="Receive news and feature announcements"
                        defaultChecked={false}
                    />
                </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="bg-zinc-900/50 border-red-900/50">
                <CardHeader>
                    <CardTitle className="text-red-400">Danger Zone</CardTitle>
                    <CardDescription className="text-zinc-500">
                        Irreversible actions for your account
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-white">Sign Out</p>
                            <p className="text-xs text-zinc-500">
                                Sign out of your account on this device
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            onClick={handleSignOut}
                            disabled={isLoading}
                            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Sign Out
                                </>
                            )}
                        </Button>
                    </div>

                    <Separator className="bg-zinc-800" />

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-red-400">Delete Account</p>
                            <p className="text-xs text-zinc-500">
                                Permanently delete your account and all data
                            </p>
                        </div>
                        <Button
                            variant="destructive"
                            size="sm"
                            className="bg-red-900/50 hover:bg-red-900 border-red-900"
                        >
                            Delete Account
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function NotificationToggle({
    title,
    description,
    defaultChecked,
}: {
    title: string;
    description: string;
    defaultChecked: boolean;
}) {
    const [checked, setChecked] = useState(defaultChecked);

    return (
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-white">{title}</p>
                <p className="text-xs text-zinc-500">{description}</p>
            </div>
            <button
                onClick={() => setChecked(!checked)}
                className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors
          ${checked ? "bg-emerald-500" : "bg-zinc-700"}
        `}
            >
                <span
                    className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
            ${checked ? "translate-x-6" : "translate-x-1"}
          `}
                />
            </button>
        </div>
    );
}
